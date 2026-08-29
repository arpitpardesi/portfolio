# Changelog

All notable changes to this project from Day One are documented in this file.

---

## [4.5.2] - 2026-08-29

### Firestore Security Rules & Multi-Format Description Parsing

*Configured public read permissions for versionHistory in firestore.rules, added firebase.json workspace configuration, and implemented flexible description parsers.*

- **FEAT**: add versionHistory Firestore rules and implement multiline change log parsing
- **FEAT**: implement semver sorting and robust change normalization in VersionHistory component, and bump app version to 4.5.2

---

## [4.5.1] - 2026-08-29

### Dynamic Versioning & SemVer Alignment

*Implemented semantic version sorting (compareSemVer) and added Version History collection management to the Firebase Admin Dashboard.*

- **CHORE**: bump package version to 4.5.1
- **FEAT**: implement version history page with changelog tracking and admin integration

---

## [4.4] - 2026-08-29

### UI Aesthetics Polish & Button Refactor

*Updated button styles with glassmorphic hover effects, glowing accent borders, and streamlined routing navigation logic.*

- **CHORE**: bump project version to 4.4
- **REFACTOR**: update UI button styles with improved aesthetics and refine navigation routing logic

---

## [4.3.1] - 2026-08-29

### Splash Screen Audio Exception Patch

*Added audio exception handlers for startup splash screen sound playback to comply with browser autoplay policies.*

- **CHORE**: bump project version to 4.3.1
- **FEAT**: updated: add exception for the splash screen audio

---

## [4.3] - 2026-08-29

### Firebase SettingsContext & Analytics Dashboard

*Integrated real-time Firebase-backed global SettingsContext and live visitor analytics dashboard for site metric monitoring.*

- **CHORE**: bump version to 4.3 in package.json
- **FEAT**: implement SettingsContext with real-time Firebase synchronization for global portfolio configuration
- **FEAT**: implement analytics dashboard for monitoring visitor trends and site content metrics
- **REFACTOR**: transition blog data source to Firestore and remove local fallback posts

---

## [4.0] - 2026-08-28

### Full Blog System Launch

*Launched full-featured Blog module supporting Markdown rendering, dynamic route slugging, tag filtering, and Firestore integration.*

- **CHORE**: bump project version to 4.0 woth Blog feature
- **FEAT**: implement blog system with full CRUD support, navigation integration, and dynamic post routing
- **FEAT**: overhaul README with comprehensive project documentation and add README_OLD.md to gitignore
- **REFACTOR**: update default theme to Martian Red and accent color to red-500 across settings and components

---

## [3.4] - 2026-08-15

### Dynamic Accent Color Sync & Command Palette Search

*Added dynamic accent color sync via CustomEvent and MutationObserver alongside Firestore-backed Command Palette search.*

- **STYLE**: bump project version to 3.4 with optimized UI and enhanced features
- **FEAT**: enable dynamic Firestore-backed navigation and theme switching in the command palette
- **FEAT**: implement dynamic accent color updates via CustomEvent and MutationObserver integration
- **REFACTOR**: update package-lock.json dependencies

---

## [3.3] - 2026-08-15

### Scroll Indicator & Category Filter Tabs

*Added header scroll progress indicator bar and category filter tabs for interactive project discovery.*

- **CHORE**: bump project version to 3.3
- **FEAT**: implement scroll progress indicator, project category filtering, and enhanced component resource management

---

## [3.0] - 2026-05-12

### Physics Playground, Splash Screen & Martian Red Theme

*Introduced 2D interactive Physics Playground (Matter.js), startup splash screen, PWA support, and Martian Red dark theme.*

- **FEAT**: added show/hide flag for the entries
- **REFACTOR**: date stamp updated
- **FEAT**: how to added
- **CHORE**: stable version
- **FEAT**: added theme color to project icons
- **REFACTOR**: updated projectj modal
- **REFACTOR**: Updated headings and buttons in homepage sections
- **FEAT**: adjested the hero top padding mobile landscape mode
- **CHORE**: adjested font size for mobile device
- **REFACTOR**: version update
- **FIX**: Fixed z axis of resume button (DetailedAbout), back buton(Resume)
- **CHORE**: minor fixes
- **REFACTOR**: Version update - splash screen sound
- **FEAT**: added splash screen sound
- **REFACTOR**: version update PWA
- **FIX**: fixed PWA for fullscreen IOS/android
- **REFACTOR**: adjusted header for mobile view
- **REFACTOR**: updated version
- **REFACTOR**: updated versions
- **FEAT**: added version
- **FEAT**: Adjust header top padding
- **FEAT**: Updated the paddings to cover the notificatio areas in mobile devices
- **DOC**: removed unnecessary comments
- **CHORE**: optimized the responsiveness for splash screen
- **REFACTOR**: updated floating animation
- **REFACTOR**: updated text styling
- **REFACTOR**: updated header
- **REFACTOR**: updated animation in. header and hero
- **REFACTOR**: updated the startup animation timings
- **FIX**: fixed error in splash screen
- **FEAT**: added splash screen on startup
- **REFACTOR**: updated the transation in the splash screen
- **REFACTOR**: updated splash screen
- **REFACTOR**: updated loading screen
- **CHORE**: removed unused imports
- **CHORE**: restored animation
- **FEAT**: updated loading scrren and added effect
- **CHORE**: optimized the site for mobile view
- **FEAT**: added detailed narrative and a quote.
- **FIX**: fixed back button
- **CHORE**: removed link from the profile photo
- **REFACTOR**: updated theme selection option in admin settings
- **REFACTOR**: Update Firestore rules
- **CHORE**: Remove unused imports.
- **CHORE**: enhanced login security
- **FEAT**: added resume page
- **FEAT**: added theme option in Admin
- **FEAT**: added dynamic content and UI configuration in admin settings
- **CHORE**: Remove settings page in Admin
- **DOC**: Commented "Want to know more about me?" link from About component
- **FIX**: fixed some major features
- **FEAT**: Revert "added new favicon"
- **DOC**: Comment out "Want to know more about me?" link in About component.
- **FEAT**: Added Global setting in Admin and Firebase for skills
- **FEAT**: added new favicon
- **DOC**: Comment out social media links and remove unused icon and Recharts imports.
- **REFACTOR**: analytic dashboard and App logo updated
- **REFACTOR**: minor update

---

## [2.0] - 2025-12-25

### Theme Switcher, Admin Panel & Cloudinary Multi-Media

*Built dynamic multi-theme switcher, Firebase Auth admin dashboard, Cloudinary multi-media uploads, and Beyond Work explore sections.*

- **REFACTOR**: updated project fetch api and Admin page
- **CHORE**: removed unused imports and variables
- **CHORE**: minor changes
- **FEAT**: Add a detailed about me page
- **FEAT**: Added detailed about page with dynamic timeline connected with firebase and admin dashboard for the same
- **REFACTOR**: updated contact section
- **FIX**: Enhance login  and error handling
- **FIX**: fixed admin dashboard
- **CHORE**: Optimize component functions remove unused imports and variables.
- **FEAT**: Implement Cloudinary multi-media upload and introduce a new AllProjects page.
- **FIX**: Fixed Admin Login button in Header Aand Footer
- **FEAT**: Added admin settings page and enhance login form validation and error handling.
- **FEAT**: Added analytics dashboard to the admin panel
- **REFACTOR**: Updated Login button in homepage header
- **REFACTOR**: refine login UI with new admin styles.
- **FEAT**: Implement responsiveness in admin dashboard
- **REFACTOR**: Updated Photography page
- **REFACTOR**: updated readme
- **REFACTOR**: Update accent color variables, simplify back button text, and adjust default theme selection.
- **FEAT**: Add StarFieldOverlay, revamp visitor counter display, and refine hero text styling, footer layout, and custom cursor z-index.
- **REFACTOR**: update default theme and accent color variables.
- **FIX**: Enhance visitor counter error handling and initial loading state, and simplify hobby page navigation text
- **STYLE**: Comment out playground button in ThemeSwitcher.
- **FEAT**: mplement admin login, dashboard, and content management, and add new pages for hobbies, AI, IOT, and Raspberry Pi projects.
- **REFACTOR**: update icon source paths in manifest.json
- **FEAT**: add maskable icons and update manifest to reference new image assets.
- **STYLE**: Use CSS variable for hero text gradient color.
- **FEAT**: Update existing application logos and add new variants
- **REFACTOR**: Updated content in Hero section
- **REFACTOR**: Updated content in About section
- **STYLE**: `ThemeSwitcher`'s active theme to the first option.
- **FEAT**: Add `.cache/` to gitignore and refine `node_modules` exclusion.
- **REFACTOR**: update .gitignore to exclude node_modules/ and .cache/ directories.
- **REFACTOR**: updated header
- **STYLE**: built index.html for gh-pages
- **FEAT**: add Google Analytics tracking script to index.html.
- **FEAT**: Update React build artifacts and add Google Analytics tracking to `index.html`.
- **FEAT**: update ThemeSwitcher component and dependencies, triggering build and cache refresh
- **FEAT**: Add initial portfolio components and moon phase utility
- **CHORE**: initiating the portfolio project

---

## [1.0] - 2022-11-08

### Initial Portfolio Launch

*Initial release of React portfolio website featuring hero section, project grid, custom header/footer, and GitHub Pages deployment.*

- **CHORE**: gh pages
- **FEAT**: added header and footer css
- **REFACTOR**: Update App.js
- **CHORE**: Deployed
- **REFACTOR**: updated App.js
- **CHORE**: app deployed
- **FEAT**: Added footer css
- **REFACTOR**: Update in App.js
- **CHORE**: Minor changes
- **FEAT**: added favicon, Header and Footer
- **FEAT**: added how to.txt
- **REFACTOR**: updated build index.html
- **CHORE**: npm install
- **CHORE**: Test
- **CHORE**: Delete node_modules directory
- **FEAT**: git ignore added
- **CHORE**: For Git pages
- **CHORE**: For publishing on github
- **CHORE**: Merge branch 'master' of https://github.com/arpitpardesi/arpitpardesi
- **CHORE**: Create jekyll-gh-pages.yml
- **CHORE**: React app created
- **CHORE**: Initialize project using Create React App

---

