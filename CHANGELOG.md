# Changelog

All notable changes to this project from Day One are documented in this file.

---

## [4.5.4] - 2026-08-29

### Header Navigation & Version History UI Revamp

*Optimized Version History page UI with floating levitation cards, simple connector lines, and mobile menu integration.*

- **FEAT**: add version history link to header, update VersionHistory component styling, and bump version to 4.5.4

---

## [4.5.3] - 2026-08-29

### Git Commit Automation & Dynamic Version Sync

*Automated git log version extraction and linked prestart/prebuild triggers for seamless release tracking.*

- **FEAT**: release version 4.5.3 with GitHub API-integrated version history generation
- **REFACTOR**: automate version history generation using chronological git log parsing and improve deduplication logic
- **REFACTOR**: automate version history generation using chronological git log parsing and improved deduplication logic
- **FEAT**: add latest refactor entry to version history and changelog
- **FEAT**: add version history link to header and update VersionHistory styling

---

## [4.5.2] - 2026-08-29

### Firestore Security Rules & Description Normalization

*Configured public read permissions for versionHistory in firestore.rules and built multi-line description parsers.*

- **FEAT**: implement semver sorting and robust change normalization in VersionHistory component, and bump app version to 4.5.2
- **FEAT**: add versionHistory Firestore rules and implement multiline change log parsing
- **FEAT**: automate version history generation using Git log data and sync with project releases
- **FEAT**: automate version history generation via GitHub API integration and smart commit parsing

---

## [4.5.1] - 2026-08-29

### Dynamic Versioning & SemVer Alignment

*Implemented semantic version sorting (compareSemVer) and added Version History management to Firebase Admin Dashboard.*

- **CHORE**: bump package version to 4.5.1

---

## [4.4] - 2026-08-29

### UI Polish & Navigation Refactor

*Updated button styles with glassmorphic hover effects, glowing accent borders, and streamlined routing navigation logic.*

- **CHORE**: bump project version to 4.4
- **FEAT**: implement version history page with changelog tracking and admin integration

---

## [4.3.1] - 2026-08-29

### Splash Screen Audio Exception Patch

*Added audio exception handlers for startup splash screen sound playback to comply with browser autoplay policies.*

- **CHORE**: bump project version to 4.3.1
- **REFACTOR**: update UI button styles with improved aesthetics and refine navigation routing logic

---

## [4.3] - 2026-08-29

### Firebase SettingsContext & Analytics Dashboard

*Integrated real-time Firebase-backed global SettingsContext and live visitor analytics dashboard for site metric monitoring.*

- **CHORE**: bump version to 4.3 in package.json
- **FEAT**: updated: add exception for the splash screen audio

---

## [4.0] - 2026-08-29

### Full Blog System Launch

*Launched full-featured Blog module supporting Markdown rendering, dynamic route slugging, tag filtering, and Firestore integration.*

- **CHORE**: bump project version to 4.0 woth Blog feature
- **REFACTOR**: transition blog data source to Firestore and remove local fallback posts
- **FEAT**: implement analytics dashboard for monitoring visitor trends and site content metrics
- **FEAT**: implement SettingsContext with real-time Firebase synchronization for global portfolio configuration

---

## [3.4] - 2026-08-28

### Dynamic Accent Color Sync & Command Palette Search

*Added dynamic accent color sync via CustomEvent and MutationObserver alongside Firestore-backed Command Palette search.*

- **STYLE**: bump project version to 3.4 with optimized UI and enhanced features
- **REFACTOR**: update default theme to Martian Red and accent color to red-500 across settings and components
- **FEAT**: overhaul README with comprehensive project documentation and add README_OLD.md to gitignore
- **FEAT**: implement blog system with full CRUD support, navigation integration, and dynamic post routing

---

## [3.3] - 2026-08-15

### Scroll Indicator & Category Filter Tabs

*Added header scroll progress indicator bar and category filter tabs for interactive project discovery.*

- **CHORE**: bump project version to 3.3
- **REFACTOR**: update package-lock.json dependencies
- **FEAT**: implement dynamic accent color updates via CustomEvent and MutationObserver integration
- **FEAT**: enable dynamic Firestore-backed navigation and theme switching in the command palette

---

## [3.0] - 2026-08-15

### Physics Playground, Splash Screen & Martian Red Theme

*Introduced 2D interactive Physics Playground (Matter.js), startup splash screen, PWA support, and Martian Red dark theme.*

- **REFACTOR**: minor update
- **REFACTOR**: analytic dashboard and App logo updated
- **DOC**: Comment out social media links and remove unused icon and Recharts imports.
- **FEAT**: added new favicon
- **FEAT**: Added Global setting in Admin and Firebase for skills
- **DOC**: Comment out "Want to know more about me?" link in About component.
- **FEAT**: Revert "added new favicon"
- **FIX**: fixed some major features
- **DOC**: Commented "Want to know more about me?" link from About component
- **CHORE**: Remove settings page in Admin
- **CHORE**: minor fixes
- **FEAT**: added dynamic content and UI configuration in admin settings
- **FEAT**: added theme option in Admin
- **FEAT**: added resume page
- **CHORE**: enhanced login security
- **CHORE**: Remove unused imports.
- **REFACTOR**: Update Firestore rules
- **REFACTOR**: updated theme selection option in admin settings
- **CHORE**: removed link from the profile photo
- **FIX**: fixed back button
- **CHORE**: removed unused imports
- **FEAT**: added detailed narrative and a quote.
- **CHORE**: optimized the site for mobile view
- **FEAT**: updated loading scrren and added effect
- **CHORE**: restored animation
- **REFACTOR**: updated loading screen
- **REFACTOR**: updated splash screen
- **REFACTOR**: updated the transation in the splash screen
- **FEAT**: added splash screen on startup
- **FIX**: fixed error in splash screen
- **REFACTOR**: updated the startup animation timings
- **REFACTOR**: updated animation in. header and hero
- **REFACTOR**: updated header
- **REFACTOR**: updated text styling
- **REFACTOR**: updated floating animation
- **CHORE**: optimized the responsiveness for splash screen
- **DOC**: removed unnecessary comments
- **FEAT**: Updated the paddings to cover the notificatio areas in mobile devices
- **FEAT**: Adjust header top padding
- **FEAT**: added version
- **REFACTOR**: updated versions
- **REFACTOR**: updated version
- **REFACTOR**: adjusted header for mobile view
- **FIX**: fixed PWA for fullscreen IOS/android
- **REFACTOR**: version update PWA
- **FEAT**: added splash screen sound
- **REFACTOR**: Version update - splash screen sound
- **FIX**: Fixed z axis of resume button (DetailedAbout), back buton(Resume)
- **REFACTOR**: version update
- **CHORE**: adjested font size for mobile device
- **FEAT**: adjested the hero top padding mobile landscape mode
- **REFACTOR**: Updated headings and buttons in homepage sections
- **REFACTOR**: updated projectj modal
- **FEAT**: added theme color to project icons
- **CHORE**: stable version
- **FEAT**: how to added
- **REFACTOR**: date stamp updated
- **FEAT**: added show/hide flag for the entries
- **FEAT**: implement scroll progress indicator, project category filtering, and enhanced component resource management

---

## [2.0] - 2025-12-25

### Theme Switcher, Admin Panel & Cloudinary Multi-Media

*Built dynamic multi-theme switcher, Firebase Auth admin dashboard, Cloudinary multi-media uploads, and Beyond Work explore sections.*

- **CHORE**: initiating the portfolio project
- **FEAT**: Add initial portfolio components and moon phase utility
- **FEAT**: update ThemeSwitcher component and dependencies, triggering build and cache refresh
- **FEAT**: Update React build artifacts and add Google Analytics tracking to `index.html`.
- **FEAT**: add Google Analytics tracking script to index.html.
- **STYLE**: built index.html for gh-pages
- **REFACTOR**: updated header
- **REFACTOR**: update .gitignore to exclude node_modules/ and .cache/ directories.
- **FEAT**: Add `.cache/` to gitignore and refine `node_modules` exclusion.
- **STYLE**: `ThemeSwitcher`'s active theme to the first option.
- **REFACTOR**: Updated content in About section
- **REFACTOR**: Updated content in Hero section
- **FEAT**: Update existing application logos and add new variants
- **STYLE**: Use CSS variable for hero text gradient color.
- **FEAT**: add maskable icons and update manifest to reference new image assets.
- **REFACTOR**: update icon source paths in manifest.json
- **FEAT**: mplement admin login, dashboard, and content management, and add new pages for hobbies, AI, IOT, and Raspberry Pi projects.
- **STYLE**: Comment out playground button in ThemeSwitcher.
- **FIX**: Enhance visitor counter error handling and initial loading state, and simplify hobby page navigation text
- **REFACTOR**: update default theme and accent color variables.
- **FEAT**: Add StarFieldOverlay, revamp visitor counter display, and refine hero text styling, footer layout, and custom cursor z-index.
- **REFACTOR**: Update accent color variables, simplify back button text, and adjust default theme selection.
- **REFACTOR**: updated readme
- **REFACTOR**: Updated Photography page
- **FEAT**: Implement responsiveness in admin dashboard
- **REFACTOR**: refine login UI with new admin styles.
- **REFACTOR**: Updated Login button in homepage header
- **FEAT**: Added analytics dashboard to the admin panel
- **FEAT**: Added admin settings page and enhance login form validation and error handling.
- **FIX**: Fixed Admin Login button in Header Aand Footer
- **FEAT**: Implement Cloudinary multi-media upload and introduce a new AllProjects page.
- **CHORE**: Optimize component functions remove unused imports and variables.
- **FIX**: fixed admin dashboard
- **FIX**: Enhance login  and error handling
- **REFACTOR**: updated contact section
- **FEAT**: Added detailed about page with dynamic timeline connected with firebase and admin dashboard for the same
- **FEAT**: Add a detailed about me page
- **CHORE**: minor changes
- **CHORE**: removed unused imports and variables
- **REFACTOR**: updated project fetch api and Admin page

---

## [1.0] - 2022-11-08

### Initial Portfolio Launch

*Initial release of React portfolio website featuring hero section, project grid, custom header/footer, and GitHub Pages deployment.*

- **CHORE**: Initialize project using Create React App
- **CHORE**: React app created
- **CHORE**: Create jekyll-gh-pages.yml
- **CHORE**: For publishing on github
- **CHORE**: Merge branch 'master' of https://github.com/arpitpardesi/arpitpardesi
- **CHORE**: For Git pages
- **FEAT**: git ignore added
- **CHORE**: Delete node_modules directory
- **CHORE**: Test
- **CHORE**: npm install
- **REFACTOR**: updated build index.html
- **CHORE**: app deployed
- **FEAT**: added how to.txt
- **FEAT**: added favicon, Header and Footer
- **CHORE**: Minor changes
- **REFACTOR**: Update in App.js
- **FEAT**: Added footer css
- **REFACTOR**: updated App.js
- **CHORE**: Deployed
- **FEAT**: added header and footer css
- **REFACTOR**: Update App.js
- **CHORE**: gh pages

---

