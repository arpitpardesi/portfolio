import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { FaSave, FaCog, FaGlobe, FaLink, FaServer, FaHome, FaPalette, FaPlus, FaTrash, FaTachometerAlt, FaMemory, FaMicrochip, FaSync, FaCheckCircle, FaNetworkWired, FaHdd, FaWifi, FaExchangeAlt, FaFileCode, FaLayerGroup, FaClock, FaDatabase, FaFolder, FaBookOpen, FaCamera, FaMousePointer, FaSlidersH } from 'react-icons/fa';
import { themes } from '../ThemeSwitcher';
import packageJson from '../../../package.json';
import './Admin.css';

const SettingsManager = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('content');

    // Custom Theme State
    const [showAddTheme, setShowAddTheme] = useState(false);
    const [newTheme, setNewTheme] = useState({ name: '', color: '#6366f1' });

    // Performance Sub-Tab state
    const [perfSubTab, setPerfSubTab] = useState('overview'); // 'overview', 'network', 'internal', 'database'
    const sessionStartTime = React.useRef(Date.now());

    // Extended Performance & Network / Site Internal State (100% Real Site Metrics)
    const [perfStats, setPerfStats] = useState({
        // Health & Overview
        loadTime: 'Calculating...',
        domInteractive: 'Calculating...',
        domContentLoaded: 'Calculating...',
        memoryUsedMB: null,
        memoryLimitMB: null,
        memoryPercent: null,
        cores: navigator.hardwareConcurrency || 'N/A',
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A',
        storageUsedMB: 'Estimating...',

        // Network Specific
        connectionType: navigator.connection?.effectiveType?.toUpperCase() || (navigator.onLine ? '4G / BROADBAND' : 'OFFLINE'),
        downlink: navigator.connection?.downlink ? `${navigator.connection.downlink} Mbps` : 'High Speed',
        rtt: navigator.connection?.rtt ? `${navigator.connection.rtt} ms` : 'N/A',
        saveData: navigator.connection?.saveData ? 'Enabled' : 'Disabled',
        isOnline: navigator.onLine,
        dnsTime: '0 ms',
        tcpTime: '0 ms',
        sslTime: '0 ms',
        ttfb: 'N/A',
        downloadTime: 'N/A',
        totalTransferSizeKB: 0,
        resourcesCount: { js: 0, css: 0, img: 0, font: 0, fetch: 0, total: 0 },
        resourcesSizeKB: { js: 0, css: 0, img: 0, font: 0, other: 0 },

        // Site Internal Specific
        domNodeCount: 0,
        maxDomDepth: 0,
        imageElementsCount: 0,
        linkElementsCount: 0,
        interactiveElementsCount: 0,
        stylesheetsCount: 0,
        localStorageSizeKB: '0 KB',
        localStorageKeysCount: 0,
        localStorageKeysList: [],
        sessionStorageKeysCount: 0,
        dbLatency: 'Testing...',
        dbStatus: 'checking',
        screenResolution: `${window.innerWidth} x ${window.innerHeight} (${window.devicePixelRatio}x)`,
        sessionUptime: '0s',
        activeRoute: window.location.hash || window.location.pathname || '/',

        // Firestore Database Live Counts
        dbCollectionCounts: {
            projects: 0,
            blogs: 0,
            hobbies: 0,
            photography: 0,
            iot: 0,
            ai: 0,
            rpi: 0,
            versionHistory: 0,
            visitor_logs: 0
        },
        dbTotalItemsCount: 0
    });

    const measurePerformance = async () => {
        // App Session Uptime
        const uptimeSeconds = Math.floor((Date.now() - sessionStartTime.current) / 1000);
        const uptimeStr = uptimeSeconds >= 60
            ? `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`
            : `${uptimeSeconds}s`;

        // Real Site DOM Metrics
        const allNodes = document.getElementsByTagName('*');
        const domNodeCount = allNodes.length;
        const imageElementsCount = document.querySelectorAll('img').length;
        const linkElementsCount = document.querySelectorAll('a').length;
        const interactiveElementsCount = document.querySelectorAll('button, input, select, textarea').length;
        const stylesheetsCount = document.styleSheets ? document.styleSheets.length : 0;

        let maxDepth = 0;
        const findDepth = (node, currentDepth) => {
            if (currentDepth > maxDepth) maxDepth = currentDepth;
            for (let child of node.children) {
                findDepth(child, currentDepth + 1);
            }
        };
        if (document.body) {
            findDepth(document.body, 1);
        }

        // Real LocalStorage & Key List Audit
        let lsBytes = 0;
        const lsKeys = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const val = localStorage.getItem(key) || '';
                    lsBytes += key.length + val.length;
                    lsKeys.push({ key, sizeBytes: key.length + val.length });
                }
            }
        } catch (e) { }
        const localStorageSizeKB = (lsBytes / 1024).toFixed(2);

        // Real Navigation & Network Timings
        let dnsTime = '0 ms', tcpTime = '0 ms', sslTime = '0 ms', ttfb = 'N/A', downloadTime = 'N/A';
        let loadTime = 'N/A', domInteractive = 'N/A', domContentLoaded = 'N/A';

        if (window.performance) {
            const navEntries = performance.getEntriesByType('navigation');
            if (navEntries.length > 0) {
                const nav = navEntries[0];
                const load = Math.round(nav.loadEventEnd - nav.startTime);
                const domInt = Math.round(nav.domInteractive - nav.startTime);
                const domCL = Math.round(nav.domContentLoadedEventEnd - nav.startTime);

                loadTime = load > 0 ? `${load} ms` : 'Fast (<100 ms)';
                domInteractive = domInt > 0 ? `${domInt} ms` : 'Instant';
                domContentLoaded = domCL > 0 ? `${domCL} ms` : 'Instant';

                dnsTime = nav.domainLookupEnd > 0 ? `${Math.round(nav.domainLookupEnd - nav.domainLookupStart)} ms` : '0 ms (Cached)';
                tcpTime = nav.connectEnd > 0 ? `${Math.round(nav.connectEnd - nav.connectStart)} ms` : '0 ms (Reused)';
                sslTime = nav.secureConnectionStart > 0 ? `${Math.round(nav.connectEnd - nav.secureConnectionStart)} ms` : '0 ms / N/A';
                ttfb = nav.responseStart > 0 ? `${Math.round(nav.responseStart - nav.requestStart)} ms` : 'N/A';
                downloadTime = nav.responseEnd > 0 ? `${Math.round(nav.responseEnd - nav.responseStart)} ms` : 'N/A';
            }

            // Real Resource Timing Breakdown
            const resources = performance.getEntriesByType('resource');
            let totalTransfer = 0;
            const counts = { js: 0, css: 0, img: 0, font: 0, fetch: 0, total: resources.length };
            const sizes = { js: 0, css: 0, img: 0, font: 0, other: 0 };

            resources.forEach(res => {
                const transfer = res.transferSize || res.encodedBodySize || 0;
                totalTransfer += transfer;
                const name = res.name.toLowerCase();
                const initiator = res.initiatorType;

                if (initiator === 'script' || name.endsWith('.js')) {
                    counts.js++;
                    sizes.js += transfer;
                } else if (initiator === 'css' || name.endsWith('.css')) {
                    counts.css++;
                    sizes.css += transfer;
                } else if (initiator === 'img' || name.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
                    counts.img++;
                    sizes.img += transfer;
                } else if (initiator === 'css' && name.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
                    counts.font++;
                    sizes.font += transfer;
                } else if (initiator === 'xmlhttprequest' || initiator === 'fetch') {
                    counts.fetch++;
                    sizes.other += transfer;
                } else {
                    sizes.other += transfer;
                }
            });

            // Memory stats if supported
            let memoryUsedMB = null, memoryLimitMB = null, memoryPercent = null;
            if (performance.memory) {
                memoryUsedMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
                memoryLimitMB = (performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(1);
                memoryPercent = Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
            }

            setPerfStats(prev => ({
                ...prev,
                loadTime,
                domInteractive,
                domContentLoaded,
                dnsTime,
                tcpTime,
                sslTime,
                ttfb,
                downloadTime,
                memoryUsedMB,
                memoryLimitMB,
                memoryPercent,
                totalTransferSizeKB: (totalTransfer / 1024).toFixed(1),
                resourcesCount: counts,
                resourcesSizeKB: {
                    js: (sizes.js / 1024).toFixed(1),
                    css: (sizes.css / 1024).toFixed(1),
                    img: (sizes.img / 1024).toFixed(1),
                    font: (sizes.font / 1024).toFixed(1),
                    other: (sizes.other / 1024).toFixed(1)
                },
                domNodeCount,
                maxDomDepth: maxDepth,
                imageElementsCount,
                linkElementsCount,
                interactiveElementsCount,
                stylesheetsCount,
                localStorageSizeKB: `${localStorageSizeKB} KB`,
                localStorageKeysCount: localStorage.length,
                localStorageKeysList: lsKeys,
                sessionStorageKeysCount: sessionStorage.length,
                sessionUptime: uptimeStr,
                screenResolution: `${window.innerWidth} x ${window.innerHeight} (${window.devicePixelRatio}x)`,
                activeRoute: window.location.hash || window.location.pathname || '/'
            }));
        }

        // Real Storage estimate
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
                const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
                setPerfStats(prev => ({
                    ...prev,
                    storageUsedMB: `${usedMB} MB / ${quotaMB} MB`
                }));
            } catch (e) {
                console.error(e);
            }
        }

        // Real Firestore DB Ping Latency & Collection Counts
        const start = performance.now();
        try {
            const docRef = doc(db, 'settings', 'global');
            await getDoc(docRef);
            const latency = Math.round(performance.now() - start);

            // Query live collection sizes
            const colNames = ['projects', 'blogs', 'hobbies', 'photography', 'iot', 'ai', 'rpi', 'versionHistory', 'visitor_logs'];
            const dbCounts = {};
            let totalColItems = 0;

            for (const col of colNames) {
                try {
                    const snap = await getDocs(collection(db, col));
                    dbCounts[col] = snap.size;
                    if (col !== 'visitor_logs') totalColItems += snap.size;
                } catch {
                    dbCounts[col] = 0;
                }
            }

            setPerfStats(prev => ({
                ...prev,
                dbLatency: `${latency} ms`,
                dbStatus: latency < 300 ? 'Optimal' : 'Slow',
                dbCollectionCounts: dbCounts,
                dbTotalItemsCount: totalColItems
            }));
        } catch (e) {
            setPerfStats(prev => ({
                ...prev,
                dbLatency: 'Error',
                dbStatus: 'Degraded'
            }));
        }
    };

    useEffect(() => {
        if (activeTab === 'system') {
            measurePerformance();
        }
    }, [activeTab]);

    // Helper to convert hex to rgb string "r, g, b"
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '255, 255, 255';
    };

    // Helper to apply theme instantly for preview
    const applyTheme = (theme) => {
        document.documentElement.style.setProperty('--accent-color', theme.color);
        document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
        document.documentElement.style.setProperty('--accent-glow', theme.glow);
    };

    const handleAddTheme = () => {
        if (!newTheme.name || !newTheme.color) {
            setMessage({ text: 'Please provide both name and color.', type: 'error' });
            return;
        }

        const rgb = hexToRgb(newTheme.color);
        const themeObj = {
            name: newTheme.name,
            color: newTheme.color,
            rgb: rgb,
            glow: `rgba(${rgb}, 0.5)`,
            background: newTheme.color
        };

        setSettings(prev => ({
            ...prev,
            customThemes: [...(prev.customThemes || []), themeObj],
            // Optionally select it immediately
            defaultTheme: themeObj.name,
            accentColor: themeObj.color
        }));

        setNewTheme({ name: '', color: '#6366f1' });
        setShowAddTheme(false);
        setMessage({ text: 'Custom theme added!', type: 'success' });

        // Auto-clear message
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleDeleteTheme = (themeName, e) => {
        e.stopPropagation(); // Prevent selecting the theme while deleting
        setSettings(prev => ({
            ...prev,
            customThemes: (prev.customThemes || []).filter(t => t.name !== themeName),
            // Reset to default if deleted theme was selected
            defaultTheme: prev.defaultTheme === themeName ? 'Martian Red' : prev.defaultTheme
        }));
    };

    // Default settings state
    const [settings, setSettings] = useState({
        // General
        siteTitle: 'Arpit Pardesi | Portfolio',
        logoText: 'ARPIT',
        contactEmail: 'arpit.pardesi6@gmail.com',
        footerText: '© 2026 Arpit Pardesi. All rights reserved.',

        // Social / Links
        resumeUrl: '',
        githubUrl: 'https://github.com/arpitpardesi',
        linkedinUrl: 'https://www.linkedin.com/in/arpitpardesi/',
        twitterUrl: 'https://x.com/arpit_pardesi',
        instagramUrl: 'https://www.instagram.com/arpitpardesi',

        // System / Features
        maintenanceMode: false,
        enableVisitorTracking: true,
        enableAnimations: true,
        enablePlayground: true,
        enableMoon: true,
        enableThemeSwitcher: true,
        enableCustomCursor: true,
        enableBackground: true,
        enableCommandPalette: true,
        enableScrollProgress: true,
        debugMode: false,

        // Hero Defaults
        heroName: 'Arpit Pardesi.',
        heroIntro: 'Hi, my name is',
        heroSubtitle: 'I turn curiosity into creation.',
        heroDescription: 'I weave together data, design, and code to build experiences that feel intuitive and alive. As a Software Developer, I explore the space where logic meets imagination — architecting solutions, solving puzzles, and shaping ideas into something you can see, feel, and use.',
        heroCtaText: 'Check out my work',
        heroCtaLink: '#projects',

        // About Defaults
        aboutTitle: 'About Me',
        aboutText1: 'Hello! I’m Arpit — a builder at heart, a learner by nature, and a firm believer that technology is just another form of storytelling.',
        aboutText2: 'My journey began with small sparks of curiosity: Why does this work? What happens if I change that? Can I build something new? Those questions carried me into the world of software, where creativity and precision dance together.',
        aboutText3: 'Today, I craft data-driven solutions, develop applications, and design meaningful digital experiences. I love blending structure with art — from orchestrating raw ideas and data into solutions to writing code that feels elegant and alive.',
        aboutText4: 'When I’m not engineering solutions, you’ll find me experimenting: building IoT gadgets, teaching machines to see and talk, or creating playful interfaces powered by AI.',
        aboutFooter: 'Every project is a chance to explore, to improve, to understand a little more.',
        profileImage: 'https://github.com/arpitpardesi.png',

        // Contact Defaults
        contactSubtitle: "What's Next?",
        contactTitle: 'Get In Touch',
        contactText: "I'm currently looking for new opportunities, and my inbox is always open. Whether you have a question, a project idea, or just want to say hi, I'll try my best to get back to you!",
        contactCta: 'Say Hello',

        // Theme defaults
        defaultTheme: 'Martian Red',
        accentColor: '#ef4444'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'settings', 'global');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSettings(prev => ({ ...prev, ...docSnap.data() }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({ text: 'Failed to load settings.', type: 'error' });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const docRef = doc(db, 'settings', 'global');
            await setDoc(docRef, {
                ...settings,
                updatedAt: serverTimestamp()
            }, { merge: true });

            setMessage({ text: 'Settings saved successfully!', type: 'success' });

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ text: 'Failed to save settings. Please try again.', type: 'error' });
        }
        setSaving(false);
    };

    if (loading) {
        return <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>Loading Settings...</div>;
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h2 className="settings-title">
                    <FaCog style={{ marginRight: '0.75rem', color: 'var(--accent-color)' }} />
                    Global Settings
                </h2>
                <p className="settings-subtitle">Manage global configuration for your portfolio application.</p>
            </div>

            {/* Tabs Navigation */}
            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('content')}
                >
                    <FaHome className="settings-tab-icon" /> Page Content
                </button>
                <button
                    className={`settings-tab ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveTab('social')}
                >
                    <FaLink className="settings-tab-icon" /> Social Media
                </button>
                <button
                    className={`settings-tab ${activeTab === 'theme' ? 'active' : ''}`}
                    onClick={() => setActiveTab('theme')}
                >
                    <FaPalette className="settings-tab-icon" /> Theme & Background
                </button>
                <button
                    className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    <FaServer className="settings-tab-icon" /> System Config
                </button>
            </div>

            {message.text && (
                <div className={`save-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="settings-sections">

                    {/* Page Content Tab */}
                    <div className={`settings-section ${activeTab === 'content' ? '' : 'hidden'}`}>
                        <div className="settings-section-header">
                            <div className="settings-section-icon"><FaGlobe /></div>
                            <h3 className="settings-section-title">Page Content</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Customize the text and content across your portfolio's main sections.
                        </p>

                        {/* Header Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Header</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="settings-label">Site Title (Browser Tab)</label>
                                    <input
                                        type="text"
                                        name="siteTitle"
                                        value={settings.siteTitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Logo Text</label>
                                    <input
                                        type="text"
                                        name="logoText"
                                        value={settings.logoText}
                                        onChange={handleChange}
                                        className="settings-input"
                                        placeholder="ARPIT"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hero Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Hero Section</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="settings-label">Intro Text</label>
                                    <input
                                        type="text"
                                        name="heroIntro"
                                        value={settings.heroIntro}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Name</label>
                                    <input
                                        type="text"
                                        name="heroName"
                                        value={settings.heroName}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Subtitle</label>
                                    <input
                                        type="text"
                                        name="heroSubtitle"
                                        value={settings.heroSubtitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Description</label>
                                    <textarea
                                        name="heroDescription"
                                        value={settings.heroDescription}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">CTA Text</label>
                                    <input
                                        type="text"
                                        name="heroCtaText"
                                        value={settings.heroCtaText}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">CTA Link</label>
                                    <input
                                        type="text"
                                        name="heroCtaLink"
                                        value={settings.heroCtaLink}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* About Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>About Section</h4>
                            <div className="settings-fields">
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Section Title</label>
                                    <input
                                        type="text"
                                        name="aboutTitle"
                                        value={settings.aboutTitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio Paragraph 1</label>
                                    <textarea
                                        name="aboutText1"
                                        value={settings.aboutText1}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio Paragraph 2</label>
                                    <textarea
                                        name="aboutText2"
                                        value={settings.aboutText2}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio Paragraph 3</label>
                                    <textarea
                                        name="aboutText3"
                                        value={settings.aboutText3}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio Paragraph 4</label>
                                    <textarea
                                        name="aboutText4"
                                        value={settings.aboutText4}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Closing Line</label>
                                    <input
                                        type="text"
                                        name="aboutFooter"
                                        value={settings.aboutFooter}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Profile Image URL</label>
                                    <input
                                        type="url"
                                        name="profileImage"
                                        value={settings.profileImage}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Contact Section</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="settings-label">Subtitle (Small)</label>
                                    <input
                                        type="text"
                                        name="contactSubtitle"
                                        value={settings.contactSubtitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Main Title</label>
                                    <input
                                        type="text"
                                        name="contactTitle"
                                        value={settings.contactTitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Description Text</label>
                                    <textarea
                                        name="contactText"
                                        value={settings.contactText}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">CTA Button Text</label>
                                    <input
                                        type="text"
                                        name="contactCta"
                                        value={settings.contactCta}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Contact Email</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={settings.contactEmail}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Subsection */}
                        <div>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Footer</h4>
                            <div className="settings-fields">
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Footer Copyright Text</label>
                                    <input
                                        type="text"
                                        name="footerText"
                                        value={settings.footerText}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social & Links */}
                    <div className={`settings-section ${activeTab === 'social' ? '' : 'hidden'}`}>
                        <div className="settings-section-header">
                            <div className="settings-section-icon"><FaLink /></div>
                            <h3 className="settings-section-title">Social Media & Links</h3>
                        </div>
                        <div className="settings-fields">
                            <div className="settings-field">
                                <label className="settings-label">Resume / CV URL</label>
                                <input
                                    type="url"
                                    name="resumeUrl"
                                    value={settings.resumeUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="settings-field">
                                <label className="settings-label">GitHub URL</label>
                                <input
                                    type="url"
                                    name="githubUrl"
                                    value={settings.githubUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <div className="settings-field">
                                <label className="settings-label">LinkedIn URL</label>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    value={settings.linkedinUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div className="settings-field">
                                <label className="settings-label">Twitter / X URL</label>
                                <input
                                    type="url"
                                    name="twitterUrl"
                                    value={settings.twitterUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                            <div className="settings-field">
                                <label className="settings-label">Instagram URL</label>
                                <input
                                    type="url"
                                    name="instagramUrl"
                                    value={settings.instagramUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Theme & Background Tab */}
                    <div className={`settings-section ${activeTab === 'theme' ? '' : 'hidden'}`}>
                        <div className="settings-section-header">
                            <div className="settings-section-icon"><FaPalette /></div>
                            <h3 className="settings-section-title">Theme & Background</h3>
                        </div>

                        {/* Appearance Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Appearance</h4>
                            <div className="settings-fields">
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Global Theme Preset</label>
                                    <div className="theme-grid">
                                        {/* Preset Themes */}
                                        {themes.map(theme => (
                                            <div
                                                key={theme.name}
                                                className={`theme-card ${settings.defaultTheme === theme.name ? 'active' : ''}`}
                                                onClick={() => {
                                                    applyTheme(theme);
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        defaultTheme: theme.name,
                                                        accentColor: theme.color
                                                    }));
                                                }}
                                            >
                                                <div
                                                    className="theme-preview"
                                                    style={{ background: theme.background }}
                                                />
                                                <span className="theme-name">{theme.name}</span>
                                                {settings.defaultTheme === theme.name && (
                                                    <div className="theme-check">✓</div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Custom Themes */}
                                        {(settings.customThemes || []).map(theme => (
                                            <div
                                                key={theme.name}
                                                className={`theme-card ${settings.defaultTheme === theme.name ? 'active' : ''}`}
                                                onClick={() => {
                                                    applyTheme(theme);
                                                    setSettings(prev => ({
                                                        ...prev,
                                                        defaultTheme: theme.name,
                                                        accentColor: theme.color
                                                    }));
                                                }}
                                            >
                                                <div
                                                    className="theme-preview"
                                                    style={{ background: theme.background }}
                                                />
                                                <span className="theme-name">{theme.name}</span>
                                                {settings.defaultTheme === theme.name && (
                                                    <div className="theme-check">✓</div>
                                                )}
                                                <button
                                                    className="delete-theme-btn"
                                                    onClick={(e) => handleDeleteTheme(theme.name, e)}
                                                    title="Delete Theme"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add New Theme Card */}
                                        <div
                                            className="theme-card add-theme-card"
                                            onClick={() => setShowAddTheme(true)}
                                            style={{ borderStyle: 'dashed', justifyContent: 'center' }}
                                        >
                                            <div className="theme-preview" style={{ background: 'transparent', border: '2px dashed var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FaPlus style={{ color: 'var(--text-secondary)' }} />
                                            </div>
                                            <span className="theme-name" style={{ color: 'var(--text-secondary)' }}>Add New</span>
                                        </div>
                                    </div>

                                    {/* Add Theme Modal/Form */}
                                    {showAddTheme && (
                                        <div className="add-theme-modal">
                                            <div className="add-theme-content">
                                                <h4>Add Custom Theme</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Theme Name (e.g. Neon Lime)"
                                                    value={newTheme.name}
                                                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                                                    className="settings-input"
                                                    maxLength={15}
                                                />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                                    <input
                                                        type="color"
                                                        value={newTheme.color}
                                                        onChange={(e) => setNewTheme({ ...newTheme, color: e.target.value })}
                                                        className="color-input"
                                                    />
                                                    <span>Pick Color</span>
                                                </div>
                                                <div className="modal-actions">
                                                    <button onClick={() => setShowAddTheme(false)} className="btn btn-secondary">Cancel</button>
                                                    <button onClick={handleAddTheme} className="btn btn-primary">Add Theme</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Show Moon Icon</span>
                                        <input
                                            type="checkbox"
                                            name="enableMoon"
                                            checked={settings.enableMoon}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Show Theme Switcher</span>
                                        <input
                                            type="checkbox"
                                            name="enableThemeSwitcher"
                                            checked={settings.enableThemeSwitcher}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Show Playground</span>
                                        <input
                                            type="checkbox"
                                            name="enablePlayground"
                                            checked={settings.enablePlayground}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Visuals & Effects Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Visuals & Effects</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable Detailed Background</span>
                                        <input
                                            type="checkbox"
                                            name="enableBackground"
                                            checked={settings.enableBackground}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                    <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Disabling this removes the particle background to save resources.
                                    </small>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable UI Animations</span>
                                        <input
                                            type="checkbox"
                                            name="enableAnimations"
                                            checked={settings.enableAnimations}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                    <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Smooth transitions and motion effects. Disable for better performance on low-end devices.
                                    </small>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable Custom Cursor</span>
                                        <input
                                            type="checkbox"
                                            name="enableCustomCursor"
                                            checked={settings.enableCustomCursor}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable Command Palette (Cmd + K)</span>
                                        <input
                                            type="checkbox"
                                            name="enableCommandPalette"
                                            checked={settings.enableCommandPalette !== false}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Show Scroll Progress Bar</span>
                                        <input
                                            type="checkbox"
                                            name="enableScrollProgress"
                                            checked={settings.enableScrollProgress !== false}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Configuration */}
                    <div className={`settings-section ${activeTab === 'system' ? '' : 'hidden'}`}>
                        <div className="settings-section-header">
                            <div className="settings-section-icon"><FaServer /></div>
                            <h3 className="settings-section-title">System Configuration</h3>
                        </div>

                        {/* System & Admin Subsection */}
                        <div>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>System & Admin</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Maintenance Mode</span>
                                        <input
                                            type="checkbox"
                                            name="maintenanceMode"
                                            checked={settings.maintenanceMode}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                    <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        If enabled, non-admin users will see a maintenance page.
                                    </small>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable Visitor Tracking</span>
                                        <input
                                            type="checkbox"
                                            name="enableVisitorTracking"
                                            checked={settings.enableVisitorTracking}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Debug Mode</span>
                                        <input
                                            type="checkbox"
                                            name="debugMode"
                                            checked={settings.debugMode}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                            </div>
                                       {/* System Performance & Analytics Subsection (100% Real Site Diagnostics) */}
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <h4 style={{ color: 'var(--accent-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: '700' }}>
                                            <FaTachometerAlt /> Real-Time Site & System Diagnostics
                                        </h4>
                                        <span style={{
                                            background: 'rgba(16, 185, 129, 0.15)',
                                            color: '#10b981',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '20px',
                                            padding: '2px 10px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                                            100% Live Site Data
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.85rem' }}>
                                        Live browser metrics, real network payloads, DOM node hierarchy & Firestore collection audits
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={measurePerformance}
                                    className="btn btn-outline"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.95rem', fontSize: '0.82rem', fontWeight: '600' }}
                                >
                                    <FaSync /> Run Diagnostics Audit
                                </button>
                            </div>

                            {/* Diagnostics Sub-Navigation Tabs */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => setPerfSubTab('overview')}
                                    style={{
                                        background: perfSubTab === 'overview' ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.03)',
                                        color: perfSubTab === 'overview' ? '#fff' : 'var(--text-secondary)',
                                        border: '1px solid ' + (perfSubTab === 'overview' ? 'var(--accent-color)' : 'var(--border-color)'),
                                        borderRadius: '8px',
                                        padding: '0.45rem 0.95rem',
                                        fontSize: '0.82rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaTachometerAlt /> Overview & Health
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPerfSubTab('network')}
                                    style={{
                                        background: perfSubTab === 'network' ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.03)',
                                        color: perfSubTab === 'network' ? '#fff' : 'var(--text-secondary)',
                                        border: '1px solid ' + (perfSubTab === 'network' ? 'var(--accent-color)' : 'var(--border-color)'),
                                        borderRadius: '8px',
                                        padding: '0.45rem 0.95rem',
                                        fontSize: '0.82rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaNetworkWired /> Network & Assets
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPerfSubTab('internal')}
                                    style={{
                                        background: perfSubTab === 'internal' ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.03)',
                                        color: perfSubTab === 'internal' ? '#fff' : 'var(--text-secondary)',
                                        border: '1px solid ' + (perfSubTab === 'internal' ? 'var(--accent-color)' : 'var(--border-color)'),
                                        borderRadius: '8px',
                                        padding: '0.45rem 0.95rem',
                                        fontSize: '0.82rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaLayerGroup /> Site Internal & DOM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPerfSubTab('database')}
                                    style={{
                                        background: perfSubTab === 'database' ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.03)',
                                        color: perfSubTab === 'database' ? '#fff' : 'var(--text-secondary)',
                                        border: '1px solid ' + (perfSubTab === 'database' ? 'var(--accent-color)' : 'var(--border-color)'),
                                        borderRadius: '8px',
                                        padding: '0.45rem 0.95rem',
                                        fontSize: '0.82rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaDatabase /> Firestore Collections ({perfStats.dbTotalItemsCount})
                                </button>
                            </div>

                            {/* SUB-TAB 1: Overview & Health */}
                            {perfSubTab === 'overview' && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                        {/* Firestore DB Latency */}
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                <span>Firestore Live Ping</span>
                                                <FaServer style={{ color: perfStats.dbStatus === 'Optimal' ? '#10b981' : '#f59e0b' }} />
                                            </div>
                                            <div style={{ fontSize: '1.7rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbLatency}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: perfStats.dbStatus === 'Optimal' ? '#10b981' : '#f59e0b', marginTop: '0.35rem' }}>
                                                <FaCheckCircle /> Status: {perfStats.dbStatus}
                                            </div>
                                        </div>

                                        {/* JS Heap Memory */}
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                <span>JS Heap Allocation</span>
                                                <FaMemory style={{ color: '#6366f1' }} />
                                            </div>
                                            <div style={{ fontSize: '1.7rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.memoryUsedMB ? `${perfStats.memoryUsedMB} MB` : 'N/A'}
                                            </div>
                                            <div style={{ marginTop: '0.4rem' }}>
                                                {perfStats.memoryLimitMB ? (
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                                            <span>V8 Limit: {perfStats.memoryLimitMB} MB</span>
                                                            <span>{perfStats.memoryPercent}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${Math.min(perfStats.memoryPercent || 0, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '3px' }}></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>V8 Heap Standard Memory</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Page Load Speed */}
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                <span>Initial Page Load</span>
                                                <FaTachometerAlt style={{ color: '#0ea5e9' }} />
                                            </div>
                                            <div style={{ fontSize: '1.7rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.loadTime}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                                                Interactive: {perfStats.domInteractive} | Ready: {perfStats.domContentLoaded}
                                            </div>
                                        </div>

                                        {/* CPU Cores & Hardware */}
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                <span>CPU Cores / Threads</span>
                                                <FaMicrochip style={{ color: '#ec4899' }} />
                                            </div>
                                            <div style={{ fontSize: '1.7rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.cores} Cores
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                                                RAM: {perfStats.deviceMemory} | Net: {perfStats.connectionType} ({perfStats.downlink})
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 2: Network & Resource Transfer */}
                            {perfSubTab === 'network' && (
                                <div>
                                    {/* Network Info Banner */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaWifi style={{ color: '#10b981' }} /> Connection Type
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.connectionType}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: perfStats.isOnline ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>
                                                ● {perfStats.isOnline ? 'Network Online' : 'Offline'}
                                            </div>
                                        </div>

                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaExchangeAlt style={{ color: '#0ea5e9' }} /> Downlink & Latency RTT
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.downlink}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                                Latency RTT: {perfStats.rtt} | DataSaver: {perfStats.saveData}
                                            </div>
                                        </div>

                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaHdd style={{ color: '#8b5cf6' }} /> Total Transfer Payload
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.totalTransferSizeKB} KB
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                                Across {perfStats.resourcesCount.total} total network assets
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed HTTP Navigation Timings */}
                                    <h5 style={{ color: 'var(--accent-color)', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600' }}>HTTP Navigation Phase Timings</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>DNS Lookup</span>
                                            <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{perfStats.dnsTime}</strong>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>TCP Connection</span>
                                            <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{perfStats.tcpTime}</strong>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>SSL / TLS Handshake</span>
                                            <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{perfStats.sslTime}</strong>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>TTFB (Server Resp)</span>
                                            <strong style={{ fontSize: '1.15rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>{perfStats.ttfb}</strong>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Asset Download</span>
                                            <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{perfStats.downloadTime}</strong>
                                        </div>
                                    </div>

                                    {/* Asset Payload Breakdown */}
                                    <h5 style={{ color: 'var(--accent-color)', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600' }}>Asset Type Payload Breakdown</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '600', display: 'block' }}>JavaScript Bundles</span>
                                            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{perfStats.resourcesSizeKB.js} KB</div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{perfStats.resourcesCount.js} script files</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#0ea5e9', fontWeight: '600', display: 'block' }}>CSS Stylesheets</span>
                                            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{perfStats.resourcesSizeKB.css} KB</div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{perfStats.resourcesCount.css} CSS files</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '600', display: 'block' }}>Images & Media</span>
                                            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{perfStats.resourcesSizeKB.img} KB</div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{perfStats.resourcesCount.img} image assets</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: '600', display: 'block' }}>Fonts & Webfonts</span>
                                            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{perfStats.resourcesSizeKB.font} KB</div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{perfStats.resourcesCount.font} font files</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 3: Site Internal & DOM */}
                            {perfSubTab === 'internal' && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem', marginBottom: '1.5rem' }}>
                                        {/* DOM Tree Health */}
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.1rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaFileCode style={{ color: '#6366f1' }} /> DOM Node Hierarchy
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.domNodeCount} Nodes
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                Max Depth: {perfStats.maxDomDepth} levels | {perfStats.stylesheetsCount} CSS files
                                            </div>
                                        </div>

                                        {/* Page Elements Audit */}
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.1rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaMousePointer style={{ color: '#ec4899' }} /> Interactive Elements
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.interactiveElementsCount + perfStats.linkElementsCount} Controls
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {perfStats.linkElementsCount} links, {perfStats.imageElementsCount} images rendered
                                            </div>
                                        </div>

                                        {/* LocalStorage & SessionStorage */}
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.1rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaHdd style={{ color: '#10b981' }} /> LocalStorage Size
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.localStorageSizeKB}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {perfStats.localStorageKeysCount} keys saved ({perfStats.sessionStorageKeysCount} session keys)
                                            </div>
                                        </div>

                                        {/* App Uptime */}
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.1rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaClock style={{ color: '#f59e0b' }} /> App Session Duration
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.sessionUptime}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                Route: {perfStats.activeRoute}
                                            </div>
                                        </div>
                                    </div>

                                    {/* LocalStorage Key Audit List */}
                                    {perfStats.localStorageKeysList.length > 0 && (
                                        <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                                                Active Client LocalStorage Key Audit:
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {perfStats.localStorageKeysList.map((item, idx) => (
                                                    <span key={idx} style={{
                                                        background: 'rgba(99, 102, 241, 0.12)',
                                                        color: '#a5b4fc',
                                                        border: '1px solid rgba(99, 102, 241, 0.25)',
                                                        borderRadius: '6px',
                                                        padding: '3px 8px',
                                                        fontSize: '0.78rem',
                                                        fontFamily: 'var(--font-mono)'
                                                    }}>
                                                        {item.key} ({item.sizeBytes} B)
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SUB-TAB 4: Database & Firestore Collections */}
                            {perfSubTab === 'database' && (
                                <div>
                                    <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div>
                                            <h5 style={{ color: 'var(--accent-color)', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                                Live Firestore Database Collections Audit
                                            </h5>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                Live record counts fetched directly from Firestore database
                                            </span>
                                        </div>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600', border: '1px solid rgba(16,185,129,0.3)' }}>
                                            Total Content Records: {perfStats.dbTotalItemsCount}
                                        </div>
                                    </div>

                                    {/* Collection Cards Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                                <FaFolder /> Projects (`projects`)
                                            </div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbCollectionCounts.projects}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active portfolio projects</span>
                                        </div>

                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                                <FaBookOpen /> Blog Posts (`blogs`)
                                            </div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbCollectionCounts.blogs}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Articles & blog entries</span>
                                        </div>

                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                                <FaCamera /> Photography (`photography`)
                                            </div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbCollectionCounts.photography}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Photo gallery uploads</span>
                                        </div>

                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                                <FaFolder /> Hobbies (`hobbies`)
                                            </div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbCollectionCounts.hobbies}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Beyond Work hub items</span>
                                        </div>

                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                                <FaMicrochip /> IoT Projects (`iot`)
                                            </div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbCollectionCounts.iot}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>IoT hardware projects</span>
                                        </div>

                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                                <FaSlidersH /> AI Showcase (`ai`)
                                            </div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbCollectionCounts.ai}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI & ML experiments</span>
                                        </div>

                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                                <FaClock /> Version Releases (`versionHistory`)
                                            </div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbCollectionCounts.versionHistory}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tracked release logs</span>
                                        </div>

                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14b8a6', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                                <FaGlobe /> Visitor Logs (`visitor_logs`)
                                            </div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                                {perfStats.dbCollectionCounts.visitor_logs}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Logged user sessions</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Extended Storage & Analytics summary footer */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                        Browser Quota & Storage Estimate
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        Used quota: <strong style={{ color: 'var(--accent-color)' }}>{perfStats.storageUsedMB}</strong>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                    <div>App Version: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>v{packageJson.version}</span></div>
                                    <div>Environment: <span style={{ color: '#10b981', fontWeight: '600' }}>{process.env.NODE_ENV || 'production'}</span></div>
                                </div>
                            </div>
                        </div>             </div>
                    </div>

                </div>

                <div className="settings-footer">
                    <button
                        type="submit"
                        className="btn btn-primary btn-large"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="admin-spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FaSave /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsManager;
