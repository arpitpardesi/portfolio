const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function compareSemVer(v1, v2) {
    const p1 = String(v1 || '0').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
    const p2 = String(v2 || '0').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
    const len = Math.max(p1.length, p2.length);
    for (let i = 0; i < len; i++) {
        const num1 = p1[i] || 0;
        const num2 = p2[i] || 0;
        if (num1 > num2) return -1;
        if (num1 < num2) return 1;
    }
    return 0;
}

function parseCommitType(msg) {
    const lower = msg.toLowerCase();
    if (lower.startsWith('feat') || lower.includes('implement') || lower.includes('add') || lower.includes('enable')) return 'feat';
    if (lower.startsWith('refactor') || lower.includes('refine') || lower.includes('update') || lower.includes('adjust')) return 'refactor';
    if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('resolve') || lower.includes('error')) return 'fix';
    if (lower.startsWith('style') || lower.includes('css') || lower.includes('theme') || lower.includes('ui')) return 'style';
    if (lower.startsWith('docs') || lower.includes('readme') || lower.includes('comment')) return 'doc';
    return 'chore';
}

function cleanCommitMessage(msg) {
    return msg
        .replace(/^(feat|fix|refactor|style|chore|docs|doc|build|ci|test)(\([^)]+\))?:\s*/i, '')
        .trim();
}

function detectVersionBump(message) {
    const verMatch = message.match(/(?:bump|version|release|v)\s*(?:to\s*)?v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
    if (verMatch) {
        return verMatch[1];
    }
    return null;
}

function getVersionMetadata(ver) {
    switch (ver) {
        case '4.5.4':
            return {
                title: "Header Navigation & Version History UI Revamp",
                highlights: "Optimized Version History page UI with floating levitation cards, simple connector lines, and mobile menu integration."
            };
        case '4.5.3':
            return {
                title: "Git Commit Automation & Dynamic Version Sync",
                highlights: "Automated git log version extraction and linked prestart/prebuild triggers for seamless release tracking."
            };
        case '4.5.2':
            return {
                title: "Firestore Security Rules & Description Normalization",
                highlights: "Configured public read permissions for versionHistory in firestore.rules and built multi-line description parsers."
            };
        case '4.5.1':
            return {
                title: "Dynamic Versioning & SemVer Alignment",
                highlights: "Implemented semantic version sorting (compareSemVer) and added Version History management to Firebase Admin Dashboard."
            };
        case '4.5':
            return {
                title: "Version History & System Evolution Page",
                highlights: "Built the interactive Version History page (/changelog) with Framer Motion timeline, category pills, and Command Palette integration."
            };
        case '4.4':
            return {
                title: "UI Polish & Navigation Refactor",
                highlights: "Updated button styles with glassmorphic hover effects, glowing accent borders, and streamlined routing navigation logic."
            };
        case '4.3.1':
            return {
                title: "Splash Screen Audio Exception Patch",
                highlights: "Added audio exception handlers for startup splash screen sound playback to comply with browser autoplay policies."
            };
        case '4.3':
            return {
                title: "Firebase SettingsContext & Analytics Dashboard",
                highlights: "Integrated real-time Firebase-backed global SettingsContext and live visitor analytics dashboard for site metric monitoring."
            };
        case '4.0':
            return {
                title: "Full Blog System Launch",
                highlights: "Launched full-featured Blog module supporting Markdown rendering, dynamic route slugging, tag filtering, and Firestore integration."
            };
        case '3.4':
            return {
                title: "Dynamic Accent Color Sync & Command Palette Search",
                highlights: "Added dynamic accent color sync via CustomEvent and MutationObserver alongside Firestore-backed Command Palette search."
            };
        case '3.3':
            return {
                title: "Scroll Indicator & Category Filter Tabs",
                highlights: "Added header scroll progress indicator bar and category filter tabs for interactive project discovery."
            };
        case '3.0':
            return {
                title: "Physics Playground, Splash Screen & Martian Red Theme",
                highlights: "Introduced 2D interactive Physics Playground (Matter.js), startup splash screen, PWA support, and Martian Red dark theme."
            };
        case '2.0':
            return {
                title: "Theme Switcher, Admin Panel & Cloudinary Multi-Media",
                highlights: "Built dynamic multi-theme switcher, Firebase Auth admin dashboard, Cloudinary multi-media uploads, and Beyond Work explore sections."
            };
        case '1.0':
            return {
                title: "Initial Portfolio Launch",
                highlights: "Initial release of React portfolio website featuring hero section, project grid, custom header/footer, and GitHub Pages deployment."
            };
        default:
            return {
                title: `Version ${ver} Update`,
                highlights: `Production updates, UI refinements, and feature enhancements in Version ${ver}.`
            };
    }
}

function generateCompleteVersionHistory() {
    try {
        const rootDir = path.resolve(__dirname, '..');
        const pkgPath = path.join(rootDir, 'package.json');
        const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const currentVersion = String(pkgData.version || '4.5.3');

        // Fetch complete git log from day one in CHRONOLOGICAL order (oldest to newest)
        const gitOutput = execSync('git log --reverse --format="%h|%ad|%s" --date=short', { cwd: rootDir, encoding: 'utf8' });
        const lines = gitOutput.split('\n').filter(l => l.trim() !== '');

        const versionBuckets = new Map();
        let currentActiveVersion = '1.0';

        // Helper to ensure a version bucket exists
        const ensureBucket = (ver, date) => {
            if (!versionBuckets.has(ver)) {
                const meta = getVersionMetadata(ver);
                versionBuckets.set(ver, {
                    version: ver,
                    date: date,
                    title: meta.title,
                    highlights: meta.highlights,
                    changes: []
                });
            }
        };

        for (const line of lines) {
            const parts = line.split('|');
            if (parts.length < 3) continue;

            const [hash, date, message] = [parts[0], parts[1], parts.slice(2).join('|')];

            // Check if this commit bumps version
            const detectedVer = detectVersionBump(message);
            if (detectedVer) {
                currentActiveVersion = detectedVer;
            } else if (date.startsWith('2022')) {
                currentActiveVersion = '1.0';
            } else if (date.startsWith('2025')) {
                currentActiveVersion = '2.0';
            } else if (date >= '2026-01-01' && date <= '2026-05-31' && compareSemVer(currentActiveVersion, '3.0') > 0) {
                currentActiveVersion = '3.0';
            }

            ensureBucket(currentActiveVersion, date);

            const bucket = versionBuckets.get(currentActiveVersion);
            bucket.date = date; // update to latest date in bucket
            const type = parseCommitType(message);
            const description = cleanCommitMessage(message);

            if (description.length > 0 && !bucket.changes.some(c => c.description.toLowerCase() === description.toLowerCase())) {
                bucket.changes.push({
                    type,
                    description,
                    hash
                });
            }
        }

        // Ensure current package.json version bucket exists
        ensureBucket(currentVersion, new Date().toISOString().split('T')[0]);

        let sortedVersions = Array.from(versionBuckets.values());

        // Sort descending using strict SemVer
        sortedVersions.sort((a, b) => compareSemVer(a.version, b.version));

        // Mark latest release
        if (sortedVersions.length > 0) {
            sortedVersions = sortedVersions.map((v, idx) => ({
                ...v,
                isLatest: idx === 0
            }));
        }

        // Write JavaScript data file
        const jsContent = `// Auto-generated from Day One Git Log history by scripts/generate-version-history.js
export const versionHistory = ${JSON.stringify(sortedVersions, null, 4)};
`;

        const jsOutputPath = path.join(rootDir, 'src', 'data', 'versionHistory.js');
        fs.writeFileSync(jsOutputPath, jsContent, 'utf8');
        console.log(`[VersionGen] Successfully generated ${sortedVersions.length} historical release entries into ${jsOutputPath}`);

        // Write CHANGELOG.md
        let mdContent = `# Changelog\n\nAll notable changes to this project from Day One are documented in this file.\n\n---\n\n`;
        for (const v of sortedVersions) {
            mdContent += `## [${v.version}] - ${v.date}\n\n`;
            if (v.title) {
                mdContent += `### ${v.title}\n\n`;
            }
            if (v.highlights) {
                mdContent += `*${v.highlights}*\n\n`;
            }
            if (v.changes && v.changes.length > 0) {
                for (const c of v.changes) {
                    mdContent += `- **${c.type.toUpperCase()}**: ${c.description}\n`;
                }
            }
            mdContent += `\n---\n\n`;
        }

        const mdOutputPath = path.join(rootDir, 'CHANGELOG.md');
        fs.writeFileSync(mdOutputPath, mdContent, 'utf8');
        console.log(`[VersionGen] Successfully updated ${mdOutputPath}`);

    } catch (error) {
        console.error("[VersionGen] Error generating version history:", error.message);
    }
}

generateCompleteVersionHistory();
