<?php
/**
 * "Analytics" tab: shows request stats for llms.txt / llms-full.txt,
 * including a breakdown by AI crawler / bot.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$llmsg_settings = LLMS_Generator_Settings::get_settings();

if ( empty( $llmsg_settings['enable_logging'] ) ) {
	?>
	<div class="llmsg-card">
		<h2><?php esc_html_e( 'Analytics', 'hs3dev-llms-generator' ); ?></h2>
		<p>
			<?php
			printf(
				wp_kses(
					/* translators: %s: link to settings tab */
					__( 'Logging is currently disabled. Enable "Log requests to llms.txt and llms-full.txt" on the %s tab to start collecting data.', 'hs3dev-llms-generator' ),
					array( 'a' => array( 'href' => array() ) )
				),
				'<a href="' . esc_url( add_query_arg( array( 'page' => 'hs3dev-llms-generator', 'tab' => 'settings' ), admin_url( 'admin.php' ) ) ) . '">' . esc_html__( 'Settings', 'hs3dev-llms-generator' ) . '</a>'
			);
			?>
		</p>
	</div>
	<?php
	return;
}

$llmsg_summary = LLMS_Generator_Logger::get_summary( 30 );

$llmsg_by_file_counts = array(
	'llms'      => 0,
	'llms-full' => 0,
);
foreach ( $llmsg_summary['by_file'] as $llmsg_row ) {
	if ( isset( $llmsg_by_file_counts[ $llmsg_row->file_type ] ) ) {
		$llmsg_by_file_counts[ $llmsg_row->file_type ] = (int) $llmsg_row->total;
	}
}

$llmsg_max_daily = 0;
foreach ( $llmsg_summary['daily'] as $llmsg_row ) {
	$llmsg_max_daily = max( $llmsg_max_daily, (int) $llmsg_row->total );
}
?>

<div class="llmsg-card-row">
	<div class="llmsg-card llmsg-stat-card">
		<span class="llmsg-stat-number"><?php echo esc_html( number_format_i18n( $llmsg_summary['total'] ) ); ?></span>
		<span class="llmsg-stat-label"><?php esc_html_e( 'Total requests (30 days)', 'hs3dev-llms-generator' ); ?></span>
	</div>
	<div class="llmsg-card llmsg-stat-card">
		<span class="llmsg-stat-number"><?php echo esc_html( number_format_i18n( $llmsg_by_file_counts['llms'] ) ); ?></span>
		<span class="llmsg-stat-label"><?php esc_html_e( 'llms.txt requests', 'hs3dev-llms-generator' ); ?></span>
	</div>
	<div class="llmsg-card llmsg-stat-card">
		<span class="llmsg-stat-number"><?php echo esc_html( number_format_i18n( $llmsg_by_file_counts['llms-full'] ) ); ?></span>
		<span class="llmsg-stat-label"><?php esc_html_e( 'llms-full.txt requests', 'hs3dev-llms-generator' ); ?></span>
	</div>
</div>

<div class="llmsg-card">
	<h2><?php esc_html_e( 'Requests Over Time (30 days)', 'hs3dev-llms-generator' ); ?></h2>

	<?php if ( empty( $llmsg_summary['daily'] ) ) : ?>
		<p><?php esc_html_e( 'No requests recorded yet.', 'hs3dev-llms-generator' ); ?></p>
	<?php else : ?>
		<div class="llmsg-bar-chart">
			<?php foreach ( $llmsg_summary['daily'] as $llmsg_row ) :
				$llmsg_height = $llmsg_max_daily > 0 ? round( ( (int) $llmsg_row->total / $llmsg_max_daily ) * 100 ) : 0;
				$llmsg_height = max( $llmsg_height, 4 );
				?>
				<div class="llmsg-bar-col">
					<div class="llmsg-bar" style="height: <?php echo esc_attr( $llmsg_height ); ?>%;" title="<?php echo esc_attr( $llmsg_row->total ); ?>"></div>
					<span class="llmsg-bar-label"><?php echo esc_html( date_i18n( 'M j', strtotime( $llmsg_row->day ) ) ); ?></span>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</div>

<div class="llmsg-card">
	<h2><?php esc_html_e( 'Requests by Bot / Crawler', 'hs3dev-llms-generator' ); ?></h2>

	<?php if ( empty( $llmsg_summary['by_bot'] ) ) : ?>
		<p><?php esc_html_e( 'No requests recorded yet.', 'hs3dev-llms-generator' ); ?></p>
	<?php else : ?>
		<table class="widefat striped">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Bot / Crawler', 'hs3dev-llms-generator' ); ?></th>
					<th><?php esc_html_e( 'Requests', 'hs3dev-llms-generator' ); ?></th>
					<th><?php esc_html_e( 'Last Seen', 'hs3dev-llms-generator' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $llmsg_summary['by_bot'] as $llmsg_row ) : ?>
					<tr>
						<td><?php echo esc_html( $llmsg_row->bot_name ); ?></td>
						<td><?php echo esc_html( number_format_i18n( $llmsg_row->total ) ); ?></td>
						<td><?php echo esc_html( get_date_from_gmt( $llmsg_row->last_seen, 'Y-m-d H:i' ) ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	<?php endif; ?>
</div>

<div class="llmsg-card">
	<h2><?php esc_html_e( 'Recent Requests', 'hs3dev-llms-generator' ); ?></h2>

	<?php if ( empty( $llmsg_summary['recent'] ) ) : ?>
		<p><?php esc_html_e( 'No requests recorded yet.', 'hs3dev-llms-generator' ); ?></p>
	<?php else : ?>
		<div class="llmsg-recent-table-wrap">
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Date', 'hs3dev-llms-generator' ); ?></th>
						<th><?php esc_html_e( 'File', 'hs3dev-llms-generator' ); ?></th>
						<th><?php esc_html_e( 'Bot / Crawler', 'hs3dev-llms-generator' ); ?></th>
						<th><?php esc_html_e( 'User Agent', 'hs3dev-llms-generator' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $llmsg_summary['recent'] as $llmsg_row ) : ?>
						<tr>
							<td><?php echo esc_html( get_date_from_gmt( $llmsg_row->requested_at, 'Y-m-d H:i' ) ); ?></td>
							<td><?php echo esc_html( 'llms-full' === $llmsg_row->file_type ? 'llms-full.txt' : 'llms.txt' ); ?></td>
							<td><?php echo esc_html( $llmsg_row->bot_name ); ?></td>
							<td class="llmsg-ua-cell"><?php echo esc_html( $llmsg_row->user_agent ); ?></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
	<?php endif; ?>
</div>
