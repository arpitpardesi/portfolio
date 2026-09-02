import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import packageJson from '../../package.json';
import { 
    FaArrowLeft, FaHistory, FaSearch, FaFilter, 
    FaCodeBranch, FaCalendarAlt, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';
import { versionHistory as staticVersionHistory } from '../data/versionHistory';

const getTypeBadgeStyle = (type) => {
    switch (type) {
        case 'feat':
            return { bg: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)', label: 'FEATURE' };
        case 'refactor':
            return { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)', label: 'REFACTOR' };
        case 'fix':
            return { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)', label: 'FIX' };
        case 'style':
            return { bg: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)', label: 'STYLE' };
        case 'chore':
        default:
            return { bg: 'rgba(107, 114, 128, 0.12)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)', label: 'CHORE' };
    }
};

const compareSemVer = (v1, v2) => {
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
};

const parseCommitType = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.startsWith('feat') || lower.includes('implement') || lower.includes('add')) return 'feat';
    if (lower.startsWith('refactor') || lower.includes('refine') || lower.includes('update')) return 'refactor';
    if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('resolve')) return 'fix';
    if (lower.startsWith('style') || lower.includes('css') || lower.includes('ui')) return 'style';
    if (lower.startsWith('docs') || lower.includes('readme')) return 'doc';
    return 'chore';
};

const normalizeChanges = (item) => {
    if (Array.isArray(item.changes) && item.changes.length > 0) {
        return item.changes.map(c => {
            if (typeof c === 'string') return { type: parseCommitType(c), description: c };
            return { type: c.type || parseCommitType(c.description || ''), description: c.description || c.desc || c.title || '' };
        });
    }

    const text = item.fullDesc || item.description || item.details || '';
    if (text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        return lines.map(line => {
            const clean = line.replace(/^[-*•\d.]+\s*/, '');
            return { type: parseCommitType(clean || line), description: clean || line };
        });
    }

    return [];
};

const VersionHistory = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [versionsList, setVersionsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedVersions, setExpandedVersions] = useState({ [packageJson.version]: true });

    useEffect(() => {
        let unsubscribe = () => {};

        const setupRealtimeSync = () => {
            setLoading(true);
            try {
                unsubscribe = onSnapshot(collection(db, 'versionHistory'), (snapshot) => {
                    let combined = [...staticVersionHistory];

                    if (!snapshot.empty) {
                        const dbVersions = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        const dbMap = new Map();
                        dbVersions.forEach(v => {
                            dbMap.set(String(v.version), v);
                        });

                        const mergedStatic = staticVersionHistory.filter(s => {
                            const dbItem = dbMap.get(String(s.version));
                            return !dbItem || dbItem.isVisible !== false;
                        }).map(s => {
                            const dbItem = dbMap.get(String(s.version));
                            return dbItem ? { ...s, ...dbItem } : s;
                        });

                        const newDbItems = dbVersions.filter(d => 
                            d.isVisible !== false && 
                            !staticVersionHistory.some(s => String(s.version) === String(d.version))
                        );

                        combined = [...newDbItems, ...mergedStatic];
                    } else {
                        combined = staticVersionHistory.filter(v => v.isVisible !== false);
                    }

                    // Ensure current package.version exists in combined list
                    const currentPkgVer = String(packageJson.version);
                    const hasCurrentVer = combined.some(v => String(v.version) === currentPkgVer);

                    if (!hasCurrentVer) {
                        const today = new Date().toISOString().split('T')[0];
                        const dynamicCurrentEntry = {
                            version: currentPkgVer,
                            date: today,
                            title: `Version ${currentPkgVer} Release`,
                            isLatest: true,
                            highlights: `Production deployment of Version ${currentPkgVer}. Updated system configurations and performance optimizations.`,
                            changes: [
                                { type: 'feat', description: `Deployed production build for version ${currentPkgVer}` }
                            ]
                        };
                        combined.unshift(dynamicCurrentEntry);
                    }

                    // Sort descending using strict SemVer
                    combined.sort((a, b) => compareSemVer(a.version, b.version));

                    // Respect explicit isLatest set in Firestore, or set top version as isLatest if none set
                    const hasExplicitLatest = combined.some(v => v.isLatest === true);
                    if (!hasExplicitLatest && combined.length > 0) {
                        combined[0].isLatest = true;
                    }

                    setVersionsList(combined);
                    setLoading(false);
                }, (err) => {
                    console.error("Firestore onSnapshot error, falling back to static dataset: ", err);
                    setVersionsList(staticVersionHistory);
                    setLoading(false);
                });
            } catch (err) {
                console.error("Failed setting up real-time listener: ", err);
                setVersionsList(staticVersionHistory);
                setLoading(false);
            }
        };

        setupRealtimeSync();

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    const toggleExpand = (ver) => {
        setExpandedVersions(prev => ({
            ...prev,
            [ver]: !prev[ver]
        }));
    };

    const categories = [
        { id: 'all', label: 'All Releases' },
        { id: 'feat', label: 'Features' },
        { id: 'refactor', label: 'Refactors' },
        { id: 'fix', label: 'Fixes' },
        { id: 'chore', label: 'Chores' }
    ];

    const filteredHistory = useMemo(() => {
        return versionsList.filter(item => {
            const changesList = normalizeChanges(item);

            if (selectedCategory !== 'all') {
                const hasMatchingType = changesList.some(c => c.type === selectedCategory);
                if (!hasMatchingType) return false;
            }

            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const matchesVersion = String(item.version).toLowerCase().includes(q);
                const matchesTitle = (item.title || '').toLowerCase().includes(q);
                const matchesHighlights = (item.highlights || item.description || item.fullDesc || '').toLowerCase().includes(q);
                const matchesChanges = changesList.some(c => (c.description || '').toLowerCase().includes(q));

                return matchesVersion || matchesTitle || matchesHighlights || matchesChanges;
            }

            return true;
        });
    }, [versionsList, searchQuery, selectedCategory]);

    return (
        <section className="version-history-page">
            <Helmet>
                <title>Version History | Arpit Pardesi</title>
                <meta name="description" content="Complete version history and changelog for Arpit Pardesi's portfolio website." />
            </Helmet>

            <div className="container vh-container">
                {/* Floating Back Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="back-nav"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ borderRadius: '50px', display: 'inline-block' }}
                    >
                        <button onClick={() => navigate(-1)} className="back-nav-btn">
                            <FaArrowLeft /> Back
                        </button>
                    </motion.div>
                </motion.div>

                {/* Section Header Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="vh-header"
                >
                    <h1 className="vh-main-title">
                        <span className="vh-accent-text">
                            Version{' '}
                        </span>
                        <span className="vh-white-text">
                            History
                        </span>
                    </h1>
                    <p className="vh-description">
                        Explore release milestones, feature implementations, UI refinements, and architectural improvements across all updates.
                    </p>
                </motion.div>

                {/* Search & Category Filters Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="vh-controls"
                >
                    {/* Search Input Box */}
                    <div className="vh-search-box">
                        <FaSearch className="vh-search-icon" />
                        <input
                            type="text"
                            placeholder="Search changes, features, version numbers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="vh-search-input"
                        />
                    </div>

                    {/* Filter Pills Bar */}
                    <div className="vh-filter-row">
                        <span className="vh-filter-label">
                            <FaFilter style={{ fontSize: '0.75rem' }} /> Filter:
                        </span>
                        <div className="vh-pills-container">
                            {categories.map(cat => {
                                const active = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`vh-pill-btn ${active ? 'active' : ''}`}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Floating Cosmic Timeline */}
                <div className="vh-timeline">
                    {/* Simple Clean Connecting Line */}
                    <div className="vh-simple-line" />

                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="vh-loading"
                            >
                                Loading release history...
                            </motion.div>
                        ) : filteredHistory.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="vh-empty"
                            >
                                <FaHistory style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5, color: 'var(--accent-color)' }} />
                                <p style={{ fontSize: '1.05rem', margin: 0 }}>No version releases match your search or filter options.</p>
                            </motion.div>
                        ) : (
                            filteredHistory.map((item, index) => {
                                const isExpanded = expandedVersions[item.version] ?? (index === 0);
                                const summaryText = item.highlights || item.description || item.desc || item.fullDesc;
                                const changesList = normalizeChanges(item);
                                const floatDelay = (index % 4) * 0.6;

                                return (
                                    <motion.div
                                        key={item.version}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{
                                            opacity: 1,
                                            y: [0, -5, 0],
                                        }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{
                                            opacity: { duration: 0.5, delay: index * 0.05 },
                                            y: {
                                                duration: 4.5 + (index % 3),
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: floatDelay
                                            }
                                        }}
                                        className="vh-node-wrapper"
                                    >
                                        {/* Orbital Energy Core */}
                                        <div className={`vh-cosmic-orb ${item.isLatest ? 'latest' : ''}`}>
                                            <div className="vh-orb-core" />
                                            <div className="vh-orb-ring" />
                                        </div>

                                        {/* Floating Cosmic Glass Card */}
                                        <motion.div
                                            whileHover={{
                                                y: -6,
                                                boxShadow: item.isLatest
                                                    ? '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 35px rgba(var(--accent-rgb, 239, 68, 68), 0.25)'
                                                    : '0 12px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.05)'
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className={`vh-card ${item.isLatest ? 'latest' : ''}`}
                                        >
                                            {/* Card Header Bar */}
                                            <div
                                                onClick={() => toggleExpand(item.version)}
                                                className={`vh-card-header ${item.isLatest ? 'latest' : ''}`}
                                            >
                                                <div className="vh-card-header-left">
                                                    <div className="vh-tags-row">
                                                        <span className={`vh-ver-tag ${item.isLatest ? 'latest' : ''}`}>
                                                            <FaCodeBranch style={{ fontSize: '0.8rem' }} /> v{item.version}
                                                        </span>

                                                        {item.isLatest && (
                                                            <span className="vh-latest-badge">
                                                                LATEST RELEASE
                                                            </span>
                                                        )}

                                                        <span className="vh-date-mobile">
                                                            <FaCalendarAlt style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }} /> {item.date}
                                                        </span>
                                                    </div>

                                                    <h3 className="vh-card-title">
                                                        {item.title}
                                                    </h3>
                                                </div>

                                                <div className="vh-card-header-right">
                                                    <span className="vh-date-desktop">
                                                        <FaCalendarAlt style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }} /> {item.date}
                                                    </span>
                                                    <div className="vh-toggle-btn">
                                                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <AnimatePresence initial={false}>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <div className="vh-card-body">
                                                            {/* Highlights Callout */}
                                                            {summaryText && (
                                                                <p className="vh-highlights">
                                                                    {summaryText}
                                                                </p>
                                                            )}

                                                            {/* Changes List */}
                                                            {changesList.length > 0 && (
                                                                <div className="vh-changes-list">
                                                                    {changesList.map((change, cIdx) => {
                                                                        const style = getTypeBadgeStyle(change.type);

                                                                        return (
                                                                            <div key={cIdx} className="vh-change-item">
                                                                                <span style={{
                                                                                    fontSize: '0.65rem',
                                                                                    fontWeight: '700',
                                                                                    padding: '2px 6px',
                                                                                    borderRadius: '4px',
                                                                                    background: style.bg,
                                                                                    color: style.color,
                                                                                    border: `1px solid ${style.border}`,
                                                                                    fontFamily: 'var(--font-mono, monospace)',
                                                                                    letterSpacing: '0.5px',
                                                                                    marginTop: '2px',
                                                                                    flexShrink: 0
                                                                                }}>
                                                                                    {style.label}
                                                                                </span>
                                                                                <span className="vh-change-text">
                                                                                    {change.description}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>
                {`
                    .version-history-page {
                        padding: calc(120px + env(safe-area-inset-top)) 20px 80px;
                        min-height: 100vh;
                        position: relative;
                        z-index: 1;
                    }

                    .vh-container {
                        max-width: 1100px;
                        margin: 0 auto;
                        width: 100%;
                    }

                    .back-nav {
                        position: fixed;
                        top: calc(100px + env(safe-area-inset-top));
                        left: 40px;
                        z-index: 100;
                    }

                    .back-nav-btn {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: var(--text-secondary);
                        text-decoration: none;
                        font-size: 1rem;
                        font-weight: 500;
                        padding: 8px 16px;
                        border-radius: 50px;
                        background: rgba(10, 10, 10, 0.5);
                        backdrop-filter: blur(5px);
                        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                        transition: all 0.3s ease;
                        cursor: pointer;
                        font-family: inherit;
                    }

                    .vh-header {
                        text-align: center;
                        margin-bottom: 3.5rem;
                    }

                    .vh-main-title {
                        font-size: clamp(2.2rem, 6vw, 3.5rem);
                        margin-bottom: 1rem;
                        font-weight: 700;
                        line-height: 1.2;
                    }

                    .vh-accent-text {
                        color: var(--accent-color);
                        text-shadow: 0 0 40px rgba(var(--accent-rgb, 239, 68, 68), 0.5);
                    }

                    .vh-white-text {
                        color: var(--text-primary);
                    }

                    .vh-description {
                        color: var(--text-secondary);
                        max-width: 620px;
                        margin: 0 auto;
                        font-size: clamp(1rem, 2.5vw, 1.15rem);
                        line-height: 1.6;
                    }

                    .vh-controls {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 1.25rem;
                        margin-bottom: 3.5rem;
                    }

                    .vh-search-box {
                        position: relative;
                        max-width: 540px;
                        width: 100%;
                    }

                    .vh-search-icon {
                        position: absolute;
                        left: 18px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: var(--text-secondary);
                        font-size: 0.9rem;
                    }

                    .vh-search-input {
                        width: 100%;
                        padding: 12px 18px 12px 48px;
                        border-radius: 50px;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                        color: var(--text-primary);
                        font-size: 0.95rem;
                        outline: none;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(10px);
                        box-sizing: border-box;
                    }

                    .vh-search-input:focus {
                        border-color: var(--accent-color);
                    }

                    .vh-filter-row {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                        max-width: 100%;
                    }

                    .vh-filter-label {
                        font-size: 0.85rem;
                        color: var(--text-secondary);
                        display: inline-flex;
                        align-items: center;
                        gap: 0.4rem;
                        margin-right: 0.25rem;
                        white-space: nowrap;
                    }

                    .vh-pills-container {
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                    }

                    .vh-pill-btn {
                        padding: 8px 20px;
                        border-radius: 30px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        background: rgba(255, 255, 255, 0.03);
                        color: var(--text-secondary);
                        font-size: 0.85rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.25s ease;
                        backdrop-filter: blur(5px);
                        font-family: inherit;
                        white-space: nowrap;
                    }

                    .vh-pill-btn:hover {
                        border-color: var(--accent-color);
                        color: var(--text-primary);
                    }

                    .vh-pill-btn.active {
                        border-color: var(--accent-color);
                        background: rgba(var(--accent-rgb, 239, 68, 68), 0.2);
                        color: #ffffff;
                        font-weight: 600;
                    }

                    .vh-timeline {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        gap: 30px;
                    }

                    /* Simple Clean Connecting Line */
                    .vh-simple-line {
                        position: absolute;
                        left: 23px;
                        top: 24px;
                        bottom: 24px;
                        width: 2px;
                        background: linear-gradient(
                            180deg,
                            var(--accent-color) 0%,
                            rgba(255, 255, 255, 0.08) 100%
                        );
                        transform: translateX(-50%);
                        z-index: 0;
                        pointer-events: none;
                        opacity: 0.6;
                    }

                    .vh-loading {
                        padding: 3rem;
                        text-align: center;
                        color: var(--accent-color);
                        font-family: var(--font-mono, monospace);
                    }

                    .vh-empty {
                        padding: 4rem 2rem;
                        text-align: center;
                        background: rgba(255, 255, 255, 0.02);
                        border-radius: 16px;
                        border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.1));
                        color: var(--text-secondary);
                    }

                    .vh-node-wrapper {
                        position: relative;
                        z-index: 1;
                        padding-left: 54px;
                    }

                    /* Cosmic Orbital Energy Core */
                    .vh-cosmic-orb {
                        position: absolute;
                        left: 13px;
                        top: 24px;
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2;
                    }

                    .vh-orb-core {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: #0a0a0a;
                        border: 2px solid rgba(255, 255, 255, 0.4);
                        box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                        transition: all 0.3s ease;
                    }

                    .vh-orb-ring {
                        position: absolute;
                        width: 22px;
                        height: 22px;
                        border-radius: 50%;
                        border: 1px dashed rgba(255, 255, 255, 0.2);
                        animation: spinRing 12s infinite linear;
                    }

                    @keyframes spinRing {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    .vh-cosmic-orb.latest .vh-orb-core {
                        background: var(--accent-color);
                        border: 2px solid #ffffff;
                        box-shadow: 0 0 18px var(--accent-color), inset 0 0 8px #ffffff;
                    }

                    .vh-cosmic-orb.latest .vh-orb-ring {
                        border: 1.5px solid var(--accent-color);
                        box-shadow: 0 0 12px rgba(var(--accent-rgb, 239, 68, 68), 0.5);
                        animation: spinRing 6s infinite linear;
                    }

                    /* Floating Cosmic Glass Card */
                    .vh-card {
                        background: rgba(15, 15, 22, 0.6);
                        border-radius: 18px;
                        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
                        backdrop-filter: blur(16px);
                        overflow: hidden;
                        transition: border-color 0.3s ease, background 0.3s ease;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                    }

                    .vh-card.latest {
                        border-color: rgba(var(--accent-rgb, 239, 68, 68), 0.4);
                        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(var(--accent-rgb, 239, 68, 68), 0.08);
                    }

                    .vh-card-header {
                        padding: 1.25rem 1.5rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        cursor: pointer;
                        user-select: none;
                        transition: background 0.2s ease;
                    }

                    .vh-card-header.latest {
                        background: rgba(var(--accent-rgb, 239, 68, 68), 0.06);
                    }

                    .vh-card-header-left {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        flex-wrap: wrap;
                    }

                    .vh-tags-row {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    }

                    .vh-ver-tag {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.4rem;
                        padding: 4px 12px;
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.08);
                        color: #fff;
                        font-size: 0.9rem;
                        font-weight: 700;
                        font-family: var(--font-mono, monospace);
                        letter-spacing: 0.5px;
                    }

                    .vh-ver-tag.latest {
                        background: var(--accent-color);
                    }

                    .vh-latest-badge {
                        font-size: 0.7rem;
                        font-weight: 700;
                        padding: 2px 8px;
                        border-radius: 12px;
                        background: rgba(34, 197, 94, 0.15);
                        color: #4ade80;
                        border: 1px solid rgba(34, 197, 94, 0.3);
                        letter-spacing: 0.5px;
                    }

                    .vh-card-title {
                        margin: 0;
                        font-size: 1.2rem;
                        font-weight: 600;
                        color: var(--text-primary);
                    }

                    .vh-card-header-right {
                        display: flex;
                        align-items: center;
                        gap: 1.25rem;
                    }

                    .vh-date-desktop {
                        font-size: 0.85rem;
                        color: var(--text-secondary);
                        display: flex;
                        align-items: center;
                        gap: 0.4rem;
                        font-family: var(--font-mono, monospace);
                    }

                    .vh-date-mobile {
                        display: none;
                        font-size: 0.8rem;
                        color: var(--text-secondary);
                        font-family: var(--font-mono, monospace);
                    }

                    .vh-toggle-btn {
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.05);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--text-secondary);
                        font-size: 0.85rem;
                        flex-shrink: 0;
                    }

                    .vh-card-body {
                        padding: 0 1.5rem 1.5rem 1.5rem;
                        border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    }

                    .vh-highlights {
                        margin: 1.2rem 0 1.25rem 0;
                        color: var(--text-primary);
                        font-size: 0.95rem;
                        line-height: 1.6;
                        background: rgba(0, 0, 0, 0.3);
                        padding: 0.85rem 1.1rem;
                        border-radius: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-left: 3px solid var(--accent-color);
                    }

                    .vh-changes-list {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .vh-change-item {
                        display: flex;
                        align-items: flex-start;
                        gap: 0.85rem;
                        font-size: 0.925rem;
                        color: var(--text-secondary);
                    }

                    .vh-change-text {
                        line-height: 1.5;
                        flex: 1;
                        color: rgba(255, 255, 255, 0.88);
                    }

                    /* Tablet & Mobile Responsiveness */
                    @media (max-width: 768px) {
                        .version-history-page {
                            padding: calc(90px + env(safe-area-inset-top)) 16px 60px;
                        }

                        .back-nav {
                            position: fixed;
                            top: calc(82px + env(safe-area-inset-top));
                            left: 16px;
                            z-index: 100;
                        }

                        .back-nav-btn {
                            padding: 6px 14px;
                            font-size: 0.85rem;
                        }

                        .vh-header {
                            margin-top: 10px;
                            margin-bottom: 2.5rem;
                        }

                        .vh-controls {
                            margin-bottom: 2.5rem;
                            gap: 15px;
                        }

                        .vh-filter-row {
                            width: 100%;
                            flex-direction: column;
                            align-items: flex-start;
                        }

                        .vh-pills-container {
                            width: 100%;
                            justify-content: flex-start;
                            overflow-x: auto;
                            padding-bottom: 8px;
                            -webkit-overflow-scrolling: touch;
                            scrollbar-width: none;
                        }

                        .vh-pills-container::-webkit-scrollbar {
                            display: none;
                        }

                        .vh-pill-btn {
                            padding: 6px 16px;
                            font-size: 0.8rem;
                        }
                    }

                    @media (max-width: 640px) {
                        .vh-node-wrapper {
                            padding-left: 32px;
                        }

                        .vh-simple-line {
                            left: 11px;
                            top: 20px;
                            bottom: 20px;
                        }

                        .vh-cosmic-orb {
                            left: 0px;
                            top: 20px;
                            width: 18px;
                            height: 18px;
                        }

                        .vh-orb-core {
                            width: 10px;
                            height: 10px;
                        }

                        .vh-orb-ring {
                            width: 18px;
                            height: 18px;
                        }

                        .vh-card-header {
                            padding: 1rem 1.1rem;
                            flex-direction: column;
                            align-items: flex-start;
                            gap: 0.75rem;
                            position: relative;
                        }

                        .vh-card-header-left {
                            width: 100%;
                            flex-direction: column;
                            align-items: flex-start;
                            gap: 0.5rem;
                            padding-right: 36px;
                        }

                        .vh-card-title {
                            font-size: 1.05rem;
                            line-height: 1.4;
                        }

                        .vh-card-header-right {
                            width: 100%;
                            justify-content: space-between;
                        }

                        .vh-date-desktop {
                            display: none;
                        }

                        .vh-date-mobile {
                            display: inline-flex;
                            align-items: center;
                            gap: 0.3rem;
                        }

                        .vh-toggle-btn {
                            position: absolute;
                            right: 1.1rem;
                            top: 1rem;
                        }

                        .vh-card-body {
                            padding: 0 1.1rem 1.1rem 1.1rem;
                        }

                        .vh-highlights {
                            font-size: 0.875rem;
                            padding: 0.75rem 0.9rem;
                            margin: 0.9rem 0 1rem 0;
                        }

                        .vh-change-item {
                            gap: 0.6rem;
                            font-size: 0.875rem;
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default VersionHistory;
