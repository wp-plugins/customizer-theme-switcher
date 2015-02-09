(function( wp, $ ){

	if ( ! wp || ! wp.customize ) { return; }
	api = wp.customize;

	/**
	 * wp.customize.ThemesSection
	 *
	 * Custom section for themes that functions similarly to a backwards panel,
	 * and also handles the single-theme-view rendering and navigation.
	 *
	 * @constructor
	 * @augments wp.customize.Control
	 */
	api.ThemesSection = api.Section.extend({
		currentTheme: '',
		overlay: '',
		template: '',

		/**
		 * @since 4.2.0
		 */
		ready: function () {
			var section = this;
			section.overlay = section.container.find( '.theme-overlay' );
			section.template = wp.template( 'customize-themes-details-view' );

			// Bind global keyboard events.
			$( 'body' ).on( 'keyup', function( event ) {
				if ( ! section.overlay.find( '.theme-wrap' ).is( ':visible' ) ) {
					return;
				}

				// Pressing the right arrow key fires a theme:next event
				if ( 39 === event.keyCode ) {
					section.nextTheme();
				}

				// Pressing the left arrow key fires a theme:previous event
				if ( 37 === event.keyCode ) {
					section.previousTheme();
				}

				// Pressing the escape key fires a theme:collapse event
				if ( 27 === event.keyCode ) {
					section.closeDetails();
				}
			});
		},

		/**
		 * @since 4.2.0
		 */
		attachEvents: function () {
			var meta, section = this;

			// Expand/Collapse section/panel.
			section.container.find( '.accordion-section-title' ).on( 'click keydown', function( event ) {
				if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}
				event.preventDefault(); // Keep this AFTER the key filter above

				if ( section.expanded() ) {
					section.collapse();
				} else {
					section.expand();
				}
			});

			section.container.find( '.themes-panel-back' ).on( 'click keydown', function( event ) {
				if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}

				event.preventDefault(); // Keep this AFTER the key filter above

				section.collapse();
			});

			// Theme navigation in details view.
			section.container.on( 'click keydown', '.left', function( event ) {
				if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}

				event.preventDefault(); // Keep this AFTER the key filter above

				section.previousTheme();
			});

			section.container.on( 'click keydown', '.right', function( event ) {
				if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}

				event.preventDefault(); // Keep this AFTER the key filter above

				section.nextTheme();
			});

			section.container.on( 'click keydown', '.theme-backdrop, .close', function( event ) {
				if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}

				event.preventDefault(); // Keep this AFTER the key filter above

				section.closeDetails();
			});

			section.container.on( 'click keydown', '.theme-actions .button', function( event ) {
				if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}

				$( 'body' ).addClass( 'customize-loading' ); // @todo if they get a `confirm()`, remove the class if they stay (core patch).
			});

			section.container.on( 'input', '#themes-filter', function( event ) {
				var term = event.currentTarget.value.toLowerCase().trim().replace( '-', ' ' ),
					controls = section.controls();
				controls.pop(); // Remove the last control (the add-new control).
				_.each( controls, function( control ) {
					control.filter( term );
				});
				// Update theme count. Note that the add-theme tile is a div.customize-control.
				count = section.container.find( 'li.customize-control:visible' ).length;
				section.container.find( '.theme-count' ).text( count );
			});
		},

		/**
		 * Update UI to reflect expanded state
		 *
		 * @since 4.2.0
		 *
		 * @param {Boolean}  expanded
		 * @param {Object}   args
		 * @param {Boolean}  args.unchanged
		 * @param {Callback} args.completeCallback
		 */
		onChangeExpanded: function ( expanded, args ) {

			// Immediately call the complete callback if there were no changes
			if ( args.unchanged ) {
				if ( args.completeCallback ) {
					args.completeCallback();
				}
				return;
			}

			// Note: there is a second argument 'args' passed
			var position, scroll,
				panel = this,
				section = panel.container.closest( '.accordion-section' ),
				overlay = section.closest( '.wp-full-overlay' ),
				container = section.closest( '.accordion-container' ),
				siblings = container.find( '.open' ),
				topPanel = overlay.find( '#customize-theme-controls > ul > .accordion-section > .accordion-section-title' ).add( '#customize-info > .accordion-section-title' ),
				backBtn = overlay.find( '.themes-panel-back' ),
				panelTitle = section.find( '.accordion-section-title' ).first(),
				content = section.find( '.control-panel-content' );

			if ( expanded ) {

				// Collapse any sibling sections/panels
				api.section.each( function ( otherSection ) {
					if ( otherSection !== panel ) {
						otherSection.collapse( { duration: args.duration } );
					}
				});
				api.panel.each( function ( otherPanel ) {
					if ( panel !== otherPanel ) {
						otherPanel.collapse( { duration: 0 } );
					}
				});

				content.show( 0, function() {
					position = content.offset().top;
					scroll = container.scrollTop();
					content.css( 'margin-top', ( 45 - position - scroll ) );
					section.addClass( 'current-panel' );
					overlay.addClass( 'in-themes-panel' );
					container.scrollTop( 0 );
					if ( args.completeCallback ) {
						args.completeCallback();
					}
				} );
				topPanel.attr( 'tabindex', '-1' );
				backBtn.attr( 'tabindex', '0' );
				backBtn.focus();
			} else {
				siblings.removeClass( 'open' );
				section.removeClass( 'current-panel' );
				overlay.removeClass( 'in-themes-panel' );
				content.delay( 180 ).hide( 0, function() {
					content.css( 'margin-top', 'inherit' ); // Reset
					if ( args.completeCallback ) {
						args.completeCallback();
					}
				} );
				topPanel.attr( 'tabindex', '0' );
				backBtn.attr( 'tabindex', '-1' );
				panelTitle.focus();
				container.scrollTop( 0 );
			}
		},

		/**
		 * Advance the modal to the next theme.
		 *
		 * @since 4.2.0
		 */
		nextTheme: function () {
			var section = this;
			if ( section.getNextTheme() ) {
				section.showDetails( section.getNextTheme(), function() {
					section.overlay.find( '.right' ).focus();
				} );
			}
		},

		/**
		 * Get the next theme model.
		 *
		 * @since 4.2.0
		 */
		getNextTheme: function () {
			var control, next;
			control = api.control( 'theme_' + this.currentTheme );
			next = control.container.next( 'li.customize-control-theme' );
			if ( ! next.length ) {
				return false;
			}
			next = next[0].id.replace( 'customize-control-', '' );
			control = api.control( next );

			return control.params.theme;
		},

		/**
		 * Advance the modal to the previous theme.
		 *
		 * @since 4.2.0
		 */
		previousTheme: function () {
			var section = this;
			if ( section.getPreviousTheme() ) {
				section.showDetails( section.getPreviousTheme(), function() {
					section.overlay.find( '.left' ).focus();
				} );
			}
		},

		/**
		 * Get the previous theme model.
		 *
		 * @since 4.2.0
		 */
		getPreviousTheme: function () {
			var control, previous;
			control = api.control( 'theme_' + this.currentTheme );
			previous = control.container.prev( 'li.customize-control-theme' );
			if ( ! previous.length ) {
				return false;
			}
			previous = previous[0].id.replace( 'customize-control-', '' );
			control = api.control( previous );

			return control.params.theme;
		},

		/**
		 * Disable buttons when we're viewing the first or last theme.
		 *
		 * @since 4.2.0
		 */
		updateLimits: function () {
			if ( ! this.getNextTheme() ) {
				this.overlay.find( '.right' ).addClass( 'disabled' );
			}
			if ( ! this.getPreviousTheme() ) {
				this.overlay.find( '.left' ).addClass( 'disabled' );
			}
		},

		/**
		 * Render & show the theme details for a given theme model.
		 *
		 * @since 4.2.0
		 *
		 * @param {Object}   theme
		 */
		showDetails: function ( theme, callback ) {
			var section = this;
			callback = callback || function(){};
			section.currentTheme = theme.id;
			section.overlay.html( section.template( theme ) )
			               .fadeIn( 'fast' )
			               .focus();
			$( 'body' ).addClass( 'modal-open' );
			section.containFocus( section.overlay );
			section.updateLimits();
			callback();
		},

		/**
		 * Close the theme details modal.
		 *
		 * @since 4.2.0
		 */
		closeDetails: function ( theme ) {
			$( 'body' ).removeClass( 'modal-open' );
			this.overlay.fadeOut( 'fast' );
			api.control( 'theme_' + this.currentTheme ).focus();
		},

		/**
		 * Keep tab focus within the theme details modal.
		 *
		 * @since 4.2.0
		 */
		containFocus: function( el ) {
			var tabbables;

			el.on( 'keydown', function( event ) {

				// Return if it's not the tab key
				// When navigating with prev/next focus is already handled
				if ( 9 !== event.keyCode ) {
					return;
				}

				// uses jQuery UI to get the tabbable elements
				tabbables = $( ':tabbable', el );

				// Keep focus within the overlay
				if ( tabbables.last()[0] === event.target && ! event.shiftKey ) {
					tabbables.first().focus();
					return false;
				} else if ( tabbables.first()[0] === event.target && event.shiftKey ) {
					tabbables.last().focus();
					return false;
				}
			});
		}
	});

	/**
	 * wp.customize.ThemeControl
	 *
	 * @constructor
	 * @augments wp.customize.Control
	 */
	api.ThemeControl = api.Control.extend({

		/**
		 * @since 4.2.0
		 */
		ready: function() {
			var control = this;

			// Bind details view trigger.
			control.container.on( 'click keydown', '.theme', function( event ) {
				if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}

				if ( 'button' === event.target.className ) {
					return;
				}

				api.section( control.section() ).showDetails( control.params.theme );
			});

			control.container.on( 'click keydown', '.theme-actions .button', function( event ) {
				if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}

				$( 'body' ).addClass( 'customize-loading' ); // @todo if they get a `confirm()`, remove the class if they stay (core patch).
			});
		},

		/**
		 * Show or hide the theme based on the presence of the term in the title, description, and author.
		 *
		 * @since 4.2.0
		 */
		filter: function( term ) {
			// This probably isn't the best way to do this, but it works for searches like an author, a name, a tag (ex. one column), and certain keywords.
			var control = this,
			    haystack = control.params.theme.name + ' '
				           + control.params.theme.description + ' '
				           + control.params.theme.tags + ' '
				           + control.params.theme.author;
			haystack = haystack.toLowerCase().replace( '-', ' ' );
			if ( -1 !== haystack.search( term ) ) {
				control.activate();
			} else {
				control.deactivate();
			}
		}
	});

	/**
	 * Extend wp.customize.sectionConstructor with the custom themes section,
	 * extend wp.customize.controlConstructor with the custom theme control.
	 */
	$.extend( api.sectionConstructor, {
		themes: api.ThemesSection
	});
	$.extend( api.controlConstructor, {
		theme: api.ThemeControl
	});

})( window.wp, jQuery );