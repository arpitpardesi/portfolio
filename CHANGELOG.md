# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.4.0] - 2026-08-29

### Refactored
- **UI Styling**: Redesigned button hover states and interactive UI components with improved glassmorphism aesthetic and smooth spring transitions.
- **Routing Logic**: Streamlined navigation state management and component lazy-loading handlers.

### Chores
- **Version Bump**: Updated project version to 4.4 in `package.json`.

---

## [4.3.1] - 2026-08-29

### Fixed
- **Splash Audio**: Added exception handling for browser autoplay policies during startup splash screen sequence.

---

## [4.3.0] - 2026-08-29

### Added
- **SettingsContext**: Global settings synchronization using Firebase Firestore real-time snapshots.
- **Analytics Dashboard**: Integrated live visitor analytics dashboard for site metric monitoring.

---

## [4.0.0] - 2026-08-28

### Added
- **Blog System**: Implemented full-featured Blog module supporting Markdown posts, dynamic route slugging, tag filtering, and admin CRUD controls.
- **Home Blog Showcase**: Added recent blog posts preview section to main landing page.
- **Command Palette Integration**: Search and navigate to blog posts directly via `Cmd+K`.

---

## [3.4.0] - 2026-08-16

### Added
- **Dynamic Accent Color**: Synchronized live dynamic accent color system across components using `CustomEvent` and `MutationObserver`.
- **Command Palette Search**: Dynamic search indexing for Firestore-backed projects, hobbies, and blog entries.

---

## [3.3.0] - 2026-08-15

### Added
- **Scroll Progress**: Header-integrated scroll progress bar indicator.
- **Project Filtering**: Category filter tabs for interactive project discovery.

---

## [3.0.0] - 2026-01-28

### Added
- **Physics Playground**: Interactive 2D physics simulation environment powered by Matter.js.
- **Project Modal**: Multi-media carousel supporting Cloudinary videos and image assets inside project details modal.
- **Martian Red Theme**: Implemented dark theme palette with Martian Red default styling.

---

## [2.0.0] - 2025-12-18

### Added
- **Theme Switcher**: Multi-theme switching utility supporting custom color accents.
- **Admin Panel**: Firebase-authenticated admin dashboard for dynamic content editing.
- **Beyond Work Pages**: Sub-pages for AI experiments, IoT projects, Photography, and Raspberry Pi showcase.

---

## [1.0.0] - 2022-10-26

### Added
- **Initial Release**: Launched baseline portfolio website built with React and deployed to GitHub Pages.
