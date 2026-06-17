/* global jQuery, llmsgData */
jQuery( function ( $ ) {
	'use strict';

	var generatedData = {};

	try {
		var raw = $( '#llmsg-generated-data' ).text();
		generatedData = raw ? JSON.parse( raw ) : {};
	} catch ( e ) {
		generatedData = {};
	}

	/**
	 * Generate button: kicks off a batched generation run and polls/loops
	 * through batches, updating a progress bar, until the run is complete.
	 * On multilingual sites, either generates one selected language or
	 * loops through all of them sequentially.
	 */
	$( '#llmsg-generate-btn' ).on( 'click', function () {
		var $btn = $( this );
		var $status = $( '#llmsg-generate-status' );
		var $progressWrap = $( '#llmsg-progress-wrap' );
		var $progressBar = $( '#llmsg-progress-bar' );
		var $progressText = $( '#llmsg-progress-text' );
		var $langSelect = $( '#llmsg-language-select' );

		var languagesToRun = [];
		if ( $langSelect.length ) {
			var selected = $langSelect.val();
			if ( selected ) {
				languagesToRun = [ selected ];
			} else {
				// "All languages": collect every option except the blank "All languages" one.
				$langSelect.find( 'option' ).each( function () {
					if ( $( this ).val() ) {
						languagesToRun.push( $( this ).val() );
					}
				} );
			}
		} else {
			languagesToRun = [ '' ]; // Single-language site: one run, no lang_code.
		}

		$btn.prop( 'disabled', true );
		$status.text( '' );
		$progressWrap.show();

		runLanguageQueue( languagesToRun, 0, $btn, $progressWrap, $progressBar, $progressText, $status );
	} );

	/**
	 * Runs generation for one language, then moves to the next in the list
	 * once complete. With a single-language site, languages is [ '' ] and
	 * this runs exactly once.
	 *
	 * @param {Array} languages List of language codes to process in order.
	 * @param {number} index Current position in the list.
	 * @param {jQuery} $btn Generate button.
	 * @param {jQuery} $progressWrap Progress bar container.
	 * @param {jQuery} $progressBar Progress bar fill element.
	 * @param {jQuery} $progressText Progress label element.
	 * @param {jQuery} $status Status text element.
	 */
	function runLanguageQueue( languages, index, $btn, $progressWrap, $progressBar, $progressText, $status ) {
		if ( index >= languages.length ) {
			$btn.prop( 'disabled', false );
			$status.text( 'Done!' );
			setTimeout( function () {
				$progressWrap.hide();
				$status.text( '' );
			}, 1500 );
			return;
		}

		var langCode = languages[ index ];
		var langLabel = langCode ? langCode.toUpperCase() : '';

		$progressBar.css( 'width', '0%' );
		$progressText.text( langLabel ? ( 'Starting ' + langLabel + '...' ) : 'Starting...' );

		$.post( llmsgData.ajaxUrl, {
			action: 'llmsg_generate_start',
			nonce: llmsgData.nonce,
			lang_code: langCode,
			include_meta_description: $( '#llmsg-include-meta' ).is( ':checked' )
		} ).done( function ( startResponse ) {
			if ( ! startResponse.success ) {
				var msg = ( startResponse.data && startResponse.data.message ) ? startResponse.data.message : 'Unknown error.';
				$status.text( 'Error: ' + msg );
				$btn.prop( 'disabled', false );
				$progressWrap.hide();
				return;
			}

			var total = startResponse.data.total || 0;

			if ( 0 === total ) {
				// Nothing to generate for this language; move to the next one.
				runLanguageQueue( languages, index + 1, $btn, $progressWrap, $progressBar, $progressText, $status );
				return;
			}

			runBatch( total, langCode, langLabel, function () {
				runLanguageQueue( languages, index + 1, $btn, $progressWrap, $progressBar, $progressText, $status );
			}, $btn, $progressBar, $progressText, $status );
		} ).fail( function () {
			$status.text( 'Request failed. Please try again.' );
			$btn.prop( 'disabled', false );
			$progressWrap.hide();
		} );
	}

	/**
	 * Recursively processes one batch at a time for the current language
	 * and updates the progress UI, calling onComplete once the server
	 * reports the run for this language is done.
	 *
	 * @param {number} total Total items in the queue (for percentage calc).
	 * @param {string} langCode Language code being processed (empty for single-language sites).
	 * @param {string} langLabel Human-readable label for status text.
	 * @param {Function} onComplete Called once this language's run finishes.
	 * @param {jQuery} $btn Generate button.
	 * @param {jQuery} $progressBar Progress bar fill element.
	 * @param {jQuery} $progressText Progress label element.
	 * @param {jQuery} $status Status text element.
	 */
	function runBatch( total, langCode, langLabel, onComplete, $btn, $progressBar, $progressText, $status ) {
		$.post( llmsgData.ajaxUrl, {
			action: 'llmsg_generate_batch',
			nonce: llmsgData.nonce,
			lang_code: langCode
		} ).done( function ( response ) {
			if ( ! response.success ) {
				var msg = ( response.data && response.data.message ) ? response.data.message : 'Unknown error.';
				$status.text( 'Error: ' + msg );
				$btn.prop( 'disabled', false );
				return;
			}

			var processed = response.data.processed || 0;
			var pct = total > 0 ? Math.min( 100, Math.round( ( processed / total ) * 100 ) ) : 100;
			var prefix = langLabel ? ( langLabel + ': ' ) : '';

			$progressBar.css( 'width', pct + '%' );
			$progressText.text( prefix + processed + ' / ' + total + ' items processed' );

			if ( response.data.done ) {
				if ( ! langCode ) {
					generatedData = {
						llms_txt: response.data.llms_txt || '',
						llms_full_txt: response.data.llms_full_txt || '',
						generated_at: response.data.generated_at || ''
					};
					$( '#llmsg-last-generated' ).text( 'Last generated: ' + generatedData.generated_at );
				}

				onComplete();
			} else {
				runBatch( total, langCode, langLabel, onComplete, $btn, $progressBar, $progressText, $status );
			}
		} ).fail( function () {
			$status.text( 'Request failed during processing. Click Generate to retry.' );
			$btn.prop( 'disabled', false );
		} );
	}

	/**
	 * View buttons: open the modal with the requested file content.
	 */
	$( '.llmsg-view-btn' ).on( 'click', function () {
		var target = $( this ).data( 'target' );
		var content = generatedData[ target ] || '';
		var title = ( 'llms_full_txt' === target ) ? 'llms-full.txt' : 'llms.txt';

		if ( ! content ) {
			content = 'Nothing generated yet. Click "Generate Files" first.';
		}

		$( '#llmsg-modal-title' ).text( title );
		$( '#llmsg-modal-body' ).val( content );
		$( '#llmsg-modal' ).show();
	} );

	$( '.llmsg-modal-close' ).on( 'click', function () {
		$( '#llmsg-modal' ).hide();
	} );

	$( '#llmsg-modal' ).on( 'click', function ( e ) {
		if ( e.target === this ) {
			$( this ).hide();
		}
	} );

	/**
	 * Clear Analytics Data: wipes the logs table after confirmation.
	 */
	$( '#llmsg-clear-logs-btn' ).on( 'click', function () {
		if ( ! window.confirm( 'This will permanently delete all recorded analytics data. Continue?' ) ) {
			return;
		}

		var $btn = $( this );
		var $status = $( '#llmsg-clear-logs-status' );

		$btn.prop( 'disabled', true );
		$status.text( 'Clearing...' );

		$.post( llmsgData.ajaxUrl, {
			action: 'llmsg_clear_logs',
			nonce: llmsgData.nonce
		} ).done( function ( response ) {
			if ( response.success ) {
				$status.text( 'Cleared.' );
				setTimeout( function () {
					window.location.reload();
				}, 600 );
			} else {
				$status.text( 'Error clearing data.' );
			}
		} ).fail( function () {
			$status.text( 'Request failed.' );
		} ).always( function () {
			$btn.prop( 'disabled', false );
		} );
	} );

	/**
	 * Verify Live File: checks for physical file conflicts and fetches the
	 * actual public URL (cache-busted) to compare against what's stored,
	 * then renders a plain-language explanation of the result.
	 */
	$( '.llmsg-verify-btn' ).on( 'click', function () {
		var fileType = $( this ).data( 'file-type' );
		var $btn = $( this );
		var $result = $( '.llmsg-verify-result[data-file-type="' + fileType + '"]' );

		$btn.prop( 'disabled', true );
		$result.removeClass( 'llmsg-verify-ok llmsg-verify-warn llmsg-verify-error' ).html( '<p>Checking...</p>' ).show();

		$.post( llmsgData.ajaxUrl, {
			action: 'llmsg_verify_live',
			nonce: llmsgData.nonce,
			file_type: fileType
		} ).done( function ( response ) {
			$btn.prop( 'disabled', false );

			if ( ! response.success ) {
				var msg = ( response.data && response.data.message ) ? response.data.message : 'Could not run the check.';
				$result.addClass( 'llmsg-verify-error' ).html( '<p>' + escapeHtml( msg ) + '</p>' );
				return;
			}

			renderVerifyResult( fileType, response.data, $result );
		} ).fail( function () {
			$btn.prop( 'disabled', false );
			$result.addClass( 'llmsg-verify-error' ).html( '<p>Request failed. Please try again.</p>' );
		} );
	} );

	/**
	 * Builds the plain-language verification message based on diagnostic results.
	 *
	 * @param {string} fileType 'llms' or 'llms-full'.
	 * @param {Object} data Response data: physical, live.
	 * @param {jQuery} $result Container to render into.
	 */
	function renderVerifyResult( fileType, data, $result ) {
		var physicalKey = ( 'llms-full' === fileType ) ? 'llms_full' : 'llms';
		var hasPhysicalConflict = data.physical && data.physical[ physicalKey ];
		var fileName = ( 'llms-full' === fileType ) ? 'llms-full.txt' : 'llms.txt';

		if ( hasPhysicalConflict ) {
			$result.addClass( 'llmsg-verify-warn' ).html(
				'<p><strong>A physical ' + fileName + ' file exists in your site\'s root folder.</strong> ' +
				'Static files are served before WordPress loads, so that file is overriding what this plugin generates, ' +
				'regardless of caching. Delete or rename that file via FTP/File Manager (look for ' + fileName + ' in your site\'s root directory, the same folder as wp-config.php), then check again.</p>'
			);
			return;
		}

		if ( null === data.live.matches ) {
			$result.addClass( 'llmsg-verify-error' ).html(
				'<p>Could not fetch the live URL to compare (' + escapeHtml( data.live.error || 'unknown error' ) + '). ' +
				'Try opening ' + escapeHtml( data.live.url ) + ' directly in your browser.</p>'
			);
			return;
		}

		if ( data.live.matches ) {
			$result.addClass( 'llmsg-verify-ok' ).html(
				'<p><strong>All clear.</strong> The live URL matches what this plugin generated. No caching or conflict issues detected.</p>'
			);
			return;
		}

		$result.addClass( 'llmsg-verify-warn' ).html(
			'<p><strong>The live URL does not match the generated content yet.</strong> This is almost always a caching issue: ' +
			'your host, a CDN (e.g. Cloudflare), or a caching plugin is serving an old cached copy of this URL. ' +
			'Try clearing your site/host cache, then check again. If you just disabled another plugin\'s llms.txt feature ' +
			'(e.g. Yoast SEO), this is expected until that cache clears.</p>' +
			'<p class="llmsg-verify-excerpt">Live content preview: <code>' + escapeHtml( data.live.live_excerpt || '(empty)' ) + '</code></p>'
		);
	}

	/**
	 * Post type "Manage individual items": loads the list of posts for that
	 * post type via AJAX (once) and renders checkboxes for exclusion.
	 */
	$( '.llmsg-pt-expand' ).on( 'click', function () {
		var postType = $( this ).data( 'post-type' );
		var $container = $( '.llmsg-posttype-items[data-post-type="' + postType + '"]' );

		if ( $container.is( ':visible' ) ) {
			$container.slideUp();
			return;
		}

		$container.slideDown();

		if ( $container.data( 'loaded' ) ) {
			return;
		}

		$.post( llmsgData.ajaxUrl, {
			action: 'llmsg_get_posts',
			nonce: llmsgData.nonce,
			post_type: postType
		} ).done( function ( response ) {
			if ( ! response.success ) {
				var message = ( response.data && response.data.message ) ? response.data.message : 'Error loading items.';
				$container.html( '<p>' + message + '</p>' );
				return;
			}

			var items = response.data.items || [];

			if ( ! items.length ) {
				$container.html( '<p>No published items found.</p>' );
				$container.data( 'loaded', true );
				return;
			}

			var $hiddenInput = getExcludedInput( postType );
			var excludedIds = ( $hiddenInput.val() || '' )
				.split( ',' )
				.filter( function ( v ) {
					return v !== '';
				} );

			var html = '<ul class="llmsg-item-list">';
			items.forEach( function ( item ) {
				var isExcluded = excludedIds.indexOf( String( item.id ) ) !== -1;
				var checked = isExcluded ? '' : 'checked';
				html += '<li><label><input type="checkbox" class="llmsg-item-checkbox" data-id="' + item.id + '" ' + checked + '> ' + escapeHtml( item.title ) + '</label></li>';
			} );
			html += '</ul>';

			$container.html( html ).data( 'loaded', true );

			$container.on( 'change', '.llmsg-item-checkbox', function () {
				updateExcludedIds( postType );
			} );
		} ).fail( function () {
			$container.html( '<p>Request failed. Please try again.</p>' );
		} );
	} );

	/**
	 * Returns the hidden input that stores excluded post IDs for a post type.
	 *
	 * @param {string} postType Post type slug.
	 * @return {jQuery}
	 */
	function getExcludedInput( postType ) {
		return $( 'input.llmsg-excluded-ids[name="post_types[' + postType + '][excluded_ids]"]' );
	}

	/**
	 * Recomputes the comma-separated list of excluded IDs from unchecked checkboxes.
	 *
	 * @param {string} postType Post type slug.
	 */
	function updateExcludedIds( postType ) {
		var $container = $( '.llmsg-posttype-items[data-post-type="' + postType + '"]' );
		var $hiddenInput = getExcludedInput( postType );

		var excluded = [];
		$container.find( '.llmsg-item-checkbox' ).each( function () {
			if ( ! $( this ).is( ':checked' ) ) {
				excluded.push( $( this ).data( 'id' ) );
			}
		} );

		$hiddenInput.val( excluded.join( ',' ) );
	}

	/**
	 * Minimal HTML escaping for titles rendered into checkbox labels.
	 *
	 * @param {string} str Raw string.
	 * @return {string}
	 */
	function escapeHtml( str ) {
		return String( str )
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' );
	}
} );
