<?php
/**
 * Plugin Name:       Bulk Categorize Posts
 * Plugin URI:        https://hadi-mirza.com
 * Description:       Reassign all posts from one category to another in bulk — something WordPress doesn't support natively. Select a source category (e.g. "Insight") and a target category (e.g. "News") and every post will be migrated instantly. Also supports moving all Uncategorized posts into any category.
 * Version:           2.0.0
 * Requires at least: 5.5
 * Requires PHP:      8.0
 * Author:            Mirza Hadi
 * Author URI:        https://hadi-mirza.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       bulk-categorize-posts
 *
 * Developer:  Mirza Hadi
 * Role:       Full Stack Developer & Technical Problem Solver
 * Email:      mirzahadi@hotmail.com
 * Website:    hadi-mirza.com
 * LinkedIn:   linkedin.com/in/hadibaig
 * GitHub:     github.com/Hadibaig
 */

defined( 'ABSPATH' ) || exit;

// ─── Admin Menu ───────────────────────────────────────────────────────────────

add_action( 'admin_menu', 'bcp_add_menu' );

function bcp_add_menu(): void {
	add_menu_page(
		__( 'Bulk Categorize Posts', 'bulk-categorize-posts' ),
		__( 'Bulk Categorize', 'bulk-categorize-posts' ),
		'manage_options',
		'bulk-categorize',
		'bcp_admin_page',
		'dashicons-category',
		20
	);
}

// ─── Core Logic ───────────────────────────────────────────────────────────────

/**
 * Move all posts from $source_id to $target_id.
 * If $source_id is 0 (Uncategorized), targets posts with only the default category.
 *
 * @return int Number of posts updated.
 */
function bcp_reassign_posts( int $source_id, int $target_id ): int {
	$args = [
		'numberposts' => -1,
		'post_type'   => 'post',
		'post_status' => 'any',
		'fields'      => 'ids',
	];

	if ( $source_id === 0 ) {
		// Uncategorized mode — use default category
		$args['category'] = (int) get_option( 'default_category' );
	} else {
		$args['category__in'] = [ $source_id ];
	}

	$post_ids = get_posts( $args );
	$count    = 0;

	foreach ( $post_ids as $post_id ) {
		$current_cats = wp_get_post_categories( $post_id );

		// Remove source, add target (keeping other categories intact)
		$new_cats = array_filter( $current_cats, fn( int $c ) => $c !== $source_id );
		$new_cats[] = $target_id;

		wp_set_post_categories( $post_id, array_unique( $new_cats ) );
		$count++;
	}

	return $count;
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

function bcp_admin_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'bulk-categorize-posts' ) );
	}

	$message      = '';
	$message_type = 'updated';

	if ( isset( $_POST['bcp_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bcp_nonce'] ) ), 'bcp_action' ) ) {

		$source_id = isset( $_POST['source_category_id'] ) ? (int) $_POST['source_category_id'] : -1;
		$target_id = isset( $_POST['target_category_id'] ) ? (int) $_POST['target_category_id'] : 0;

		if ( $source_id === $target_id ) {
			$message      = __( 'Source and target categories cannot be the same.', 'bulk-categorize-posts' );
			$message_type = 'error';
		} elseif ( $target_id < 1 ) {
			$message      = __( 'Please select a valid target category.', 'bulk-categorize-posts' );
			$message_type = 'error';
		} else {
			$count = bcp_reassign_posts( $source_id, $target_id );

			if ( $count > 0 ) {
				/* translators: %d = number of posts updated */
				$message = sprintf( _n( '%d post was successfully reassigned.', '%d posts were successfully reassigned.', $count, 'bulk-categorize-posts' ), $count );
			} else {
				$message      = __( 'No posts found in the selected source category.', 'bulk-categorize-posts' );
				$message_type = 'notice-warning';
			}
		}
	}

	// Build category list
	$all_categories = get_categories( [ 'hide_empty' => false ] );
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Bulk Categorize Posts', 'bulk-categorize-posts' ); ?></h1>
		<p class="description">
			<?php esc_html_e( 'Reassign all posts from one category to another. Useful for renaming or merging categories across your entire post library.', 'bulk-categorize-posts' ); ?>
		</p>

		<?php if ( $message ) : ?>
			<div class="notice <?php echo esc_attr( $message_type ); ?> is-dismissible"><p><?php echo esc_html( $message ); ?></p></div>
		<?php endif; ?>

		<form method="POST" style="max-width:520px; margin-top:1.5em;">
			<?php wp_nonce_field( 'bcp_action', 'bcp_nonce' ); ?>

			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<label for="source_category_id"><?php esc_html_e( 'From (source category)', 'bulk-categorize-posts' ); ?></label>
					</th>
					<td>
						<select name="source_category_id" id="source_category_id" class="regular-text">
							<option value="0"><?php esc_html_e( '— Uncategorized —', 'bulk-categorize-posts' ); ?></option>
							<?php foreach ( $all_categories as $cat ) : ?>
								<option value="<?php echo esc_attr( $cat->term_id ); ?>">
									<?php echo esc_html( $cat->name . ' (' . $cat->count . ' posts)' ); ?>
								</option>
							<?php endforeach; ?>
						</select>
						<p class="description"><?php esc_html_e( 'All posts in this category will be moved.', 'bulk-categorize-posts' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="target_category_id"><?php esc_html_e( 'To (target category)', 'bulk-categorize-posts' ); ?></label>
					</th>
					<td>
						<select name="target_category_id" id="target_category_id" class="regular-text">
							<option value=""><?php esc_html_e( '— Select target —', 'bulk-categorize-posts' ); ?></option>
							<?php foreach ( $all_categories as $cat ) : ?>
								<option value="<?php echo esc_attr( $cat->term_id ); ?>">
									<?php echo esc_html( $cat->name ); ?>
								</option>
							<?php endforeach; ?>
						</select>
						<p class="description"><?php esc_html_e( 'Posts will be assigned to this category.', 'bulk-categorize-posts' ); ?></p>
					</td>
				</tr>
			</table>

			<p class="submit">
				<input
					type="submit"
					name="bcp_submit"
					class="button button-primary"
					value="<?php esc_attr_e( 'Reassign Posts', 'bulk-categorize-posts' ); ?>"
					onclick="return confirm('<?php esc_attr_e( 'This will update all matching posts. Continue?', 'bulk-categorize-posts' ); ?>')"
				/>
			</p>
		</form>

		<hr>
		<p style="color:#888; font-size:12px;">
			<?php
			printf(
				/* translators: %s = author name with link */
				esc_html__( 'Plugin by %s', 'bulk-categorize-posts' ),
				'<a href="https://hadi-mirza.com" target="_blank">Mirza Hadi</a>'
			);
			?>
			&nbsp;|&nbsp;
			<a href="mailto:mirzahadi@hotmail.com">mirzahadi@hotmail.com</a>
			&nbsp;|&nbsp;
			<a href="https://github.com/Hadibaig" target="_blank">GitHub</a>
			&nbsp;|&nbsp;
			<a href="https://linkedin.com/in/hadibaig" target="_blank">LinkedIn</a>
		</p>
	</div>
	<?php
}
