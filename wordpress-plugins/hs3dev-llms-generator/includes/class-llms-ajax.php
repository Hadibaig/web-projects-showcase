<?php
/**
 * AJAX endpoints used by the admin UI.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LLMS_Generator_Ajax {

	public function __construct() {
		add_action( 'wp_ajax_llmsg_generate', array( $this, 'generate' ) );
		add_action( 'wp_ajax_llmsg_generate_start', array( $this, 'generate_start' ) );
		add_action( 'wp_ajax_llmsg_generate_batch', array( $this, 'generate_batch' ) );
		add_action( 'wp_ajax_llmsg_get_posts', array( $this, 'get_posts' ) );
		add_action( 'wp_ajax_llmsg_clear_logs', array( $this, 'clear_logs' ) );
		add_action( 'wp_ajax_llmsg_verify_live', array( $this, 'verify_live' ) );
		add_action( 'wp_ajax_llmsg_get_languages', array( $this, 'get_languages' ) );
	}

	/**
	 * Checks whether the live public URL actually matches what this plugin
	 * has stored, and reports physical file conflicts. Used by the "Verify"
	 * button on the Generate tab.
	 */
	public function verify_live() {
		check_ajax_referer( 'llmsg_nonce', 'nonce' );

		if ( ! current_user_can( llmsg_required_capability() ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'hs3dev-llms-generator' ) ) );
		}

		$file_type = isset( $_POST['file_type'] ) ? sanitize_key( wp_unslash( $_POST['file_type'] ) ) : 'llms';

		$physical = LLMS_Generator_Diagnostics::check_physical_files();
		$live     = LLMS_Generator_Diagnostics::verify_live_url( $file_type );

		wp_send_json_success(
			array(
				'physical' => $physical,
				'live'     => $live,
			)
		);
	}

	/**
	 * Legacy single-call generation. Still used by cron and small sites;
	 * internally drains the same batch queue in one request.
	 */
	public function generate() {
		check_ajax_referer( 'llmsg_nonce', 'nonce' );

		if ( ! current_user_can( llmsg_required_capability() ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'hs3dev-llms-generator' ) ) );
		}

		$data = LLMS_Generator_Core::generate();

		wp_send_json_success( $data );
	}

	/**
	 * Starts a new batched generation run and returns the total item count
	 * so the browser can show a progress bar. Accepts an optional lang_code
	 * for multilingual sites (WPML/Polylang); the browser drives one
	 * language at a time through repeated calls.
	 */
	public function generate_start() {
		check_ajax_referer( 'llmsg_nonce', 'nonce' );

		if ( ! current_user_can( llmsg_required_capability() ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'hs3dev-llms-generator' ) ) );
		}

		$lang_code = isset( $_POST['lang_code'] ) ? sanitize_key( wp_unslash( $_POST['lang_code'] ) ) : '';

		// The "Include meta description" checkbox on the Generate tab is
		// saved here so it's honored by this run and by any future
		// auto-regeneration (cron), without requiring a trip to Settings.
		if ( isset( $_POST['include_meta_description'] ) ) {
			$current_settings                             = LLMS_Generator_Settings::get_settings();
			$current_settings['include_meta_description'] = ( 'true' === $_POST['include_meta_description'] || '1' === $_POST['include_meta_description'] );
			LLMS_Generator_Settings::update_settings( $current_settings );
		}

		$progress = LLMS_Generator_Core::start_generation( $lang_code );

		wp_send_json_success( $progress );
	}

	/**
	 * Processes a single batch of the in-progress generation run. The
	 * browser calls this repeatedly until "done" is true. Once done, the
	 * generated llms.txt / llms-full.txt content is included in the response.
	 */
	public function generate_batch() {
		check_ajax_referer( 'llmsg_nonce', 'nonce' );

		if ( ! current_user_can( llmsg_required_capability() ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'hs3dev-llms-generator' ) ) );
		}

		$lang_code = isset( $_POST['lang_code'] ) ? sanitize_key( wp_unslash( $_POST['lang_code'] ) ) : '';

		$progress = LLMS_Generator_Core::process_batch( $lang_code );

		if ( $progress['done'] ) {
			$progress = array_merge( $progress, LLMS_Generator_Core::get_generated( $lang_code ) );
		}

		wp_send_json_success( $progress );
	}

	/**
	 * Returns the list of active languages (if WPML/Polylang is active),
	 * used by the Generate tab to drive one generation run per language.
	 */
	public function get_languages() {
		check_ajax_referer( 'llmsg_nonce', 'nonce' );

		if ( ! current_user_can( llmsg_required_capability() ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'hs3dev-llms-generator' ) ) );
		}

		wp_send_json_success(
			array(
				'active'    => LLMS_Generator_Multilingual::is_active(),
				'plugin'    => LLMS_Generator_Multilingual::detect_plugin(),
				'languages' => LLMS_Generator_Multilingual::get_languages(),
				'default'   => LLMS_Generator_Multilingual::get_default_language(),
			)
		);
	}

	/**
	 * Returns a list of published posts for a given post type, used to build
	 * the per-item exclusion checkboxes on the Settings tab.
	 */
	public function get_posts() {
		check_ajax_referer( 'llmsg_nonce', 'nonce' );

		if ( ! current_user_can( llmsg_required_capability() ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'hs3dev-llms-generator' ) ) );
		}

		$post_type = isset( $_POST['post_type'] ) ? sanitize_key( wp_unslash( $_POST['post_type'] ) ) : '';

		if ( ! $post_type || ! post_type_exists( $post_type ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid post type.', 'hs3dev-llms-generator' ) ) );
		}

		$query = new WP_Query(
			array(
				'post_type'      => $post_type,
				'post_status'    => 'publish',
				'posts_per_page' => 300,
				'orderby'        => 'title',
				'order'          => 'ASC',
				'no_found_rows'  => true,
			)
		);

		$items = array();
		foreach ( $query->posts as $post ) {
			$title    = get_the_title( $post );
			$items[] = array(
				'id'    => $post->ID,
				'title' => '' !== $title ? $title : __( '(no title)', 'hs3dev-llms-generator' ),
			);
		}

		wp_reset_postdata();

		wp_send_json_success( array( 'items' => $items ) );
	}
}
