<?php
/**
 * "Settings" tab: company info, content selection, URL rules, generation rules, AI policy.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$llmsg_settings   = LLMS_Generator_Settings::get_settings();
$llmsg_post_types = get_post_types( array( 'public' => true ), 'objects' );
unset( $llmsg_post_types['attachment'] );
?>

<?php if ( isset( $_GET['updated'] ) ) : ?>
	<div class="notice notice-success is-dismissible">
		<p><?php esc_html_e( 'Settings saved.', 'hs3dev-llms-generator' ); ?></p>
	</div>
<?php endif; ?>

<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
	<input type="hidden" name="action" value="llmsg_save_settings">
	<?php wp_nonce_field( 'llmsg_settings_nonce' ); ?>

	<div class="llmsg-card">
		<h2><?php esc_html_e( 'Company Information', 'hs3dev-llms-generator' ); ?></h2>

		<table class="form-table">
			<tr>
				<th><label for="company_name"><?php esc_html_e( 'Company Name', 'hs3dev-llms-generator' ); ?></label></th>
				<td>
					<input type="text" id="company_name" name="company_name" class="regular-text" value="<?php echo esc_attr( $llmsg_settings['company_name'] ); ?>">
				</td>
			</tr>
			<tr>
				<th><label for="company_email"><?php esc_html_e( 'Company Email', 'hs3dev-llms-generator' ); ?></label></th>
				<td>
					<input type="email" id="company_email" name="company_email" class="regular-text" value="<?php echo esc_attr( $llmsg_settings['company_email'] ); ?>">
					<p class="description"><?php esc_html_e( 'Leave empty if you do not want the email displayed in llms.txt.', 'hs3dev-llms-generator' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label for="company_description"><?php esc_html_e( 'Company Description', 'hs3dev-llms-generator' ); ?></label></th>
				<td>
					<textarea id="company_description" name="company_description" class="large-text" rows="3"><?php echo esc_textarea( $llmsg_settings['company_description'] ); ?></textarea>
				</td>
			</tr>
		</table>
	</div>

	<div class="llmsg-card">
		<h2><?php esc_html_e( 'Content Summaries', 'hs3dev-llms-generator' ); ?></h2>

		<?php
		$llmsg_detected_seo_plugin = llmsg_detect_seo_plugin();
		?>

		<label>
			<input type="checkbox" name="include_meta_description" value="1" <?php checked( ! empty( $llmsg_settings['include_meta_description'] ) ); ?>>
			<?php esc_html_e( 'Include a description next to each entry in llms.txt', 'hs3dev-llms-generator' ); ?>
		</label>
		<p class="description"><?php esc_html_e( 'Unchecked: each entry shows only the heading and URL. Checked: each entry also shows a short description (controlled by the source priority below). This can also be toggled quickly from the Generate tab.', 'hs3dev-llms-generator' ); ?></p>

		<hr>

		<label>
			<input type="checkbox" name="use_seo_meta" value="1" <?php checked( ! empty( $llmsg_settings['use_seo_meta'] ) ); ?>>
			<?php esc_html_e( 'Use SEO meta description for summaries when available', 'hs3dev-llms-generator' ); ?>
		</label>

		<?php if ( $llmsg_detected_seo_plugin ) : ?>
			<p class="description">
				<?php
				printf(
					/* translators: %s: detected SEO plugin name */
					esc_html__( 'Detected: %s. When a meta description is set on an item, it will be used instead of the auto-generated summary.', 'hs3dev-llms-generator' ),
					esc_html( $llmsg_detected_seo_plugin )
				);
				?>
			</p>
		<?php else : ?>
			<p class="description"><?php esc_html_e( 'No supported SEO plugin detected (Yoast SEO, RankMath, All in One SEO, SEOPress). The post excerpt or an auto-generated summary will be used instead.', 'hs3dev-llms-generator' ); ?></p>
		<?php endif; ?>

		<p class="description"><?php esc_html_e( 'Priority order: SEO meta description, then the manual excerpt, then an auto-trimmed snippet of the content.', 'hs3dev-llms-generator' ); ?></p>

		<hr>

		<label>
			<input type="checkbox" name="compatibility_mode" value="1" <?php checked( ! empty( $llmsg_settings['compatibility_mode'] ) ); ?>>
			<?php esc_html_e( 'Compatibility mode: fetch each page\'s live URL instead of rendering content internally', 'hs3dev-llms-generator' ); ?>
		</label>
		<p class="description">
			<?php esc_html_e( 'Use this only if llms-full.txt looks garbled or missing content for pages built with a page builder (Elementor, WPBakery, UX Builder, etc.). It guarantees exactly what a visitor sees, but adds one HTTP request per item during generation, which is noticeably slower on large sites. Leave this off unless you\'ve confirmed the default output looks wrong.', 'hs3dev-llms-generator' ); ?>
		</p>
	</div>

	<div class="llmsg-card">
		<h2><?php esc_html_e( 'Post Types', 'hs3dev-llms-generator' ); ?></h2>
		<p class="description"><?php esc_html_e( 'Choose which content types to include. Click "Manage individual items" to exclude specific posts, pages or products.', 'hs3dev-llms-generator' ); ?></p>

		<div class="llmsg-posttype-list">
			<?php foreach ( $llmsg_post_types as $llmsg_post_type => $llmsg_obj ) :
				$llmsg_pt_settings  = isset( $llmsg_settings['post_types'][ $llmsg_post_type ] ) ? $llmsg_settings['post_types'][ $llmsg_post_type ] : array(
					'enabled'      => false,
					'excluded_ids' => array(),
				);
				$llmsg_enabled      = ! empty( $llmsg_pt_settings['enabled'] );
				$llmsg_excluded_ids = isset( $llmsg_pt_settings['excluded_ids'] ) ? (array) $llmsg_pt_settings['excluded_ids'] : array();
				?>
				<div class="llmsg-posttype-item">
					<div class="llmsg-posttype-header">
						<label>
							<input type="checkbox" name="post_types[<?php echo esc_attr( $llmsg_post_type ); ?>][enabled]" value="1" <?php checked( $llmsg_enabled ); ?>>
							<?php echo esc_html( $llmsg_obj->labels->name ); ?>
						</label>

						<button type="button" class="button-link llmsg-pt-expand" data-post-type="<?php echo esc_attr( $llmsg_post_type ); ?>">
							<?php esc_html_e( 'Manage individual items', 'hs3dev-llms-generator' ); ?>
						</button>
					</div>

					<input
						type="hidden"
						class="llmsg-excluded-ids"
						name="post_types[<?php echo esc_attr( $llmsg_post_type ); ?>][excluded_ids]"
						value="<?php echo esc_attr( implode( ',', $llmsg_excluded_ids ) ); ?>"
					>

					<div class="llmsg-posttype-items" data-post-type="<?php echo esc_attr( $llmsg_post_type ); ?>" style="display:none;">
						<p class="llmsg-loading"><?php esc_html_e( 'Loading...', 'hs3dev-llms-generator' ); ?></p>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>

	<div class="llmsg-card">
		<h2><?php esc_html_e( 'URL Rules', 'hs3dev-llms-generator' ); ?></h2>

		<table class="form-table">
			<tr>
				<th><label for="include_urls"><?php esc_html_e( 'Include URLs', 'hs3dev-llms-generator' ); ?></label></th>
				<td>
					<textarea id="include_urls" name="include_urls" class="large-text" rows="3" placeholder="https://example.com/custom-page/"><?php echo esc_textarea( $llmsg_settings['include_urls'] ); ?></textarea>
					<p class="description"><?php esc_html_e( 'One URL per line. These will be listed as additional pages in llms.txt, useful for pages outside the post types above.', 'hs3dev-llms-generator' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label for="exclude_urls"><?php esc_html_e( 'Exclude URLs', 'hs3dev-llms-generator' ); ?></label></th>
				<td>
					<textarea id="exclude_urls" name="exclude_urls" class="large-text" rows="3"><?php echo esc_textarea( $llmsg_settings['exclude_urls'] ); ?></textarea>
					<p class="description"><?php esc_html_e( 'One URL per line. Matching items will always be removed from the generated files, even if included by a post type above.', 'hs3dev-llms-generator' ); ?></p>
				</td>
			</tr>
		</table>
	</div>

	<div class="llmsg-card">
		<h2><?php esc_html_e( 'Generation', 'hs3dev-llms-generator' ); ?></h2>

		<table class="form-table">
			<tr>
				<th><label for="update_frequency"><?php esc_html_e( 'Update Frequency', 'hs3dev-llms-generator' ); ?></label></th>
				<td>
					<select id="update_frequency" name="update_frequency">
						<option value="manual" <?php selected( $llmsg_settings['update_frequency'], 'manual' ); ?>><?php esc_html_e( 'Manual only', 'hs3dev-llms-generator' ); ?></option>
						<option value="on_save" <?php selected( $llmsg_settings['update_frequency'], 'on_save' ); ?>><?php esc_html_e( 'When content is published or updated', 'hs3dev-llms-generator' ); ?></option>
						<option value="daily" <?php selected( $llmsg_settings['update_frequency'], 'daily' ); ?>><?php esc_html_e( 'Daily', 'hs3dev-llms-generator' ); ?></option>
						<option value="weekly" <?php selected( $llmsg_settings['update_frequency'], 'weekly' ); ?>><?php esc_html_e( 'Weekly', 'hs3dev-llms-generator' ); ?></option>
					</select>
					<p class="description"><?php esc_html_e( 'Automatic regeneration will be wired up to this setting in a later phase. For now, use the Generate tab to rebuild files manually.', 'hs3dev-llms-generator' ); ?></p>
				</td>
			</tr>
		</table>
	</div>

	<div class="llmsg-card">
		<h2><?php esc_html_e( 'AI Usage Policy', 'hs3dev-llms-generator' ); ?></h2>
		<textarea name="ai_policy" class="large-text" rows="4" placeholder="<?php esc_attr_e( 'e.g. Content may be used for training and citation with attribution to this site.', 'hs3dev-llms-generator' ); ?>"><?php echo esc_textarea( $llmsg_settings['ai_policy'] ); ?></textarea>
		<p class="description"><?php esc_html_e( 'This statement is included near the top of llms.txt to tell AI systems how they may use your content.', 'hs3dev-llms-generator' ); ?></p>
	</div>

	<div class="llmsg-card">
		<h2><?php esc_html_e( 'Analytics Settings', 'hs3dev-llms-generator' ); ?></h2>
		<label>
			<input type="checkbox" name="enable_logging" value="1" <?php checked( ! empty( $llmsg_settings['enable_logging'] ) ); ?>>
			<?php esc_html_e( 'Log requests to llms.txt and llms-full.txt (powers the Analytics tab)', 'hs3dev-llms-generator' ); ?>
		</label>
		<p class="description"><?php esc_html_e( 'Records the timestamp and user agent of each request so you can see which AI crawlers are reading your site. No personal data or IP addresses are stored.', 'hs3dev-llms-generator' ); ?></p>

		<p>
			<button type="button" class="button" id="llmsg-clear-logs-btn"><?php esc_html_e( 'Clear Analytics Data', 'hs3dev-llms-generator' ); ?></button>
			<span id="llmsg-clear-logs-status" class="llmsg-status"></span>
		</p>
	</div>


	<div class="llmsg-card">
		<h2><?php esc_html_e( 'Role Capabilities', 'hs3dev-llms-generator' ); ?></h2>
		<p class="description"><?php esc_html_e( 'Choose the minimum role that can view and manage this plugin\'s settings and trigger generation. Defaults to Administrator only.', 'hs3dev-llms-generator' ); ?></p>

		<select name="allowed_role">
			<option value="manage_options" <?php selected( $llmsg_settings['allowed_role'], 'manage_options' ); ?>><?php esc_html_e( 'Administrator only', 'hs3dev-llms-generator' ); ?></option>
			<option value="edit_others_posts" <?php selected( $llmsg_settings['allowed_role'], 'edit_others_posts' ); ?>><?php esc_html_e( 'Editor and above', 'hs3dev-llms-generator' ); ?></option>
			<option value="publish_posts" <?php selected( $llmsg_settings['allowed_role'], 'publish_posts' ); ?>><?php esc_html_e( 'Author and above', 'hs3dev-llms-generator' ); ?></option>
		</select>
		<p class="description"><?php esc_html_e( 'This takes effect immediately after saving. Make sure you keep at least one Administrator account, since lowering this does not remove Administrator access.', 'hs3dev-llms-generator' ); ?></p>
	</div>

	<?php if ( is_multisite() ) : ?>
		<div class="llmsg-card">
			<h2><?php esc_html_e( 'Multisite', 'hs3dev-llms-generator' ); ?></h2>
			<p class="description"><?php esc_html_e( 'This is a multisite network. Each site has its own independent settings, generated files, and analytics; there is no shared or network-wide llms.txt. Configure and generate separately on each site where you want llms.txt and llms-full.txt available.', 'hs3dev-llms-generator' ); ?></p>
		</div>
	<?php endif; ?>

	<p class="submit">
		<button type="submit" class="button button-primary button-hero"><?php esc_html_e( 'Save Settings', 'hs3dev-llms-generator' ); ?></button>
	</p>
</form>
