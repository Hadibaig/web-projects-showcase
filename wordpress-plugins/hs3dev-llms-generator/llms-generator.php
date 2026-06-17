<?php
/**
 * Plugin Name:       HS3Dev LLMS Generator
 * Plugin URI:        https://hadi-mirza.com/hs3dev-llms-generator/
 * Description:       Generate llms.txt and llms-full.txt files for your WordPress site, with full control over which posts, pages and products are included. Choose content by post type or individually, pull summaries from your SEO plugin's meta description, auto-regenerate on a schedule, and track which AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) are reading your files.
 * Version:           0.5.1
 * Requires at least: 7.0
 * Requires PHP:      8.0
 * Author:            Mirza Hadi
 * Author URI:        https://hadi-mirza.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       hs3dev-llms-generator
 *
 * Developer:  Mirza Hadi
 * Brand:      HS3Dev
 * Role:       Full Stack Developer & Technical Problem Solver
 * Email:      mirzahadi@hotmail.com
 * Website:    hadi-mirza.com
 * LinkedIn:   linkedin.com/in/hadibaig
 * GitHub:     github.com/Hadibaig
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Block direct access.
}

define( 'LLMSG_VERSION', '0.5.1' );
define( 'LLMSG_PATH', plugin_dir_path( __FILE__ ) );
define( 'LLMSG_URL', plugin_dir_url( __FILE__ ) );

require_once LLMSG_PATH . 'includes/class-llms-settings.php';
require_once LLMSG_PATH . 'includes/class-llms-generator.php';
require_once LLMSG_PATH . 'includes/class-llms-logger.php';
require_once LLMSG_PATH . 'includes/class-llms-cron.php';
require_once LLMSG_PATH . 'includes/class-llms-diagnostics.php';
require_once LLMSG_PATH . 'includes/class-llms-multilingual.php';
require_once LLMSG_PATH . 'includes/class-llms-admin.php';
require_once LLMSG_PATH . 'includes/class-llms-ajax.php';
require_once LLMSG_PATH . 'includes/class-llms-file-server.php';

/**
 * Runs the actual per-site setup: settings defaults, logs table, cron
 * schedule. Called once per site, whether on single-site activation,
 * network activation (looped across all sites), or when a new site is
 * created later on an already-network-activated install.
 */
function llmsg_setup_site() {
	LLMS_Generator_Settings::set_defaults();
	LLMS_Generator_Logger::create_table();
	LLMS_Generator_Cron::activate();
}

/**
 * Runs on plugin activation. On a multisite network activation, loops
 * over every existing site so each one gets its own settings/table/cron,
 * since wp_options and the logs table are both per-site by default.
 *
 * @param bool $network_wide Whether the plugin is being network-activated.
 */
function llmsg_activate( $network_wide = false ) {
	if ( is_multisite() && $network_wide ) {
		$site_ids = get_sites( array( 'fields' => 'ids' ) );

		foreach ( $site_ids as $site_id ) {
			switch_to_blog( $site_id );
			llmsg_setup_site();
			restore_current_blog();
		}
	} else {
		llmsg_setup_site();
	}

	// Make sure /llms.txt and /llms-full.txt rewrite rules are registered.
	$file_server = new LLMS_Generator_File_Server();
	$file_server->add_rewrite_rules();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'llmsg_activate' );

/**
 * Ensures a newly created site on an already network-activated install
 * gets its own settings defaults, logs table, and cron schedule too,
 * rather than only sites that existed at the time of activation.
 *
 * @param WP_Site $new_site Newly created site object.
 */
function llmsg_setup_new_site( $new_site ) {
	if ( ! function_exists( 'is_plugin_active_for_network' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	if ( ! is_plugin_active_for_network( plugin_basename( __FILE__ ) ) ) {
		return;
	}

	switch_to_blog( $new_site->blog_id );
	llmsg_setup_site();
	restore_current_blog();
}
add_action( 'wp_initialize_site', 'llmsg_setup_new_site' );

/**
 * Runs on plugin deactivation. On network deactivation, clears scheduled
 * cron events on every site, since each site has its own.
 *
 * @param bool $network_wide Whether the plugin is being network-deactivated.
 */
function llmsg_deactivate( $network_wide = false ) {
	if ( is_multisite() && $network_wide ) {
		$site_ids = get_sites( array( 'fields' => 'ids' ) );

		foreach ( $site_ids as $site_id ) {
			switch_to_blog( $site_id );
			LLMS_Generator_Cron::deactivate();
			restore_current_blog();
		}
	} else {
		LLMS_Generator_Cron::deactivate();
	}

	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'llmsg_deactivate' );

/**
 * Boots the plugin.
 */
function llmsg_init() {
	new LLMS_Generator_Admin();
	new LLMS_Generator_Ajax();
	new LLMS_Generator_File_Server();
	new LLMS_Generator_Cron();
}
add_action( 'plugins_loaded', 'llmsg_init' );
