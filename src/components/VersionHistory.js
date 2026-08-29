import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
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
            return { bg: 'rgba(156, 163, 175, 0.12)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)', label: 'CHORE' };
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
        const fetchVersions = async () => {
            setLoading(true);
            let combined = [...staticVersionHistory];

            // 1. Fetch Firestore Version History if configured
            try {
                const snapshot = await getDocs(collection(db, 'versionHistory'));
                if (!snapshot.empty) {
                    const dbVersions = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })).filter(v => v.isVisible !== false);

                    if (dbVersions.length > 0) {
                        const dbVersionNumbers = new Set(dbVersions.map(v => String(v.version)));
                        const remainingStatic = staticVersionHistory.filter(s => !dbVersionNumbers.has(String(s.version)));
                        combined = [...dbVersions, ...remainingStatic];
                    }
                }
            } catch (err) {
                // Graceful fallback if firestore permissions or table pending
            }

            // 2. Fetch live commits from GitHub API directly
            try {
                const ghRes = await fetch('https://api.github.com/repos/arpitpardesi/portfolio/commits?per_page=30');
                if (ghRes.ok) {
                    const ghCommits = await ghRes.json();
                    if (Array.isArray(ghCommits) && ghCommits.length > 0) {
                        const currentPkgVer = String(packageJson.version);
                        let latestBucket = combined.find(v => String(v.version) === currentPkgVer);

                        if (!latestBucket) {
                            const today = new Date().toISOString().split('T')[0];
                            latestBucket = {
                                version: currentPkgVer,
                                date: today,
                                title: `Version ${currentPkgVer} Release`,
                                isLatest: true,
                                highlights: `Live production build for Version ${currentPkgVer} synced with GitHub repo.`,
                                changes: []
                            };
                            combined.unshift(latestBucket);
                        }

                        const existingHashes = new Set((latestBucket.changes || []).map(c => c.hash).filter(Boolean));
                        const existingDescs = new Set((latestBucket.changes || []).map(c => c.description.toLowerCase()));

                        ghCommits.forEach(item => {
                            const hash = item.sha ? item.sha.substring(0, 8) : '';
                            const rawMsg = item.commit?.message ? item.commit.message.split('\n')[0] : '';
                            const cleanMsg = rawMsg.replace(/^(feat|fix|refactor|style|chore|docs)(\([^)]+\))?:\s*/i, '').trim();

                            if (cleanMsg && !existingHashes.has(hash) && !existingDescs.has(cleanMsg.toLowerCase())) {
                                const type = parseCommitType(rawMsg);
                                latestBucket.changes.unshift({
                                    type,
                                    description: cleanMsg,
                                    hash
                                });
                                existingDescs.add(cleanMsg.toLowerCase());
                            }
                        });
                    }
                }
            } catch (ghErr) {
                // Graceful fallback to static data if offline or rate limited
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

            // Set isLatest strictly on top version
            if (sortedVersionsHaveItems(combined)) {
                const topVer = String(combined[0].version);
                combined = combined.map(v => ({
                    ...v,
                    isLatest: String(v.version) === topVer
                }));
            }

            setVersionsList(combined);
            setLoading(false);
        };

        fetchVersions();
    }, []);

    const sortedVersionsHaveItems = (arr) => Array.isArray(arr) && arr.length > 0;

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
        <section className="version-history-page" style={{
            minHeight: '100vh',
            padding: 'calc(120px + env(safe-area-inset-top)) 20px 80px',
            position: 'relative',
            zIndex: 1
        }}>
            <Helmet>
                <title>Version History | Arpit Pardesi</title>
                <meta name="description" content="Complete version history and changelog for Arpit Pardesi's portfolio website." />
            </Helmet>

            <div className="container" style={{ maxWidth: '1100px', width: '100%' }}>
                {/* Floating Back Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'fixed', top: 'calc(100px + env(safe-area-inset-top))', left: '40px', zIndex: 100 }}
                    className="back-nav"
                >
                    <motion.div
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0px 0px 8px var(--accent-color)",
                            backgroundColor: "rgba(var(--accent-rgb, 239, 68, 68), 0.1)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        style={{ borderRadius: '50px', display: 'inline-block' }}
                    >
                        <button onClick={() => navigate(-1)} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: '500',
                            padding: '8px 16px',
                            borderRadius: '50px',
                            background: 'rgba(10, 10, 10, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                        }}>
                            <FaArrowLeft /> Back
                        </button>
                    </motion.div>
                </motion.div>

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '45px' }}
                >
                    <span className="section-subtitle" style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--accent-color)',
                        fontSize: '0.9rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '10px'
                    }}>
                        {"// System Evolution & Changelog"}
                    </span>
                    <h1 className="section-title" style={{
                        fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        margin: '0 0 15px 0'
                    }}>
                        Version History
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        maxWidth: '620px',
                        margin: '0 auto',
                        fontSize: '1rem',
                        lineHeight: '1.6'
                    }}>
                        Explore release milestones, feature implementations, UI refinements, and architectural improvements across all updates.
                    </p>
                </motion.div>

                {/* Search & Category Filters Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '50px'
                    }}
                >
                    {/* Search Input */}
                    <div style={{
                        position: 'relative',
                        maxWidth: '520px',
                        width: '100%'
                    }}>
                        <FaSearch style={{
                            position: 'absolute',
                            left: '18px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                        }} />
                        <input
                            type="text"
                            placeholder="Search changes, features, version numbers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 18px 12px 48px',
                                borderRadius: '50px',
                                background: 'rgba(15, 15, 18, 0.6)',
                                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.1))'}
                        />
                    </div>

                    {/* Category Filter Pills */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <span style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            marginRight: '0.25rem'
                        }}>
                            <FaFilter style={{ fontSize: '0.75rem' }} /> Filter:
                        </span>
                        {categories.map(cat => {
                            const active = selectedCategory === cat.id;
                            return (
                                <motion.button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '50px',
                                        border: active ? '1px solid var(--accent-color)' : '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                                        background: active ? 'rgba(var(--accent-rgb, 239, 68, 68), 0.15)' : 'rgba(15, 15, 18, 0.6)',
                                        color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        fontWeight: active ? '600' : '400',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(5px)',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    {cat.label}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Version Timeline */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    {/* Vertical Timeline Stem Line */}
                    <div style={{
                        position: 'absolute',
                        left: '23px',
                        top: '24px',
                        bottom: '24px',
                        width: '2px',
                        background: 'linear-gradient(to bottom, var(--accent-color) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        zIndex: 0
                    }} />

                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    padding: '3rem',
                                    textAlign: 'center',
                                    color: 'var(--accent-color)',
                                    fontFamily: 'var(--font-mono, monospace)'
                                }}
                            >
                                Loading release history...
                            </motion.div>
                        ) : filteredHistory.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    padding: '4rem 2rem',
                                    textAlign: 'center',
                                    background: 'rgba(15, 15, 18, 0.5)',
                                    borderRadius: '16px',
                                    border: '1px dashed var(--border-color, rgba(255, 255, 255, 0.1))',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                <FaHistory style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5, color: 'var(--accent-color)' }} />
                                <p style={{ fontSize: '1.05rem', margin: 0 }}>No version releases match your search or filter options.</p>
                            </motion.div>
                        ) : (
                            filteredHistory.map((item, index) => {
                                const isExpanded = expandedVersions[item.version] ?? (index === 0);
                                const summaryText = item.highlights || item.description || item.desc || item.fullDesc;
                                const changesList = normalizeChanges(item);

                                return (
                                    <motion.div
                                        key={item.version}
                                        initial={{ opacity: 0, y: 25 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: index * 0.04 }}
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            paddingLeft: '52px'
                                        }}
                                    >
                                        {/* Node Bullet on Timeline */}
                                        <div style={{
                                            position: 'absolute',
                                            left: '14px',
                                            top: '24px',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: item.isLatest ? 'var(--accent-color)' : '#0a0a0a',
                                            border: item.isLatest ? '4px solid rgba(var(--accent-rgb, 239, 68, 68), 0.35)' : '2px solid var(--border-color, rgba(255, 255, 255, 0.25))',
                                            boxShadow: item.isLatest ? '0 0 16px var(--accent-color)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }} />

                                        {/* Release Card */}
                                        <div style={{
                                            background: 'rgba(15, 15, 18, 0.65)',
                                            borderRadius: '16px',
                                            border: item.isLatest ? '1px solid rgba(var(--accent-rgb, 239, 68, 68), 0.4)' : '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                                            backdropFilter: 'blur(12px)',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            boxShadow: item.isLatest ? '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(var(--accent-rgb, 239, 68, 68), 0.05)' : '0 4px 20px rgba(0, 0, 0, 0.2)'
                                        }}>
                                            {/* Card Header Bar */}
                                            <div
                                                onClick={() => toggleExpand(item.version)}
                                                style={{
                                                    padding: '1.25rem 1.5rem',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    userSelect: 'none',
                                                    background: item.isLatest ? 'rgba(var(--accent-rgb, 239, 68, 68), 0.06)' : 'transparent',
                                                    transition: 'background 0.2s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                                    {/* Version Tag */}
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        padding: '4px 12px',
                                                        borderRadius: '8px',
                                                        background: item.isLatest ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.08)',
                                                        color: '#fff',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '700',
                                                        fontFamily: 'var(--font-mono, monospace)',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        <FaCodeBranch style={{ fontSize: '0.8rem' }} /> v{item.version}
                                                    </span>

                                                    {item.isLatest && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: '700',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            background: 'rgba(34, 197, 94, 0.15)',
                                                            color: '#4ade80',
                                                            border: '1px solid rgba(34, 197, 94, 0.3)',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            LATEST RELEASE
                                                        </span>
                                                    )}

                                                    <h3 style={{
                                                        margin: 0,
                                                        fontSize: '1.2rem',
                                                        fontWeight: '600',
                                                        color: 'var(--text-primary)'
                                                    }}>
                                                        {item.title}
                                                    </h3>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                    <span style={{
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-secondary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        fontFamily: 'var(--font-mono, monospace)'
                                                    }}>
                                                        <FaCalendarAlt style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }} /> {item.date}
                                                    </span>
                                                    <div style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '0.85rem'
                                                    }}>
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
                                                        <div style={{
                                                            padding: '0 1.5rem 1.5rem 1.5rem',
                                                            borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))'
                                                        }}>
                                                            {/* Highlights Callout */}
                                                            {summaryText && (
                                                                <p style={{
                                                                    margin: '1.2rem 0 1.25rem 0',
                                                                    color: 'var(--text-primary)',
                                                                    fontSize: '0.95rem',
                                                                    lineHeight: '1.6',
                                                                    background: 'rgba(0, 0, 0, 0.3)',
                                                                    padding: '0.85rem 1.1rem',
                                                                    borderRadius: '10px',
                                                                    borderLeft: '3px solid var(--accent-color)',
                                                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                                                    borderLeftWidth: '3px',
                                                                    borderLeftColor: 'var(--accent-color)'
                                                                }}>
                                                                    {summaryText}
                                                                </p>
                                                            )}

                                                            {/* Changes List */}
                                                            {changesList.length > 0 && (
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '0.75rem'
                                                                }}>
                                                                    {changesList.map((change, cIdx) => {
                                                                        const style = getTypeBadgeStyle(change.type);

                                                                        return (
                                                                            <div key={cIdx} style={{
                                                                                display: 'flex',
                                                                                alignItems: 'flex-start',
                                                                                gap: '0.85rem',
                                                                                fontSize: '0.925rem',
                                                                                color: 'var(--text-secondary)'
                                                                            }}>
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
                                                                                <span style={{ lineHeight: '1.5', flex: 1, color: 'rgba(255, 255, 255, 0.88)' }}>
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
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default VersionHistory;
