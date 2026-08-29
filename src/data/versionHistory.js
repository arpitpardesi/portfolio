export const versionHistory = [
    {
        version: "4.5.1",
        date: "2026-08-29",
        title: "Dynamic Versioning & SemVer Alignment",
        isLatest: true,
        highlights: "Enhanced version release tracking with dynamic package.json auto-detection, SemVer sorting, and Firestore sync.",
        changes: [
            { type: "feat", description: "Implemented dynamic version auto-detection and SemVer sorting algorithm" },
            { type: "feat", description: "Integrated version release history management into Firebase Admin Dashboard" },
            { type: "chore", description: "Bumped project version to 4.5.1 in package.json" }
        ]
    },
    {
        version: "4.5",
        date: "2026-08-29",
        title: "Version History & System Evolution Release",
        isLatest: false,
        highlights: "Introduced dedicated Version History & Changelog page with filterable categories, search bar, and interactive timeline.",
        changes: [
            { type: "feat", description: "Built interactive Version History page (/changelog) with Framer Motion timeline and category filters" },
            { type: "feat", description: "Added clickable version badge in Footer and Command Palette search integration" },
            { type: "doc", description: "Created CHANGELOG.md adhering to Keep a Changelog standards" }
        ]
    },
    {
        version: "4.4",
        date: "2026-08-29",
        title: "UI Polish & Navigation Refactor",
        isLatest: false,
        highlights: "Refactored button styling with sleek glassmorphism hover interactions, spring motion dynamics, and clean routing handlers.",
        changes: [
            { type: "refactor", description: "Updated UI button styles with improved aesthetics and glassmorphic glow" },
            { type: "refactor", description: "Refined navigation routing logic and layout transition handlers" },
            { type: "chore", description: "Bumped project version to 4.4 in package.json" }
        ]
    },
    {
        version: "4.3.1",
        date: "2026-08-29",
        title: "Audio Policy Patch",
        isLatest: false,
        highlights: "Resolved browser audio autoplay restrictions during the startup splash screen animation.",
        changes: [
            { type: "fix", description: "Added audio exception logic for splash screen sound playback" }
        ]
    },
    {
        version: "4.3",
        date: "2026-08-29",
        title: "Firebase Settings & Analytics Integration",
        isLatest: false,
        highlights: "Introduced real-time Firebase-backed global SettingsContext and live visitor analytics dashboard.",
        changes: [
            { type: "feat", description: "Implemented SettingsContext with real-time Firebase synchronization for global portfolio configuration" },
            { type: "feat", description: "Implemented analytics dashboard for monitoring visitor trends and site content metrics" }
        ]
    },
    {
        version: "4.0",
        date: "2026-08-28",
        title: "Full Blog System Launch",
        isLatest: false,
        highlights: "Integrated full-fledged Blog platform featuring Markdown rendering, Firestore integration, dynamic routing, tag filtering, and admin CRUD support.",
        changes: [
            { type: "feat", description: "Implemented blog system with full CRUD support, navigation integration, and dynamic post routing" },
            { type: "feat", description: "Transitioned blog data source to Firestore with live synchronization" },
            { type: "feat", description: "Added HomeBlog preview section and Command Palette blog post indexing" }
        ]
    },
    {
        version: "3.4",
        date: "2026-08-16",
        title: "Dynamic Accent Color & Command Palette Search",
        isLatest: false,
        highlights: "Enhanced Command Palette with dynamic Firestore search for projects, blogs, and hobbies, plus real-time accent color synchronization.",
        changes: [
            { type: "feat", description: "Enabled dynamic Firestore-backed navigation and theme switching in Command Palette" },
            { type: "feat", description: "Implemented dynamic accent color updates via CustomEvent and MutationObserver" }
        ]
    },
    {
        version: "3.3",
        date: "2026-08-15",
        title: "Scroll Indicator & Category Filtering",
        isLatest: false,
        highlights: "Added interactive scroll progress indicator bar and categorized project filtering tabs.",
        changes: [
            { type: "feat", description: "Implemented scroll progress indicator at the top of the header" },
            { type: "feat", description: "Added project category filtering tabs and resource optimization" }
        ]
    },
    {
        version: "3.0",
        date: "2026-01-28",
        title: "Physics Playground & Martian Theme",
        isLatest: false,
        highlights: "Introduced 2D interactive Physics Playground (Matter.js), rich project modals with Cloudinary media support, and default Martian Red dark theme.",
        changes: [
            { type: "feat", description: "Added interactive Physics Playground page" },
            { type: "feat", description: "Updated project modal with multi-media video/photo carousels" },
            { type: "style", description: "Updated default theme to Martian Red and accent color palette" }
        ]
    },
    {
        version: "2.0",
        date: "2025-12-18",
        title: "Dynamic Theme Switcher & Admin Panel",
        isLatest: false,
        highlights: "Built dynamic multi-theme switcher, Firebase Auth admin dashboard, and Beyond Work explore sections.",
        changes: [
            { type: "feat", description: "Built ThemeSwitcher supporting custom HSL and HEX color themes" },
            { type: "feat", description: "Implemented Firebase Admin authentication and dynamic content management" },
            { type: "feat", description: "Added Beyond Work showcase pages for AI, IoT, Photography, and Raspberry Pi" }
        ]
    },
    {
        version: "1.0",
        date: "2022-10-26",
        title: "Initial Portfolio Release",
        isLatest: false,
        highlights: "Initial release of React portfolio site hosted on GitHub Pages.",
        changes: [
            { type: "feat", description: "Initialized React SPA structure, hero section, project grid, and GitHub Pages deployment" }
        ]
    }
];
