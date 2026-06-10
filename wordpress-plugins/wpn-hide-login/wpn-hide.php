<?php
/**
 * Plugin Name:       WPN Hide Login & Password Eye
 * Plugin URI:        https://hadi-mirza.com
 * Description:       Two security hardening features in one: (1) rename your /wp-admin login URL to anything you choose — drastically reducing brute-force attempts; (2) permanently hide the "show password" eye icon on the login form so entered passwords are never visually exposed.
 * Version:           2.0.0
 * Requires at least: 5.5
 * Requires PHP:      8.0
 * Author:            Mirza Hadi
 * Author URI:        https://hadi-mirza.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wpn-hide-login
 *
 * Developer:  Mirza Hadi
 * Role:       Full Stack Developer & Technical Problem Solver
 * Email:      mirzahadi@hotmail.com
 * Website:    hadi-mirza.com
 * LinkedIn:   linkedin.com/in/hadibaig
 * GitHub:     github.com/Hadibaig
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WPN_Hide_Login' ) ) :

	class WPN_Hide_Login {

		private bool $wp_login_php = false;

		protected static ?self $instance = null;

		// ─── Singleton ────────────────────────────────────────────────────────

		public static function get_instance(): static {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}
			return self::$instance;
		}

		// ─── Constructor ──────────────────────────────────────────────────────

		private function __construct() {
			add_action( 'plugins_loaded', [ $this, 'load_textdomain' ], 9 );

			global $wp_version;
			if ( version_compare( $wp_version, '5.5', '<' ) ) {
				add_action( 'admin_notices', [ $this, 'notice_incompatible' ] );
				add_action( 'network_admin_notices', [ $this, 'notice_incompatible' ] );
				return;
			}

			if ( is_multisite() && ! function_exists( 'is_plugin_active_for_network' ) ) {
				require_once ABSPATH . '/wp-admin/includes/plugin.php';
			}

			register_activation_hook( __FILE__, [ $this, 'activate' ] );

			if ( is_multisite() && is_plugin_active_for_network( plugin_basename( __FILE__ ) ) ) {
				add_action( 'wpmu_options',        [ $this, 'wpmu_options' ] );
				add_action( 'update_wpmu_options', [ $this, 'update_wpmu_options' ] );
				add_filter( 'network_admin_plugin_action_links_' . plugin_basename( __FILE__ ), [ $this, 'plugin_action_links' ] );
			}

			add_action( 'admin_init',        [ $this, 'admin_init' ] );
			add_action( 'plugins_loaded',    [ $this, 'plugins_loaded' ], 2 );
			add_action( 'admin_notices',     [ $this, 'admin_notices' ] );
			add_action( 'network_admin_notices', [ $this, 'admin_notices' ] );
			add_action( 'wp_loaded',         [ $this, 'wp_loaded' ] );

			// ── Hide password-eye icon on login page ─────────────────────────
			add_action( 'login_head', [ $this, 'hide_password_eye' ] );

			add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), [ $this, 'plugin_action_links' ] );
			add_filter( 'site_url',         [ $this, 'site_url' ], 10, 4 );
			add_filter( 'network_site_url', [ $this, 'network_site_url' ], 10, 3 );
			add_filter( 'wp_redirect',      [ $this, 'wp_redirect' ], 10, 2 );
			add_filter( 'site_option_welcome_email', [ $this, 'welcome_email' ] );

			remove_action( 'template_redirect', 'wp_redirect_admin_locations', 1000 );
		}

		// ─── Helpers ──────────────────────────────────────────────────────────

		private function basename(): string {
			return plugin_basename( __FILE__ );
		}

		private function path(): string {
			return trailingslashit( dirname( __FILE__ ) );
		}

		private function use_trailing_slashes(): bool {
			return '/' === substr( (string) get_option( 'permalink_structure' ), -1, 1 );
		}

		private function user_trailingslashit( string $string ): string {
			return $this->use_trailing_slashes()
				? trailingslashit( $string )
				: untrailingslashit( $string );
		}

		private function wp_template_loader(): void {
			global $pagenow;
			$pagenow = 'index.php';

			if ( ! defined( 'WP_USE_THEMES' ) ) {
				define( 'WP_USE_THEMES', true );
			}

			wp();

			if ( $_SERVER['REQUEST_URI'] === $this->user_trailingslashit( str_repeat( '-/', 10 ) ) ) {
				$_SERVER['REQUEST_URI'] = $this->user_trailingslashit( '/wp-login-php/' );
			}

			require_once ABSPATH . WPINC . '/template-loader.php';
			die;
		}

		private function new_login_slug(): string {
			if ( $slug = get_option( 'whl_page' ) ) {
				return $slug;
			}
			if ( is_multisite()
				&& is_plugin_active_for_network( $this->basename() )
				&& ( $slug = get_site_option( 'whl_page', 'login' ) ) ) {
				return $slug;
			}
			return 'login';
		}

		public function new_login_url( ?string $scheme = null ): string {
			if ( get_option( 'permalink_structure' ) ) {
				return $this->user_trailingslashit( home_url( '/', $scheme ) . $this->new_login_slug() );
			}
			return home_url( '/', $scheme ) . '?' . $this->new_login_slug();
		}

		public function forbidden_slugs(): array {
			$wp = new WP();
			return array_merge( $wp->public_query_vars, $wp->private_query_vars );
		}

		// ─── Password Eye ─────────────────────────────────────────────────────

		/**
		 * Hides the "show password" toggle button on the WP login form.
		 * This prevents anyone from revealing a password as it is typed.
		 */
		public function hide_password_eye(): void {
			echo '<style>
				/* WPN Hide Login — hide password visibility toggle */
				#loginform .wp-pwd button.button,
				#loginform .wp-pwd button[data-toggle-password] {
					display: none !important;
				}
				span.dashicons-visibility::before,
				span.dashicons-hidden::before {
					content: "" !important;
				}
			</style>';
		}

		// ─── Activation ───────────────────────────────────────────────────────

		public function activate(): void {
			add_option( 'whl_redirect', '1' );
			delete_option( 'whl_admin' );
		}

		// ─── Multisite Network Settings ───────────────────────────────────────

		public function wpmu_options(): void {
			echo '<h3>' . esc_html__( 'WPN Hide Login', 'wpn-hide-login' ) . '</h3>';
			echo '<p>' . esc_html__( 'Set a network-wide default login URL. Individual sites can override this in their permalink settings.', 'wpn-hide-login' ) . '</p>';
			echo '<table class="form-table"><tr valign="top">';
			echo '<th scope="row"><label for="whl_page">' . esc_html__( 'Network-wide default', 'wpn-hide-login' ) . '</label></th>';
			echo '<td><input id="whl_page" type="text" name="whl_page" value="' . esc_attr( get_site_option( 'whl_page', 'login' ) ) . '"></td>';
			echo '</tr></table>';
		}

		public function update_wpmu_options(): void {
			if ( check_admin_referer( 'siteoptions' ) ) {
				$whl_page = sanitize_title_with_dashes( wp_unslash( $_POST['whl_page'] ?? '' ) );
				if ( $whl_page
					&& ! str_contains( $whl_page, 'wp-login' )
					&& ! in_array( $whl_page, $this->forbidden_slugs(), true ) ) {
					update_site_option( 'whl_page', $whl_page );
				}
			}
		}

		// ─── Admin Settings ───────────────────────────────────────────────────

		public function admin_init(): void {
			add_settings_section(
				'wpn-hide-login-section',
				__( 'WPN Hide Login', 'wpn-hide-login' ),
				[ $this, 'section_desc' ],
				'general'
			);

			add_settings_field(
				'whl_page',
				'<label for="whl_page">' . esc_html__( 'Login URL', 'wpn-hide-login' ) . '</label>',
				[ $this, 'page_input' ],
				'general',
				'wpn-hide-login-section'
			);

			register_setting( 'general', 'whl_page', 'sanitize_title_with_dashes' );

			if ( get_option( 'whl_redirect' ) ) {
				delete_option( 'whl_redirect' );

				$redirect = ( is_multisite() && is_super_admin() && is_plugin_active_for_network( $this->basename() ) )
					? network_admin_url( 'settings.php#whl-page-input' )
					: admin_url( 'options-general.php#whl-page-input' );

				wp_safe_redirect( $redirect );
				die;
			}
		}

		public function section_desc(): void {
			if ( ! is_multisite() || is_super_admin() ) {
				echo '<p>' . esc_html__( 'Change your login URL to something only you know. Direct access to wp-login.php will return a 404.', 'wpn-hide-login' ) . '</p>';
				echo '<p>' . esc_html__( 'The password eye icon is also permanently hidden on the login form.', 'wpn-hide-login' ) . '</p>';
			}

			if ( is_multisite() && is_super_admin() && is_plugin_active_for_network( $this->basename() ) ) {
				echo '<p>' . sprintf(
					/* translators: %s = link to network settings */
					esc_html__( 'To set a network-wide default, go to %s.', 'wpn-hide-login' ),
					'<a href="' . esc_url( network_admin_url( 'settings.php#whl-page-input' ) ) . '">' . esc_html__( 'Network Settings', 'wpn-hide-login' ) . '</a>'
				) . '</p>';
			}
		}

		public function page_input(): void {
			if ( get_option( 'permalink_structure' ) ) {
				echo '<code>' . esc_url( trailingslashit( home_url() ) ) . '</code> ';
				echo '<input id="whl_page" type="text" name="whl_page" value="' . esc_attr( $this->new_login_slug() ) . '">';
				echo $this->use_trailing_slashes() ? ' <code>/</code>' : '';
			} else {
				echo '<code>' . esc_url( trailingslashit( home_url() ) ) . '?</code> ';
				echo '<input id="whl_page" type="text" name="whl_page" value="' . esc_attr( $this->new_login_slug() ) . '">';
			}
		}

		public function admin_notices(): void {
			global $pagenow;
			if ( ! is_network_admin()
				&& $pagenow === 'options-general.php'
				&& isset( $_GET['settings-updated'] ) ) {
				echo '<div class="updated notice is-dismissible"><p>'
					. sprintf(
						/* translators: %1$s = URL, %2$s = URL text */
						esc_html__( 'Your login page is now here: %s — bookmark it!', 'wpn-hide-login' ),
						'<strong><a href="' . esc_url( $this->new_login_url() ) . '">' . esc_html( $this->new_login_url() ) . '</a></strong>'
					)
					. '</p></div>';
			}
		}

		public function notice_incompatible(): void {
			echo '<div class="error notice is-dismissible"><p>'
				. esc_html__( 'WPN Hide Login requires WordPress 5.5 or higher. Please upgrade WordPress.', 'wpn-hide-login' )
				. '</p></div>';
		}

		public function plugin_action_links( array $links ): array {
			$url = ( is_network_admin() && is_plugin_active_for_network( $this->basename() ) )
				? network_admin_url( 'settings.php#whl-page-input' )
				: admin_url( 'options-general.php#whl-page-input' );

			array_unshift( $links, '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Settings', 'wpn-hide-login' ) . '</a>' );
			return $links;
		}

		// ─── Request Interception ─────────────────────────────────────────────

		public function plugins_loaded(): void {
			global $pagenow;

			if ( ! is_multisite()
				&& (
					str_contains( $_SERVER['REQUEST_URI'], 'wp-signup' )
					|| str_contains( $_SERVER['REQUEST_URI'], 'wp-activate' )
				) ) {
				wp_die( esc_html__( 'This feature is not enabled.', 'wpn-hide-login' ) );
			}

			$request = parse_url( $_SERVER['REQUEST_URI'] );

			if (
				( str_contains( $_SERVER['REQUEST_URI'], 'wp-login.php' )
					|| untrailingslashit( $request['path'] ?? '' ) === site_url( 'wp-login', 'relative' )
				) && ! is_admin()
			) {
				$this->wp_login_php      = true;
				$_SERVER['REQUEST_URI']  = $this->user_trailingslashit( '/' . str_repeat( '-/', 10 ) );
				$pagenow                 = 'index.php';

			} elseif (
				untrailingslashit( $request['path'] ?? '' ) === home_url( $this->new_login_slug(), 'relative' )
				|| ( ! get_option( 'permalink_structure' )
					&& isset( $_GET[ $this->new_login_slug() ] )
					&& empty( $_GET[ $this->new_login_slug() ] ) )
			) {
				$pagenow = 'wp-login.php';
			}
		}

		public function wp_loaded(): void {
			global $pagenow;

			if ( is_admin() && ! is_user_logged_in() && ! defined( 'DOING_AJAX' ) ) {
				status_header( 404 );
				nocache_headers();
				include get_404_template();
				exit;
			}

			$request = parse_url( $_SERVER['REQUEST_URI'] );

			if ( $pagenow === 'wp-login.php'
				&& ( $request['path'] ?? '' ) !== $this->user_trailingslashit( $request['path'] ?? '' )
				&& get_option( 'permalink_structure' ) ) {

				wp_safe_redirect(
					$this->user_trailingslashit( $this->new_login_url() )
					. ( ! empty( $_SERVER['QUERY_STRING'] ) ? '?' . $_SERVER['QUERY_STRING'] : '' )
				);
				die;

			} elseif ( $this->wp_login_php ) {

				if ( ( $referer = wp_get_referer() )
					&& str_contains( $referer, 'wp-activate.php' )
					&& ( $referer_parts = parse_url( $referer ) )
					&& ! empty( $referer_parts['query'] ) ) {

					parse_str( $referer_parts['query'], $referer_data );

					if ( ! empty( $referer_data['key'] )
						&& ( $result = wpmu_activate_signup( $referer_data['key'] ) )
						&& is_wp_error( $result )
						&& in_array( $result->get_error_code(), [ 'already_active', 'blog_taken' ], true ) ) {

						wp_safe_redirect(
							$this->new_login_url()
							. ( ! empty( $_SERVER['QUERY_STRING'] ) ? '?' . $_SERVER['QUERY_STRING'] : '' )
						);
						die;
					}
				}

				$this->wp_template_loader();

			} elseif ( $pagenow === 'wp-login.php' ) {
				global $error, $interim_login, $action, $user_login;
				// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				@require_once ABSPATH . 'wp-login.php';
				die;
			}
		}

		// ─── URL Filters ──────────────────────────────────────────────────────

		public function site_url( string $url, string $path, ?string $scheme, int|null $blog_id ): string {
			return $this->filter_wp_login_php( $url, $scheme );
		}

		public function network_site_url( string $url, string $path, ?string $scheme ): string {
			return $this->filter_wp_login_php( $url, $scheme );
		}

		public function wp_redirect( string $location, int $status ): string {
			return $this->filter_wp_login_php( $location );
		}

		public function filter_wp_login_php( string $url, ?string $scheme = null ): string {
			if ( str_contains( $url, 'wp-login.php' ) ) {
				if ( is_ssl() ) {
					$scheme = 'https';
				}
				$args = explode( '?', $url );
				if ( isset( $args[1] ) ) {
					parse_str( $args[1], $args );
					$url = add_query_arg( $args, $this->new_login_url( $scheme ) );
				} else {
					$url = $this->new_login_url( $scheme );
				}
			}
			return $url;
		}

		public function welcome_email( string $value ): string {
			return str_replace( 'wp-login.php', trailingslashit( get_site_option( 'whl_page', 'login' ) ), $value );
		}

		// ─── i18n ─────────────────────────────────────────────────────────────

		public function load_textdomain(): void {
			load_plugin_textdomain( 'wpn-hide-login', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
		}
	}

	add_action( 'plugins_loaded', [ 'WPN_Hide_Login', 'get_instance' ], 1 );

endif;
