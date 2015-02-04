<?php
/**
 * Plugin Name: Customizer Theme Switcher
 * Plugin URI: http://wordpress.org/plugins/customizer-theme-switcher
 * Description: Bringing themes and the Customizer together.
 * Version: 0.8
 * Author: Nick Halsey
 * Author URI: http://nick.halsey.co/
 * Tags: themes, customizer, theme customizer
 * License: GPL

=====================================================================================
Copyright (C) 2015 Nick Halsey

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with WordPress; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
=====================================================================================
*/

add_action( 'customize_register', 'customizer_theme_switcher_register' );
/**
 * Register Customizer Objects for theme-switching.
 *
 * @param WP_Customize_Manager $wp_customize Customizer manager object.
 * @since 4.2.0
 */
function customizer_theme_switcher_register( $wp_customize ) {

	/**
	 * Customize Themes Section Class.
	 *
	 * A UI container for theme controls, which behaves like a backwards Panel.
	 *
	 * @package WordPress
	 * @subpackage Customize
	 * @since 3.4.0
	 */
	class WP_Customize_Themes_Section extends WP_Customize_Section {
		public $type = 'themes';

		/**
		 * Render the themes section, which behaves like a panel.
		 *
		 * @since 4.2.0
		 */
		protected function render() {
			$classes = 'accordion-section control-section control-section-' . $this->type;
			?>
			<li id="accordion-section-<?php echo esc_attr( $this->id ); ?>" class="<?php echo esc_attr( $classes ); ?>">
				<h3 class="accordion-section-title" tabindex="0">
					<?php echo esc_html( $this->title ); ?>
					<span class="screen-reader-text"><?php _e( 'Press return or enter to expand' ); ?></span>
				</h3>
				<span class="control-panel-back themes-panel-back" tabindex="-1"><span class="screen-reader-text"><?php _e( 'Back' ); ?></span></span>
				<div class="customize-themes-panel control-panel-content themes-php">
					<h2><?php esc_html_e( 'Themes' ); ?>
						<span class="title-count theme-count"><?php echo count( $this->controls ) - 1; ?></span>
					<?php if ( ! is_multisite() && current_user_can( 'install_themes' ) ) : ?>
						<a href="<?php echo admin_url( 'theme-install.php' ); ?>" target="_top" class="add-new-h2"><?php echo esc_html_x( 'Add New', 'Add new theme' ); ?></a>
					<?php endif; ?>
					</h2>
					<div class="theme-overlay" tabindex="0" role="dialog" aria-label="<?php esc_attr_e( 'Theme details' ); ?>"></div>
					<div id="customize-container"></div>
					<?php if ( 6 < count( $this->controls ) ) : ?>
						<p><label for="themes-filter">
							<span class="screen-reader-text"><?php _e( 'Search installed themes...' ); ?></span>
							<input type="search" id="themes-filter" placeholder="<?php esc_attr_e( 'Search installed themes...' ); ?>" />
						</label></p>
					<?php endif; ?>
					<div class="theme-browser rendered">
						<ul class="themes accordion-section-content">
						</ul>
					</div>
				</div>
			</li>
	<?php }
	}

	/**
	 * Customize Theme Control Class, to go in class-wp-customize-control.php.
	 *
	 * @package WordPress
	 * @subpackage Customize
	 * @since 4.2.0
	 */
	class WP_Customize_Theme_Control extends WP_Customize_Control {
		public $type = 'theme';
		public $theme;

		/**
		 * Enqueue scripts/styles (should be moved to customize-controls.js).
		 *
		 * @since 4.2.0
		 */
		public function enqueue() {
			wp_enqueue_style( 'customize-themes', plugin_dir_url( __FILE__ ) . '/customize-themes.css' );
			wp_enqueue_script( 'customize-themes', plugin_dir_url( __FILE__ ) . '/customize-themes.js', array( 'jquery', 'customize-controls' ) );
		}

		/**
		 * Refresh the parameters passed to the JavaScript via JSON.
		 *
		 * @since 4.2.0
		 * @uses WP_Customize_Control::to_json()
		 */
		public function to_json() {
			parent::to_json();
			$this->json['theme'] = $this->theme;
		}

		/**
		 * Don't render the control content from PHP, as it's rendered via JS on load.
		 *
		 * @since 4.2.0
		 */
		public function render_content() {}

		/**
		 * Render a JS template for theme display.
		 *
		 * @since 4.2.0
		 */
		public function content_template() {
		?>
			<div class="theme<# if ( data.theme.active ) { #> active<# } #>" tabindex="0" aria-describedby="{{ data.theme.id }}-action {{ data.theme.id }}-name">
				<# if ( data.theme.screenshot[0] ) { #>
					<div class="theme-screenshot">
						<img src="{{ data.theme.screenshot[0] }}" alt="" />
					</div>
				<# } else { #>
					<div class="theme-screenshot blank"></div>
				<# } #>
				<span class="more-details" id="{{ data.theme.id }}-action"><?php _e( 'Theme Details' ); ?></span>
				<div class="theme-author"><?php printf( __( 'By %s' ), '{{{ data.theme.author }}}' ); ?></div>

				<# if ( data.theme.active ) { #>
					<h3 class="theme-name" id="{{ data.theme.id }}-name"><span><?php _ex( 'Previewing:', 'theme' ); ?></span> {{{ data.theme.name }}}</h3>
				<# } else { #>
					<h3 class="theme-name" id="{{ data.theme.id }}-name">{{{ data.theme.name }}}</h3>
				<# } #>

				<# if ( ! data.theme.active ) { #>
					<div class="theme-actions">
						<a class="button" href="<?php echo add_query_arg( 'theme', '{{{ data.theme.id }}}', remove_query_arg( 'theme' ) ); ?>" target="_top"><?php _e( 'Live Preview' ); ?></a>
					</div>
				<# } #>
			</div>
		<?php
		}
	}

	/**
	 * Customize New Theme Control Class, to go in class-wp-customize-control.php.
	 *
	 * @package WordPress
	 * @subpackage Customize
	 * @since 4.2.0
	 */
	class WP_Customize_New_Theme_Control extends WP_Customize_Control {

		/**
		 * Render the new control.
		 *
		 * @since 4.2.0
		 */
		public function render() {
			if ( is_multisite() || ! current_user_can( 'install_themes') ) {
				return;
			}
			?>
			<div class="theme add-new-theme">
				<a href="<?php echo admin_url( 'theme-install.php' ); ?>" target="_top">
					<div class="theme-screenshot">
						<span></span>
					</div>
					<h3 class="theme-name"><?php _e( 'Add New Theme' ); ?></h3>
				</a>
			</div>
			<?php
		}
	}

	// Customize register - in register_controls() in class-wp-customize-manager.php.
	$wp_customize->register_control_type( 'WP_Customize_Theme_Control' );

	// Themes Section.
	$wp_customize->add_section( new WP_Customize_Themes_Section( $wp_customize, 'themes', array(
		'title' => sprintf( __( 'Theme: %s' ), $wp_customize->theme()->display('Name') ),
		'capability' => 'switch_themes',
		'priority' => 0,
	) ) );

	// Themes Setting (unused - the theme is considerably more fundamental to the Customizer experience).
	$wp_customize->add_setting( new WP_Customize_Filter_Setting(
		$wp_customize,
		'active_theme',
		array(
			'capability' => 'switch_themes',
		) ) );

	require_once( ABSPATH . 'wp-admin/includes/theme.php' );

	// Theme Controls.
	$themes = wp_prepare_themes_for_js();
	foreach ( $themes as $theme ) {
		$theme_id = 'theme_' . $theme['id'];
		$wp_customize->add_control( new WP_Customize_Theme_Control( $wp_customize, $theme_id, array(
			'theme' => $theme,
			'section' => 'themes',
			'settings' => 'active_theme',
		) ) );
	}
	$wp_customize->add_control( new WP_Customize_New_Theme_Control( $wp_customize, 'add_theme', array(
		'section' => 'themes',
		'settings' => 'active_theme',
	) ) );
}

add_action( 'customize_controls_print_footer_scripts', 'customize_themes_templates' );
/**
 * Print JS templates for the theme-browsing UI.
 *
 * @since 4.2.0
 */
function customize_themes_templates() {
	?>
	<script type="text/html" id="tmpl-customize-themes-details-view">
		<div class="theme-backdrop"></div>
		<div class="theme-wrap">
			<div class="theme-header">
				<button type="button" class="left dashicons dashicons-no"><span class="screen-reader-text"><?php _e( 'Show previous theme' ); ?></span></button>
				<button type="button" class="right dashicons dashicons-no"><span class="screen-reader-text"><?php _e( 'Show next theme' ); ?></span></button>
				<button type="button" class="close dashicons dashicons-no"><span class="screen-reader-text"><?php _e( 'Close details dialog' ); ?></span></button>
			</div>
			<div class="theme-about">
				<div class="theme-screenshots">
				<# if ( data.screenshot[0] ) { #>
					<div class="screenshot"><img src="{{ data.screenshot[0] }}" alt="" /></div>
				<# } else { #>
					<div class="screenshot blank"></div>
				<# } #>
				</div>

				<div class="theme-info">
					<# if ( data.active ) { #>
						<span class="current-label"><?php _e( 'Current Theme' ); ?></span>
					<# } #>
					<h3 class="theme-name">{{{ data.name }}}<span class="theme-version"><?php printf( __( 'Version: %s' ), '{{{ data.version }}}' ); ?></span></h3>
					<h4 class="theme-author"><?php printf( __( 'By %s' ), '{{{ data.authorAndUri }}}' ); ?></h4>
					<p class="theme-description">{{{ data.description }}}</p>

					<# if ( data.parent ) { #>
						<p class="parent-theme"><?php printf( __( 'This is a child theme of %s.' ), '<strong>{{{ data.parent }}}</strong>' ); ?></p>
					<# } #>

					<# if ( data.tags ) { #>
						<p class="theme-tags"><span><?php _e( 'Tags:' ); ?></span> {{{ data.tags }}}</p>
					<# } #>
				</div>
			</div>

			<div class="theme-actions">
				<# if ( ! data.active ) { #>
					<div class="inactive-theme">
						<a href="<?php echo add_query_arg( 'theme', '{{{ data.id }}}', remove_query_arg( 'theme' ) ); ?>" target="_top" class="button button-primary"><?php _e( 'Live Preview' ); ?></a>
					</div>
				<# } #>
			</div>
		</div>
	</script>
	<?php
}
