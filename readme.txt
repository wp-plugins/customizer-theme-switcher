=== Customizer Theme Switcher ===
Contributors: celloexpressions, wordpressdotorg
Tags: themes, customizer, theme customizer
Requires at least: 4.1
Tested up to: 4.1
Stable tag: 0.5
Description: Bridging the UX gap between themes and the Customizer.
License: GPLv2

== Description ==
This plugin is a WordPress core feature-plugin that's just getting started. The goal is to bring theme-browsing and theme-switching into the Customizer to streamline the themes experience.

The current status is extremely basic code-wise, but implements most of what's available on the themes admin page. Next steps are to consider whether to include things like theme deletion and broken-theme-management, and to evalute the UX.

If you're interested in contributing to this project, ping @celloexpressions on <a href="http://chat.wordpress.org/">WordPress core Slack</a>.

== Installation ==
1. Take the easy route and install through the WordPress plugin adder OR
1. Download the .zip file and upload the unzipped folder to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Visit the Customizer (Appearance -> Customize) to browse & switch themes.

== Screenshots ==
1. Themes panel heading.
2. Themes panel contents.
3. Single-theme details view, with arrow-navigation.

== Core Merge Notes ==
= UX =
* Remove #customize-info for theme previews.
* Change front-end admin bar Themes link to point to themes in the Customizer (deep-linked).
* When a new theme is activated, go to the home page (front end), not the themes admin.

= Code =
* See inline comments.
* Move custom section and control to `class-wp-customize-control|section.php` in `wp-includes`.
* Merge all CSS into customize-controls.css, scope to `.wp-customizer`.
* Move `.themes-panel-back` to the Customizer header, adjust JS accordingly.
* Merge JS into `customizer-controls.js`, after the respective object types.
* Merge remaining PHP (all in Customize Register callback) into `register_controls()` in `class-wp-customize-manager.php`.

== Changelog ==
See full details here: https://plugins.trac.wordpress.org/log/customizer-theme-switcher.

Next steps:
- Designer iterations
- User testing

= 0.5 =
* Initial commit.

== Upgrade Notice ==
= 0.5 =
* Initial commit.