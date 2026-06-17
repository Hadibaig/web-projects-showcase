<?php
/**
 * "Generate" tab: trigger generation and preview the resulting files.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$llmsg_generated     = LLMS_Generator_Core::get_generated();
$llmsg_settings      = LLMS_Generator_Settings::get_settings();
$llmsg_physical      = LLMS_Generator_Diagnostics::check_physical_files();
$llmsg_ml_active     = LLMS_Generator_Multilingual::is_active();
$llmsg_ml_plugin     = LLMS_Generator_Multilingual::detect_plugin();
$llmsg_ml_languages  = $llmsg_ml_active ? LLMS_Generator_Multilingual::get_languages() : array();
$llmsg_ml_default    = $llmsg_ml_active ? LLMS_Generator_Multilingual::get_default_language() : '';
?>

<?php if ( $llmsg_physical['llms'] || $llmsg_physical['llms_full'] ) : ?>
	<div class="notice notice-warning llmsg-physical-warning">
		<p>
			<strong><?php esc_html_e( 'Heads up:', 'hs3dev-llms-generator' ); ?></strong>
			<?php
			if ( $llmsg_physical['llms'] && $llmsg_physical['llms_full'] ) {
				esc_html_e( 'Physical llms.txt and llms-full.txt files were found in your site\'s root folder. These static files will override what this plugin generates. Delete or rename them via FTP/File Manager, then the live URLs will reflect this plugin\'s output.', 'hs3dev-llms-generator' );
			} elseif ( $llmsg_physical['llms'] ) {
				esc_html_e( 'A physical llms.txt file was found in your site\'s root folder. This static file will override what this plugin generates at /llms.txt. Delete or rename it via FTP/File Manager.', 'hs3dev-llms-generator' );
			} else {
				esc_html_e( 'A physical llms-full.txt file was found in your site\'s root folder. This static file will override what this plugin generates at /llms-full.txt. Delete or rename it via FTP/File Manager.', 'hs3dev-llms-generator' );
			}
			?>
		</p>
	</div>
<?php endif; ?>

<div class="llmsg-card">
	<h2><?php esc_html_e( 'Generate LLMS Files', 'hs3dev-llms-generator' ); ?></h2>
	<p><?php esc_html_e( 'Click the button below to build llms.txt and llms-full.txt based on the content and rules configured in the Settings tab.', 'hs3dev-llms-generator' ); ?></p>

	<?php if ( $llmsg_ml_active && ! empty( $llmsg_ml_languages ) ) : ?>
		<p class="description">
			<?php
			printf(
				/* translators: %s: detected multilingual plugin name */
				esc_html__( 'Multilingual site detected (%s). Choose a language to generate for, or generate all languages at once.', 'hs3dev-llms-generator' ),
				esc_html( 'wpml' === $llmsg_ml_plugin ? 'WPML' : 'Polylang' )
			);
			?>
		</p>

		<select id="llmsg-language-select">
			<option value=""><?php esc_html_e( 'All languages', 'hs3dev-llms-generator' ); ?></option>
			<?php foreach ( $llmsg_ml_languages as $llmsg_lang_code ) : ?>
				<option value="<?php echo esc_attr( $llmsg_lang_code ); ?>" <?php selected( $llmsg_lang_code, $llmsg_ml_default ); ?>>
					<?php echo esc_html( strtoupper( $llmsg_lang_code ) ); ?><?php echo ( $llmsg_lang_code === $llmsg_ml_default ) ? ' (' . esc_html__( 'default', 'hs3dev-llms-generator' ) . ')' : ''; ?>
				</option>
			<?php endforeach; ?>
		</select>
		<br><br>
	<?php endif; ?>

	<button type="button" class="button button-primary" id="llmsg-generate-btn">
		<?php esc_html_e( 'Generate Files', 'hs3dev-llms-generator' ); ?>
	</button>

	<p class="llmsg-meta-toggle">
		<label>
			<input type="checkbox" id="llmsg-include-meta" <?php checked( ! empty( $llmsg_settings['include_meta_description'] ) ); ?>>
			<?php esc_html_e( 'Include meta description in llms.txt', 'hs3dev-llms-generator' ); ?>
		</label>
		<br>
		<span class="description"><?php esc_html_e( 'Checked: each entry shows heading, URL, and a short description. Unchecked: each entry shows just the heading and URL.', 'hs3dev-llms-generator' ); ?></span>
	</p>

	<span id="llmsg-generate-status" class="llmsg-status"></span>

	<div id="llmsg-progress-wrap" class="llmsg-progress-wrap" style="display:none;">
		<div class="llmsg-progress-track">
			<div id="llmsg-progress-bar" class="llmsg-progress-bar"></div>
		</div>
		<span id="llmsg-progress-text" class="llmsg-progress-text"></span>
	</div>

	<p class="llmsg-last-generated" id="llmsg-last-generated">
		<?php if ( ! empty( $llmsg_generated['generated_at'] ) ) : ?>
			<?php
			printf(
				/* translators: %s: date and time of last generation */
				esc_html__( 'Last generated: %s', 'hs3dev-llms-generator' ),
				esc_html( $llmsg_generated['generated_at'] )
			);
			?>
		<?php else : ?>
			<?php esc_html_e( 'Files have not been generated yet.', 'hs3dev-llms-generator' ); ?>
		<?php endif; ?>
	</p>
</div>

<div class="llmsg-card-row">
	<div class="llmsg-card llmsg-file-card">
		<h3>llms.txt</h3>
		<p class="llmsg-file-url"><?php echo esc_html( home_url( '/llms.txt' ) ); ?></p>
		<a href="<?php echo esc_url( home_url( '/llms.txt' ) ); ?>" target="_blank" class="button">
			<?php esc_html_e( 'Open', 'hs3dev-llms-generator' ); ?>
		</a>
		<button type="button" class="button button-secondary llmsg-view-btn" data-target="llms_txt">
			<?php esc_html_e( 'View', 'hs3dev-llms-generator' ); ?>
		</button>
		<button type="button" class="button button-secondary llmsg-verify-btn" data-file-type="llms">
			<?php esc_html_e( 'Verify Live File', 'hs3dev-llms-generator' ); ?>
		</button>
		<div class="llmsg-verify-result" data-file-type="llms"></div>
	</div>

	<div class="llmsg-card llmsg-file-card">
		<h3>llms-full.txt</h3>
		<p class="llmsg-file-url"><?php echo esc_html( home_url( '/llms-full.txt' ) ); ?></p>
		<a href="<?php echo esc_url( home_url( '/llms-full.txt' ) ); ?>" target="_blank" class="button">
			<?php esc_html_e( 'Open', 'hs3dev-llms-generator' ); ?>
		</a>
		<button type="button" class="button button-secondary llmsg-view-btn" data-target="llms_full_txt">
			<?php esc_html_e( 'View', 'hs3dev-llms-generator' ); ?>
		</button>
		<button type="button" class="button button-secondary llmsg-verify-btn" data-file-type="llms-full">
			<?php esc_html_e( 'Verify Live File', 'hs3dev-llms-generator' ); ?>
		</button>
		<div class="llmsg-verify-result" data-file-type="llms-full"></div>
	</div>
</div>

<div id="llmsg-modal" class="llmsg-modal" style="display:none;">
	<div class="llmsg-modal-content">
		<button type="button" class="llmsg-modal-close" aria-label="<?php esc_attr_e( 'Close', 'hs3dev-llms-generator' ); ?>">&times;</button>
		<h3 id="llmsg-modal-title"></h3>
		<textarea id="llmsg-modal-body" readonly></textarea>
	</div>
</div>

<script type="application/json" id="llmsg-generated-data"><?php echo wp_json_encode( $llmsg_generated ); ?></script>
