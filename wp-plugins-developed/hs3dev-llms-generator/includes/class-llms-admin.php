<?php
/**
 * Registers the admin menu page, renders the tabbed UI, and handles settings saves.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LLMS_Generator_Admin {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_post_llmsg_save_settings', array( $this, 'save_settings' ) );
	}

	/**
	 * Adds the top-level "LLMS Generator" admin menu page.
	 */
	public function add_menu() {
		add_menu_page(
			__( 'LLMS Generator', 'hs3dev-llms-generator' ),
			__( 'LLMS Generator', 'hs3dev-llms-generator' ),
			llmsg_required_capability(),
			'hs3dev-llms-generator',
			array( $this, 'render_page' ),
			'dashicons-media-document',
			65
		);
	}

	/**
	 * Loads admin CSS/JS only on our settings page.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_assets( $hook ) {
		if ( 'toplevel_page_hs3dev-llms-generator' !== $hook ) {
			return;
		}

		wp_enqueue_style( 'llmsg-admin', LLMSG_URL . 'assets/css/admin.css', array(), LLMSG_VERSION );
		wp_enqueue_script( 'llmsg-admin', LLMSG_URL . 'assets/js/admin.js', array( 'jquery' ), LLMSG_VERSION, true );

		wp_localize_script(
			'llmsg-admin',
			'llmsgData',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'llmsg_nonce' ),
			)
		);
	}

	/**
	 * Renders the page wrapper with tab navigation and includes the active tab template.
	 */
	public function render_page() {
		// Reading a tab selector from the URL is a read-only navigation action,
		// not a state-changing form submission, so nonce verification doesn't
		// apply here (consistent with how WordPress core handles ?page=/?tab=
		// query args on its own settings screens).
		$active_tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'generate'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$tabs = array(
			'generate'  => __( 'Generate', 'hs3dev-llms-generator' ),
			'analytics' => __( 'Analytics', 'hs3dev-llms-generator' ),
			'settings'  => __( 'Settings', 'hs3dev-llms-generator' ),
		);

		if ( ! isset( $tabs[ $active_tab ] ) ) {
			$active_tab = 'generate';
		}
		?>
		<div class="wrap llmsg-wrap">
			<h1><?php esc_html_e( 'LLMS Generator', 'hs3dev-llms-generator' ); ?></h1>

			<nav class="llmsg-tabs">
				<?php foreach ( $tabs as $tab_key => $tab_label ) : ?>
					<a href="<?php echo esc_url( add_query_arg( array( 'page' => 'hs3dev-llms-generator', 'tab' => $tab_key ), admin_url( 'admin.php' ) ) ); ?>"
						class="llmsg-tab <?php echo $active_tab === $tab_key ? 'active' : ''; ?>">
						<?php echo esc_html( $tab_label ); ?>
					</a>
				<?php endforeach; ?>
			</nav>

			<div class="llmsg-tab-content">
				<?php
				switch ( $active_tab ) {
					case 'analytics':
						include LLMSG_PATH . 'templates/tab-analytics.php';
						break;
					case 'settings':
						include LLMSG_PATH . 'templates/tab-settings.php';
						break;
					default:
						include LLMSG_PATH . 'templates/tab-generate.php';
						break;
				}
				?>
			</div>
		</div>
		<?php
	}

	/**
	 * Handles the settings form submission.
	 */
	public function save_settings() {
		if ( ! current_user_can( llmsg_required_capability() ) ) {
			wp_die( esc_html__( 'Permission denied.', 'hs3dev-llms-generator' ) );
		}

		check_admin_referer( 'llmsg_settings_nonce' );

		$settings = array(
			'company_email'       => isset( $_POST['company_email'] ) ? sanitize_email( wp_unslash( $_POST['company_email'] ) ) : '',
			'company_name'        => isset( $_POST['company_name'] ) ? sanitize_text_field( wp_unslash( $_POST['company_name'] ) ) : '',
			'company_description' => isset( $_POST['company_description'] ) ? sanitize_textarea_field( wp_unslash( $_POST['company_description'] ) ) : '',
			'include_urls'        => isset( $_POST['include_urls'] ) ? sanitize_textarea_field( wp_unslash( $_POST['include_urls'] ) ) : '',
			'exclude_urls'        => isset( $_POST['exclude_urls'] ) ? sanitize_textarea_field( wp_unslash( $_POST['exclude_urls'] ) ) : '',
			'update_frequency'    => isset( $_POST['update_frequency'] ) ? sanitize_key( wp_unslash( $_POST['update_frequency'] ) ) : 'manual',
			'ai_policy'           => isset( $_POST['ai_policy'] ) ? sanitize_textarea_field( wp_unslash( $_POST['ai_policy'] ) ) : '',
			'enable_logging'      => ! empty( $_POST['enable_logging'] ),
			'use_seo_meta'        => ! empty( $_POST['use_seo_meta'] ),
			'include_meta_description' => ! empty( $_POST['include_meta_description'] ),
			'compatibility_mode'  => ! empty( $_POST['compatibility_mode'] ),
			'allowed_role'        => isset( $_POST['allowed_role'] ) ? sanitize_key( wp_unslash( $_POST['allowed_role'] ) ) : 'manage_options',
		);

		$post_types_settings = array();
		$public_post_types   = get_post_types( array( 'public' => true ), 'names' );
		unset( $public_post_types['attachment'] );

		// Raw POST array for post_types is unslashed here; every value pulled
		// from it below is explicitly sanitized per-field (absint() for IDs,
		// boolean cast for the enabled flag) before being stored or used,
		// so this is safe even though the top-level unslash itself isn't a sanitizer.
		$posted_post_types = isset( $_POST['post_types'] ) ? wp_unslash( $_POST['post_types'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

		foreach ( $public_post_types as $post_type ) {
			$enabled      = ! empty( $posted_post_types[ $post_type ]['enabled'] );
			$excluded_raw = isset( $posted_post_types[ $post_type ]['excluded_ids'] ) ? sanitize_text_field( $posted_post_types[ $post_type ]['excluded_ids'] ) : '';
			$excluded_ids = array_values( array_filter( array_map( 'absint', explode( ',', $excluded_raw ) ) ) );

			$post_types_settings[ $post_type ] = array(
				'enabled'      => $enabled,
				'excluded_ids' => $excluded_ids,
			);
		}

		$settings['post_types'] = $post_types_settings;

		LLMS_Generator_Settings::update_settings( $settings );

		wp_safe_redirect(
			add_query_arg(
				array(
					'page'    => 'hs3dev-llms-generator',
					'tab'     => 'settings',
					'updated' => '1',
				),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}
}
