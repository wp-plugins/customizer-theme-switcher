=== Customizer Theme Switcher ===
Contributors: celloexpressions, wordpressdotorg
Tags: themes, customizer, theme customizer
Requires at least: 4.1
Tested up to: 4.1
Stable tag: 1.0
Description: Bridging the UX gap between themes and the Customizer.
License: GPLv2

== Description ==
This plugin is a WordPress core feature-plugin proposed for WordPress 4.2. The goal is to bring theme-browsing and theme-switching into the Customizer to streamline the themes experience.

The current status is extremely basic code-wise, but implements most of what's available on the themes admin page. See our <a href="http://make.wordpress.org/core/tag/customizer-theme-switcher">posts on Make WordPress Core</a> for more info.

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
* If user doesn't `confirm` that they want to leave unsaved changes, remove customize-loading body class (requires core patch).

= Code =
* See inline comments.
* Move custom section and control to `class-wp-customize-control|section.php` in `wp-includes`.
* Merge all CSS into customize-controls.css, scope to `.wp-customizer`.
* Move `.themes-panel-back` to the Customizer header, adjust JS accordingly.
* Merge JS into `customizer-controls.js`, after the respective object types.
* Merge remaining PHP (all in Customize Register callback) into `register_controls()` in `class-wp-customize-manager.php`.
* Account for https://core.trac.wordpress.org/ticket/26611

== Changelog ==
See full details here: https://plugins.trac.wordpress.org/log/customizer-theme-switcher.

= 1.0 =
* Iterate on the themes section heading display, more work coming there
* Contain keyboard focus in the theme details modal
* Audit escaping in JS templates
* Code review from @MarkJaquith

= 0.9 =
* More misc. bugfixes
* Accessibility fixes

= 0.8 =
* Misc. bugfixes noted in last week's update post
* Tweak search to not need hyphens for tags
* Start accessibility fixes

= 0.7 =
* Fix script dependencies, props westonruter

= 0.6 =
* Live Preview button UI tweaks
* Add a loading indicator as soon as the user clicks live preview, for instant visual feedback while the Customizer reloads
* Add a search/filter bar when there are more than 5 themes, to make it easier to find a particular theme or feature

= 0.5 =
* Initial commit.

== Upgrade Notice ==
= 0.8 =
* Iterations.

= 0.6 =
* UI/UX improvements: add search bar, loading indicator while switching themes.

= 0.5 =
* Initial commit.