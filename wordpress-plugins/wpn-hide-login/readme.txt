=== WPN Hide Login & Password Eye ===
Contributors:      mirzahadi
Tags:              login, security, hide login, rename login, password eye
Requires at least: 5.5
Tested up to:      6.5
Requires PHP:      8.0
Stable tag:        2.0.0
License:           GPLv2 or later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Two security features in one: rename your login URL and hide the password visibility toggle.

== Description ==

**WPN Hide Login & Password Eye** combines two lightweight security hardening tools:

**1. Rename Login URL**
Move your login page from `/wp-login.php` to any custom slug you choose (e.g. `/my-portal`). Anyone who hits the original wp-login.php URL receives a 404 — effectively blocking automated brute-force scanners and bots that target the default WordPress login path. Configure it in *Settings → General → Login URL*.

**2. Hide Password Eye Icon**
The WordPress login form shows a toggle button (eye icon) to reveal the typed password. This plugin hides that button entirely using CSS injected into the login `<head>`. Nobody can click "show password" and reveal credentials on your screen — useful in public spaces, shared screens, or simply for stricter security posture.

**Features:**
* Custom login URL — blocks bots targeting /wp-login.php
* Direct access to wp-login.php returns 404
* Password eye icon removed from login form via CSS
* Multisite / network aware
* Compatible with WordPress 5.5+ and PHP 8.0+
* No external requests, no tracking

== Installation ==

1. Upload the `wpn-hide-login` folder to `/wp-content/plugins/`
2. Activate in **Plugins → Installed Plugins**
3. Go to **Settings → General**, scroll to "WPN Hide Login", and set your new login slug
4. **Bookmark** the new login URL shown after saving — the old wp-login.php is now a 404

== Frequently Asked Questions ==

= I forgot my new login URL =
You can find or reset the `whl_page` option in your database (wp_options table) or temporarily deactivate the plugin via FTP/cPanel File Manager.

= Can I use any word as the slug? =
Any slug that doesn't conflict with WordPress query vars. Avoid `wp-login`, `admin`, `dashboard`.

= Does this work on Multisite? =
Yes. When network-activated, a network-wide default can be set in Network Settings. Individual sites can override in their own General Settings.

== Changelog ==

= 2.0.0 =
* PHP 8.0+ compatibility (typed properties, named args, str_contains, null-safe operators)
* Merged password eye-hide feature into main class
* Improved escaping and sanitization throughout
* Updated author credentials (Mirza Hadi / hadi-mirza.com)
* Removed dead external links
* Refined plugin description

= 1.0 =
* Initial release
