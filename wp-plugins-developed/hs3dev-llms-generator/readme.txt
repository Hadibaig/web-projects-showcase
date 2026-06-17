=== HS3Dev LLMS Generator ===
Contributors: hadibaig
Tags: llms, ai, seo, content generation, crawler
Requires at least: 6.8
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 0.5.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Generate llms.txt and llms-full.txt with full control over content, SEO integration, multilingual support, and AI crawler analytics.

== Description ==

LLMS Generator allows WordPress site owners to automatically generate structured llms.txt and llms-full.txt files for AI systems and large language model crawlers.

It provides full control over included content, supports SEO meta integration, multilingual setups, and ensures safe performance even on large websites through batch processing.

Developed by Mirza Hadi (HS3Dev).

== Features ==

- Generate llms.txt and llms-full.txt files dynamically (no physical file required)
- Select content by post type or individual posts/pages/products
- Include/exclude specific URLs manually
- SEO plugin integration (Yoast, RankMath, AIOSEO, SEOPress)
- Page-builder safe content extraction
- Compatibility mode for live URL content fetching
- Batched generation for large websites
- Auto-regeneration via WP-Cron (on save, daily, weekly)
- AI crawler analytics (GPTBot, ClaudeBot, PerplexityBot, etc.)
- Multilingual support (WPML / Polylang)
- Multisite compatible
- Conflict detection and diagnostics tools

== Installation ==

1. Upload plugin to /wp-content/plugins/
2. Activate the plugin
3. Go to LLMS Generator settings
4. Configure post types and options
5. Save Permalinks once after activation

== Frequently Asked Questions ==

= Does it create physical files? =
No, it serves virtual llms.txt files dynamically through WordPress.

= Does it work with Elementor or page builders? =
Yes, it supports both filtered content and live-fetch compatibility mode.

== Changelog ==

= 0.5.1 =
* Renamed slug/text-domain to hs3dev-llms-generator
* Fixed admin asset loading after rename
* Hardened analytics database queries (prepared statements with %i identifier placeholder)
* Fixed invalid "Requires at least: 7.0" value and other readme metadata issues
* General WordPress coding standards cleanup

= 0.5.0 =
* Added description toggle for llms.txt output (full vs minimal mode)
* Improved flexibility for SEO + AI crawler output control

= 0.4.0 =
* Added multilingual support (WPML/Polylang)
* Added compatibility mode for page builders
* Added multisite support and role control

= 0.3.0 =
* Added batch processing system for large sites
* Added conflict detection for physical llms.txt files
* Improved performance and memory handling

= 0.2.0 =
* Added SEO meta integration
* Added AI crawler analytics
* Added WP-Cron auto regeneration

= 0.1.0 =
* Initial release