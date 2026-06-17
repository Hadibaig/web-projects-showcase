<?php
/**
 * Builds the actual llms.txt and llms-full.txt content based on settings.
 *
 * Generation is batched: a queue of post IDs is built once and stored in a
 * transient, then processed in fixed-size chunks across multiple requests
 * so large sites (thousands of posts/products) don't hit PHP's
 * max_execution_time or memory limits in a single run.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Returns the capability required to view/manage this plugin's settings and
 * trigger generation. Defaults to 'manage_options' (Administrators only),
 * but can be relaxed to 'edit_others_posts' (Editors) or 'publish_posts'
 * (Authors) via the Role Capabilities setting, so site owners can delegate
 * this without granting full admin access.
 *
 * @return string
 */
function llmsg_required_capability() {
	$settings = LLMS_Generator_Settings::get_settings();
	$cap      = isset( $settings['allowed_role'] ) ? $settings['allowed_role'] : 'manage_options';

	$allowed_caps = array( 'manage_options', 'edit_others_posts', 'publish_posts' );

	return in_array( $cap, $allowed_caps, true ) ? $cap : 'manage_options';
}

/**
 * Detects which supported SEO plugin is currently active, if any.
 *
 * Used to show the user which plugin's meta description will be pulled
 * from, and could be extended later if support for more plugins is added.
 *
 * @return string Plugin label, or empty string if none detected.
 */
function llmsg_detect_seo_plugin() {
	if ( defined( 'WPSEO_VERSION' ) ) {
		return 'Yoast SEO';
	}

	if ( class_exists( 'RankMath' ) ) {
		return 'RankMath';
	}

	if ( defined( 'AIOSEO_VERSION' ) || class_exists( 'AIOSEO\\Plugin\\AIOSEO' ) ) {
		return 'All in One SEO';
	}

	if ( defined( 'SEOPRESS_VERSION' ) ) {
		return 'SEOPress';
	}

	return '';
}

class LLMS_Generator_Core {

	const CONTENT_OPTION  = 'llmsg_generated_content';
	const PROGRESS_OPTION = 'llmsg_generation_progress';
	const BATCH_SIZE      = 25;

	/**
	 * Runs a full, non-batched generation in a single call.
	 *
	 * Kept for small sites, WP-CLI, and cron, where there is no AJAX loop
	 * driving batches from the browser. Internally just drains the queue
	 * started by start_generation() in one go.
	 *
	 * @return array
	 */
	public static function generate() {
		self::raise_resource_limits();

		if ( LLMS_Generator_Multilingual::is_active() ) {
			return self::generate_all_languages();
		}

		self::start_generation();

		do {
			$progress = self::process_batch();
		} while ( ! $progress['done'] );

		return self::get_generated();
	}

	/**
	 * Runs a full generation pass once per active language (WPML/Polylang),
	 * storing a separate llms.txt / llms-full.txt for each. Used by the
	 * synchronous (cron/CLI) path; the AJAX batch path handles multilingual
	 * the same way one language at a time via start_generation( $lang ).
	 *
	 * @return array Generated content for the default language (for backward-compatible callers).
	 */
	protected static function generate_all_languages() {
		$languages = LLMS_Generator_Multilingual::get_languages();
		$default   = LLMS_Generator_Multilingual::get_default_language();

		if ( empty( $languages ) ) {
			// Plugin detected but no languages reported; fall back to single-language behavior.
			self::start_generation();
			do {
				$progress = self::process_batch();
			} while ( ! $progress['done'] );

			return self::get_generated();
		}

		foreach ( $languages as $lang_code ) {
			self::start_generation( $lang_code );
			do {
				$progress = self::process_batch( $lang_code );
			} while ( ! $progress['done'] );
		}

		return self::get_generated( $default );
	}

	/**
	 * Attempts to raise PHP's execution time and memory limits for the
	 * duration of a full synchronous generation run (used by cron and
	 * WP-CLI). Wrapped in function_exists/ini_get checks since some hosts
	 * disable these and we don't want a fatal error on locked-down setups.
	 */
	protected static function raise_resource_limits() {
		if ( function_exists( 'set_time_limit' ) ) {
			// Best-effort only: many hosts disable this, hence the function_exists
			// check and @ suppression rather than relying on it being available.
			@set_time_limit( 300 ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged
		}

		$current_limit = ini_get( 'memory_limit' );
		if ( $current_limit && wp_convert_hr_to_bytes( $current_limit ) < wp_convert_hr_to_bytes( '256M' ) ) {
			// Best-effort only: some hosts lock memory_limit and silently ignore this.
			@ini_set( 'memory_limit', '256M' ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged
		}
	}

	/**
	 * Begins a new generation run: builds the full queue of post IDs and
	 * resets progress/partial-content storage. Cheap operation, safe to run
	 * synchronously even on large sites since it only queries IDs.
	 *
	 * @return array Initial progress state.
	 */
	public static function start_generation( $lang_code = '' ) {
		if ( $lang_code ) {
			LLMS_Generator_Multilingual::switch_to_language( $lang_code );
		}

		$settings = LLMS_Generator_Settings::get_settings();
		$queue    = self::build_queue( $settings );

		if ( $lang_code ) {
			LLMS_Generator_Multilingual::restore_language();
		}

		$progress = array(
			'queue'         => $queue,
			'lang_code'     => $lang_code,
			'total'         => count( $queue ),
			'processed'     => 0,
			'llms_lines'    => array(),
			'full_lines'    => array(),
			'grouped_index' => array(), // post_type => [lines] for llms.txt grouping.
			'done'          => false,
		);

		set_transient( self::progress_key( $lang_code ), $progress, HOUR_IN_SECONDS );

		return array(
			'total'     => $progress['total'],
			'processed' => 0,
			'done'      => 0 === $progress['total'],
		);
	}

	/**
	 * Returns the transient key used to store in-progress generation state,
	 * namespaced by language when multilingual support is in use.
	 *
	 * @param string $lang_code Language code, or empty for the default/single-language run.
	 *
	 * @return string
	 */
	protected static function progress_key( $lang_code = '' ) {
		return $lang_code ? self::PROGRESS_OPTION . '_' . $lang_code : self::PROGRESS_OPTION;
	}

	/**
	 * Returns the option key used to store finished content, namespaced by
	 * language when multilingual support is in use.
	 *
	 * @param string $lang_code Language code, or empty for the default/single-language run.
	 *
	 * @return string
	 */
	protected static function content_key( $lang_code = '' ) {
		return $lang_code ? self::CONTENT_OPTION . '_' . $lang_code : self::CONTENT_OPTION;
	}

	/**
	 * Processes one batch of posts from the queue and appends results to
	 * the in-progress transient. When the queue is empty, finalizes both
	 * files into the permanent option and clears the progress transient.
	 *
	 * @return array Progress state: total, processed, done.
	 */
	public static function process_batch( $lang_code = '' ) {
		$progress = get_transient( self::progress_key( $lang_code ) );

		if ( false === $progress ) {
			// No run in progress; nothing to do.
			return array(
				'total'     => 0,
				'processed' => 0,
				'done'      => true,
			);
		}

		if ( $lang_code ) {
			LLMS_Generator_Multilingual::switch_to_language( $lang_code );
		}

		$settings = LLMS_Generator_Settings::get_settings();
		$batch    = array_splice( $progress['queue'], 0, self::BATCH_SIZE );

		foreach ( $batch as $post_id ) {
			$post = get_post( $post_id );

			if ( ! $post ) {
				continue;
			}

			$post_type = $post->post_type;
			if ( ! isset( $progress['grouped_index'][ $post_type ] ) ) {
				$progress['grouped_index'][ $post_type ] = array();
			}
			$progress['grouped_index'][ $post_type ][] = self::build_llms_txt_line( $post, $settings );

			$progress['full_lines'][] = self::build_full_txt_block( $post );
		}

		$progress['processed'] += count( $batch );

		$done = empty( $progress['queue'] );
		$progress['done'] = $done;

		if ( $done ) {
			$data = array(
				'llms_txt'      => self::assemble_llms_txt( $settings, $progress['grouped_index'] ),
				'llms_full_txt' => self::assemble_llms_full_txt( $settings, $progress['full_lines'] ),
				'generated_at'  => current_time( 'mysql' ),
			);

			// 'no' autoload: this can be a multi-MB blob on large sites and
			// is only needed when /llms.txt or /llms-full.txt is requested,
			// not on every front-end page load.
			update_option( self::content_key( $lang_code ), $data, false );
			delete_transient( self::progress_key( $lang_code ) );
		} else {
			set_transient( self::progress_key( $lang_code ), $progress, HOUR_IN_SECONDS );
		}

		if ( $lang_code ) {
			LLMS_Generator_Multilingual::restore_language();
		}

		return array(
			'total'     => $progress['total'],
			'processed' => $progress['processed'],
			'done'      => $done,
		);
	}

	/**
	 * Cancels any generation run currently in progress.
	 */
	public static function cancel_generation( $lang_code = '' ) {
		delete_transient( self::progress_key( $lang_code ) );
	}

	/**
	 * Returns the last generated content (or empty placeholders).
	 *
	 * @return array
	 */
	public static function get_generated( $lang_code = '' ) {
		$defaults = array(
			'llms_txt'      => '',
			'llms_full_txt' => '',
			'generated_at'  => '',
		);

		$stored = get_option( self::content_key( $lang_code ), array() );

		return wp_parse_args( $stored, $defaults );
	}

	/**
	 * Builds the flat list of post IDs to process, based on enabled post
	 * types, per-item exclusions, and excluded URLs. This is the only part
	 * of generation that runs as a single (cheap, ID-only) query per post
	 * type; the expensive per-post content rendering happens in batches.
	 *
	 * @param array $settings Plugin settings.
	 *
	 * @return int[]
	 */
	protected static function build_queue( $settings ) {
		$ids = array();

		if ( empty( $settings['post_types'] ) || ! is_array( $settings['post_types'] ) ) {
			return $ids;
		}

		$exclude_urls = self::parse_url_list( $settings['exclude_urls'] ?? '' );

		foreach ( $settings['post_types'] as $post_type => $config ) {

			if ( empty( $config['enabled'] ) || ! post_type_exists( $post_type ) ) {
				continue;
			}

			$excluded_ids = isset( $config['excluded_ids'] ) ? array_map( 'absint', (array) $config['excluded_ids'] ) : array();

			$query_args = array(
				'post_type'      => $post_type,
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'orderby'        => 'title',
				'order'          => 'ASC',
				'no_found_rows'  => true,
				'fields'         => 'ids',
			);

			if ( ! empty( $excluded_ids ) ) {
				// post__not_in is intentional here: per-item exclusion (letting
				// users uncheck individual posts/pages/products while keeping
				// the rest of that post type included) is a core feature of
				// this plugin, and there's no equivalent non-exclusionary
				// WP_Query parameter that achieves the same result. This runs
				// against a single site's own content, not VIP-scale datasets.
				$query_args['post__not_in'] = $excluded_ids; // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in
			}

			$type_ids = get_posts( $query_args );

			if ( ! empty( $exclude_urls ) ) {
				$type_ids = array_filter(
					$type_ids,
					function ( $id ) use ( $exclude_urls ) {
						return ! in_array( get_permalink( $id ), $exclude_urls, true );
					}
				);
			}

			$ids = array_merge( $ids, array_values( $type_ids ) );
		}

		return $ids;
	}

	/**
	 * Builds a single llms.txt list-item line for one post.
	 *
	 * @param WP_Post $post     Post object.
	 * @param array   $settings Plugin settings.
	 *
	 * @return string
	 */
	protected static function build_llms_txt_line( $post, $settings ) {
		$title = get_the_title( $post );
		$url   = get_permalink( $post );

		$line = '- [' . $title . '](' . $url . ')';

		if ( ! empty( $settings['include_meta_description'] ) ) {
			$summary = self::get_short_summary( $post, $settings );
			if ( $summary ) {
				$line .= ': ' . $summary;
			}
		}

		return $line;
	}

	/**
	 * Builds the llms-full.txt block (heading, URL, full content) for one post.
	 *
	 * @param WP_Post $post Post object.
	 *
	 * @return string
	 */
	protected static function build_full_txt_block( $post ) {
		$lines   = array();
		$lines[] = '## ' . get_the_title( $post );
		$lines[] = 'URL: ' . get_permalink( $post );
		$lines[] = '';
		$lines[] = self::get_clean_content( $post );
		$lines[] = '';
		$lines[] = '---';

		return implode( "\n", $lines );
	}

	/**
	 * Assembles the final llms.txt from the header/settings plus the
	 * per-post-type grouped lines collected across all batches.
	 *
	 * @param array $settings      Plugin settings.
	 * @param array $grouped_index post_type => string[] of list-item lines.
	 *
	 * @return string
	 */
	protected static function assemble_llms_txt( $settings, $grouped_index ) {
		$lines = array();

		$site_name = ! empty( $settings['company_name'] ) ? $settings['company_name'] : get_bloginfo( 'name' );
		$lines[]   = '# ' . $site_name;

		$description = ! empty( $settings['company_description'] ) ? $settings['company_description'] : get_bloginfo( 'description' );
		if ( $description ) {
			$lines[] = '';
			$lines[] = '> ' . $description;
		}

		if ( ! empty( $settings['company_email'] ) ) {
			$lines[] = '';
			$lines[] = 'Contact: ' . $settings['company_email'];
		}

		if ( ! empty( $settings['ai_policy'] ) ) {
			$lines[] = '';
			$lines[] = '## AI Usage Policy';
			$lines[] = $settings['ai_policy'];
		}

		foreach ( $grouped_index as $post_type => $type_lines ) {
			$obj   = get_post_type_object( $post_type );
			$label = $obj ? $obj->labels->name : $post_type;

			$lines[] = '';
			$lines[] = '## ' . $label;
			$lines   = array_merge( $lines, $type_lines );
		}

		$include_urls = self::parse_url_list( $settings['include_urls'] ?? '' );
		if ( ! empty( $include_urls ) ) {
			$lines[] = '';
			$lines[] = '## Additional Pages';
			foreach ( $include_urls as $url ) {
				$lines[] = '- ' . $url;
			}
		}

		return implode( "\n", $lines );
	}

	/**
	 * Assembles the final llms-full.txt from the header plus per-post blocks
	 * collected across all batches.
	 *
	 * @param array    $settings   Plugin settings.
	 * @param string[] $full_lines Pre-built per-post blocks.
	 *
	 * @return string
	 */
	protected static function assemble_llms_full_txt( $settings, $full_lines ) {
		$lines = array();

		$site_name = ! empty( $settings['company_name'] ) ? $settings['company_name'] : get_bloginfo( 'name' );
		$lines[]   = '# ' . $site_name . ' - Full Content';
		$lines[]   = '';

		foreach ( $full_lines as $block ) {
			$lines[] = $block;
			$lines[] = '';
		}

		return implode( "\n", $lines );
	}

	/**
	 * Returns a short plain-text summary for a post, using the best available source:
	 * 1. SEO plugin meta description (Yoast, RankMath, AIOSEO, SEOPress), if set.
	 * 2. The manually written post excerpt, if set.
	 * 3. An auto-trimmed snippet of the rendered content, as a last resort.
	 *
	 * @param WP_Post $post     Post object.
	 * @param array   $settings Plugin settings (passed in to avoid re-fetching per post in a batch).
	 *
	 * @return string
	 */
	protected static function get_short_summary( $post, $settings = null ) {
		if ( null === $settings ) {
			$settings = LLMS_Generator_Settings::get_settings();
		}

		if ( ! empty( $settings['use_seo_meta'] ) ) {
			$meta_description = self::get_seo_meta_description( $post->ID );
			if ( $meta_description ) {
				return $meta_description;
			}
		}

		if ( ! empty( $post->post_excerpt ) ) {
			return wp_strip_all_tags( $post->post_excerpt );
		}

		return wp_trim_words( self::get_clean_content( $post ), 25, '...' );
	}

	/**
	 * Checks common SEO plugin post-meta keys for a manually set meta description.
	 *
	 * Supports Yoast SEO, RankMath, All in One SEO, and SEOPress. Returns the
	 * first non-empty value found, or an empty string if none of these
	 * plugins are active or no description was set for this item.
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return string
	 */
	protected static function get_seo_meta_description( $post_id ) {
		$meta_keys = array(
			'_yoast_wpseo_metadesc',  // Yoast SEO.
			'rank_math_description',  // RankMath.
			'_aioseo_description',    // All in One SEO.
			'_seopress_titles_desc',  // SEOPress.
		);

		foreach ( $meta_keys as $key ) {
			$value = get_post_meta( $post_id, $key, true );
			if ( ! empty( $value ) ) {
				return wp_strip_all_tags( $value );
			}
		}

		return '';
	}

	/**
	 * Returns the rendered post content as clean plain text.
	 *
	 * Two modes:
	 * - Default: runs content through the_content filter in-process, so
	 *   output from page builders (Elementor, WPBakery, UX Builder, etc.)
	 *   is rendered correctly rather than dumping raw shortcodes. Fast,
	 *   no extra HTTP requests, works for the vast majority of builders.
	 * - Compatibility mode: fetches the actual published URL with
	 *   wp_remote_get() and extracts the main content from the returned
	 *   HTML. Slower (one HTTP request per item) but guarantees an exact
	 *   match to what a visitor actually sees, for builders that don't
	 *   render correctly through the_content alone.
	 *
	 * @param WP_Post $post Post object.
	 *
	 * @return string
	 */
	protected static function get_clean_content( $post ) {
		$settings = LLMS_Generator_Settings::get_settings();

		if ( ! empty( $settings['compatibility_mode'] ) ) {
			$fetched = self::get_content_via_live_fetch( $post );
			if ( false !== $fetched ) {
				return $fetched;
			}
			// Fall through to the fast path if the fetch failed for any reason.
		}

		$content = apply_filters( 'the_content', $post->post_content );
		$content = wp_strip_all_tags( $content );
		$content = preg_replace( '/\n\s*\n/', "\n\n", $content );

		return trim( $content );
	}

	/**
	 * Fetches a post's live published URL and extracts plain text from its
	 * main content area. Used by "compatibility mode" for page builders
	 * that don't render correctly through the_content in-process.
	 *
	 * @param WP_Post $post Post object.
	 *
	 * @return string|false Clean text, or false if the fetch/parse failed.
	 */
	protected static function get_content_via_live_fetch( $post ) {
		$url = get_permalink( $post );

		if ( ! $url ) {
			return false;
		}

		$response = wp_remote_get(
			$url,
			array(
				'timeout'   => 15,
				'sslverify' => false,
			)
		);

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		$html = wp_remote_retrieve_body( $response );

		if ( empty( $html ) ) {
			return false;
		}

		return self::extract_main_content( $html );
	}

	/**
	 * Extracts plain text from the most likely "main content" container in
	 * a page's rendered HTML, falling back to the full body if no
	 * recognizable container is found. Uses DOMDocument rather than regex
	 * since regex-based HTML parsing is unreliable for nested markup.
	 *
	 * @param string $html Raw HTML of the page.
	 *
	 * @return string
	 */
	protected static function extract_main_content( $html ) {
		$doc = new DOMDocument();

		// Suppress warnings from malformed HTML, which is common and not fatal here.
		$internal_errors = libxml_use_internal_errors( true );
		$doc->loadHTML( '<?xml encoding="utf-8" ?>' . $html );
		libxml_use_internal_errors( $internal_errors );

		$xpath = new DOMXPath( $doc );

		// Strip elements that are never part of the actual article content.
		$strip_tags = array( 'script', 'style', 'nav', 'header', 'footer', 'noscript', 'form' );
		foreach ( $strip_tags as $tag ) {
			$nodes = $doc->getElementsByTagName( $tag );
			for ( $i = $nodes->length - 1; $i >= 0; $i-- ) {
				$node = $nodes->item( $i );
				if ( $node && $node->parentNode ) {
					$node->parentNode->removeChild( $node );
				}
			}
		}

		// Try common main-content selectors, in priority order, before falling back to <body>.
		$candidates = array(
			"//main",
			"//*[@id='content']",
			"//*[@id='main']",
			"//*[contains(@class, 'entry-content')]",
			"//*[contains(@class, 'post-content')]",
			"//*[contains(@class, 'page-content')]",
			"//article",
		);

		$target = null;
		foreach ( $candidates as $query ) {
			$nodes = $xpath->query( $query );
			if ( $nodes && $nodes->length > 0 ) {
				$target = $nodes->item( 0 );
				break;
			}
		}

		if ( ! $target ) {
			$body_nodes = $doc->getElementsByTagName( 'body' );
			$target     = $body_nodes->length > 0 ? $body_nodes->item( 0 ) : null;
		}

		if ( ! $target ) {
			return '';
		}

		$text = $target->textContent;
		$text = preg_replace( '/[ \t]+/', ' ', $text );
		$text = preg_replace( '/\n\s*\n/', "\n\n", $text );

		return trim( $text );
	}

	/**
	 * Splits a textarea value into an array of trimmed, non-empty lines.
	 *
	 * @param string $raw Raw textarea content.
	 *
	 * @return string[]
	 */
	protected static function parse_url_list( $raw ) {
		if ( empty( $raw ) ) {
			return array();
		}

		return array_values( array_filter( array_map( 'trim', explode( "\n", $raw ) ) ) );
	}
}
