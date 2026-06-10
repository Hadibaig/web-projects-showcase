=== Bulk Categorize Posts ===
Contributors:      mirzahadi
Tags:              categories, bulk, posts, reassign, migrate
Requires at least: 5.5
Tested up to:      6.5
Requires PHP:      8.0
Stable tag:        2.0.0
License:           GPLv2 or later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Reassign all posts from one category to another in bulk — something WordPress doesn't support natively.

== Description ==

WordPress lets you bulk-edit posts individually or via selection, but it has no built-in way to move *every post* in Category A to Category B in a single click.

**Bulk Categorize Posts** solves this. Select a source category (e.g. "Insight") and a target category (e.g. "News"), click Reassign, and every post in the source category is instantly moved. Other categories on those posts are preserved — only the source is swapped out.

**Features:**
* Move all posts from any category to any other category in one click
* Supports migrating Uncategorized posts
* Preserves other categories assigned to posts (non-destructive)
* Post count shown next to each category so you know what you're moving
* Confirmation prompt before executing
* Nonce-protected form (CSRF safe)
* PHP 8.0+ compatible, no deprecated APIs

== Installation ==

1. Upload the `bulk-categorize-posts` folder to `/wp-content/plugins/`
2. Activate the plugin in **Plugins → Installed Plugins**
3. Go to **Bulk Categorize** in the WordPress admin menu

== Changelog ==

= 2.0.0 =
* PHP 8.0+ compatibility (typed hints, arrow functions, named args)
* Source → Target category model (replaces Uncategorized-only approach)
* Category dropdowns with post counts
* Nonce security, proper sanitization & escaping
* Non-destructive: other categories on a post are preserved
* Confirmation dialog before bulk operation
* Developer credits added

= 1.2 =
* Initial release — Uncategorized posts only
