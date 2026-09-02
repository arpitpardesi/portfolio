import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaHistory, FaEye, FaEyeSlash, FaList, FaCalendarAlt, FaSearch, FaStar, FaThLarge, FaSync } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { versionHistory as staticVersionHistory } from '../../data/versionHistory';
import './Admin.css';

const VersionHistoryManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('tile'); // 'tile' (cards grid) or 'list' (detailed table list)
    const [expandedChanges, setExpandedChanges] = useState({});

    // Selection State
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemsToDelete, setItemsToDelete] = useState([]);
    const [showSeedConfirm, setShowSeedConfirm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        version: '',
        date: new Date().toISOString().split('T')[0],
        title: '',
        highlights: '',
        isLatest: false,
        isVisible: true,
        changesText: '',
        changesList: []
    });

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'versionHistory'));
            const itemsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => {
                const verA = String(a.version || '');
                const verB = String(b.version || '');
                return verB.localeCompare(verA, undefined, { numeric: true, sensitivity: 'base' });
            });
            setItems(itemsList);
        } catch (error) {
            console.error("Error fetching version history items: ", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Selection Handlers
    const toggleSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (filteredItems.length === 0) return;
        if (selectedItems.length === filteredItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItems.map(item => item.id));
        }
    };

    const confirmDelete = (id) => {
        setItemsToDelete([id]);
    };

    const confirmBulkDelete = () => {
        setItemsToDelete([...selectedItems]);
    };

    const executeDelete = async () => {
        if (itemsToDelete.length === 0) return;
        try {
            await Promise.all(itemsToDelete.map(id => deleteDoc(doc(db, 'versionHistory', id))));
            fetchItems();
            setItemsToDelete([]);
            setSelectedItems(prev => prev.filter(id => !itemsToDelete.includes(id)));
        } catch (error) {
            console.error("Error deleting version history document(s): ", error);
            alert("Error deleting item(s)");
        }
    };

    const handleRefreshSync = async () => {
        setIsSyncing(true);
        try {
            for (const item of staticVersionHistory) {
                const docId = `v${String(item.version).replace(/\./g, '_')}`;
                await setDoc(doc(db, 'versionHistory', docId), {
                    version: item.version,
                    date: item.date,
                    title: item.title,
                    highlights: item.highlights,
                    changes: item.changes || [],
                    isLatest: !!item.isLatest,
                    isVisible: true,
                    createdAt: new Date()
                }, { merge: true });
            }
            await fetchItems();
        } catch (e) {
            console.error("Error refreshing version sync: ", e);
            alert("Error syncing versions");
        }
        setIsSyncing(false);
    };

    const handleSeedDefaults = async () => {
        try {
            for (const item of staticVersionHistory) {
                const docId = `v${String(item.version).replace(/\./g, '_')}`;
                await setDoc(doc(db, 'versionHistory', docId), {
                    version: item.version,
                    date: item.date,
                    title: item.title,
                    highlights: item.highlights,
                    changes: item.changes || [],
                    isLatest: !!item.isLatest,
                    isVisible: true,
                    createdAt: new Date()
                }, { merge: true });
            }
            alert("Version History successfully seeded from Git log history! 🎉");
            fetchItems();
            setShowSeedConfirm(false);
        } catch (e) {
            console.error("Error seeding version history defaults: ", e);
            alert("Error seeding version history defaults");
        }
    };

    const toggleVisibility = async (item) => {
        try {
            const docRef = doc(db, 'versionHistory', item.id);
            const newStatus = !(item.isVisible !== false);
            await updateDoc(docRef, { isVisible: newStatus, updatedAt: new Date() });
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, isVisible: newStatus } : i));
        } catch (error) {
            console.error("Error updating visibility: ", error);
            alert("Failed to update visibility");
        }
    };

    const toggleLatestStatus = async (item) => {
        try {
            const newLatestState = !item.isLatest;
            if (newLatestState) {
                await Promise.all(items.map(i => {
                    if (i.id !== item.id && i.isLatest) {
                        return updateDoc(doc(db, 'versionHistory', i.id), { isLatest: false });
                    }
                    return Promise.resolve();
                }));
            }

            const docRef = doc(db, 'versionHistory', item.id);
            await updateDoc(docRef, { isLatest: newLatestState, updatedAt: new Date() });
            fetchItems();
        } catch (error) {
            console.error("Error updating latest status: ", error);
            alert("Failed to update latest status");
        }
    };

    const toggleExpandChanges = (id) => {
        setExpandedChanges(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const parseChangesFromText = (text) => {
        if (!text || typeof text !== 'string') return [];
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const clean = line.replace(/^[-*•\d.]+\s*/, '');
                const match = clean.match(/^(feat|fix|refactor|style|chore|docs|doc|build|ci|test)(\([^)]+\))?:\s*(.*)/i);
                if (match) {
                    return {
                        type: match[1].toLowerCase(),
                        description: match[3] || clean
                    };
                }
                return {
                    type: 'feat',
                    description: clean
                };
            });
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        const changesArr = item.changes || [];
        const changesAsText = changesArr.map(c => {
            if (typeof c === 'string') return c;
            return c.type ? `${c.type}: ${c.description}` : c.description;
        }).join('\n');

        setFormData({
            version: item.version || '',
            date: item.date || new Date().toISOString().split('T')[0],
            title: item.title || '',
            highlights: item.highlights || '',
            isLatest: !!item.isLatest,
            isVisible: item.isVisible !== false,
            changesText: changesAsText,
            changesList: Array.isArray(changesArr) ? changesArr : []
        });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormData({
            version: '',
            date: new Date().toISOString().split('T')[0],
            title: '',
            highlights: '',
            isLatest: false,
            isVisible: true,
            changesText: '',
            changesList: []
        });
        setIsEditing(true);
    };

    const addChangeItem = () => {
        setFormData(prev => ({
            ...prev,
            changesList: [...prev.changesList, { type: 'feat', description: '', hash: '' }]
        }));
    };

    const updateChangeItem = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.changesList];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, changesList: updated };
        });
    };

    const removeChangeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            changesList: prev.changesList.filter((_, idx) => idx !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let finalChanges = [];
        if (formData.changesList && formData.changesList.length > 0) {
            finalChanges = formData.changesList.filter(c => c.description && c.description.trim());
        } else if (formData.changesText && formData.changesText.trim()) {
            finalChanges = parseChangesFromText(formData.changesText);
        }

        const dataToSave = {
            version: formData.version.trim(),
            date: formData.date,
            title: formData.title.trim(),
            highlights: formData.highlights.trim(),
            isLatest: formData.isLatest,
            isVisible: formData.isVisible,
            changes: finalChanges,
            updatedAt: new Date()
        };

        const docId = currentItem ? currentItem.id : `v${formData.version.trim().replace(/\./g, '_')}`;

        try {
            if (formData.isLatest) {
                await Promise.all(items.map(i => {
                    if (i.id !== docId && i.isLatest) {
                        return updateDoc(doc(db, 'versionHistory', i.id), { isLatest: false });
                    }
                    return Promise.resolve();
                }));
            }

            await setDoc(doc(db, 'versionHistory', docId), {
                ...dataToSave,
                ...(currentItem ? {} : { createdAt: new Date() })
            }, { merge: true });

            setIsEditing(false);
            fetchItems();
        } catch (error) {
            console.error("Error saving version history item: ", error);
            alert("Error saving version entry");
        }
    };

    const filteredItems = items.filter(item => {
        const query = searchQuery.toLowerCase();
        const ver = String(item.version || '').toLowerCase();
        const title = String(item.title || '').toLowerCase();
        const highlights = String(item.highlights || '').toLowerCase();
        const changesText = (item.changes || []).map(c => typeof c === 'string' ? c : (c.description || '')).join(' ').toLowerCase();

        return ver.includes(query) || title.includes(query) || highlights.includes(query) || changesText.includes(query);
    });

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            {/* Standard Collection Header */}
            <div className="collection-header">
                <div className="collection-header-top">
                    <div className="collection-title-group">
                        <h2 className="collection-title">Version Release History</h2>
                    </div>
                    <div className="collection-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <label className="select-all-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#aaa' }}>
                            <input
                                type="checkbox"
                                checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                                onChange={handleSelectAll}
                                disabled={filteredItems.length === 0}
                                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                            />
                            Select All
                        </label>
                        {selectedItems.length > 0 && (
                            <button
                                onClick={confirmBulkDelete}
                                className="btn btn-danger"
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                                <FaTrash /> Delete ({selectedItems.length})
                            </button>
                        )}
                        <button
                            onClick={handleRefreshSync}
                            className="btn btn-outline"
                            disabled={isSyncing}
                            style={{ gap: '6px' }}
                            title="Refresh and sync latest versions with Git log history"
                        >
                            <FaSync style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
                            {isSyncing ? 'Syncing...' : 'Refresh & Sync'}
                        </button>
                        <button
                            onClick={() => setShowSeedConfirm(true)}
                            className="btn btn-outline"
                        >
                            + Load Defaults
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="btn btn-primary"
                        >
                            <FaPlus /> Add New
                        </button>
                    </div>
                </div>

                {/* Filter / Search Bar with View Mode Switcher */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search version history (e.g., v4.5.5, Moon, bug fixes)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', paddingLeft: '38px', paddingRight: '12px', height: '38px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                        />
                    </div>

                    {/* View Mode Toggle (Tile vs List) */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
                        <button
                            onClick={() => setViewMode('tile')}
                            className={`btn ${viewMode === 'tile' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '6px 12px', fontSize: '0.85rem', border: 'none', height: '32px' }}
                            title="Tile / Grid View"
                        >
                            <FaThLarge /> Tile View
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '6px 12px', fontSize: '0.85rem', border: 'none', height: '32px' }}
                            title="List / Table View"
                        >
                            <FaList /> List View
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading Version History...</div>
            ) : filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--admin-card-border)' }}>
                    <FaHistory style={{ fontSize: '3rem', color: 'rgba(255, 255, 255, 0.2)', marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>No Version History Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {searchQuery ? 'No releases match your search query.' : 'No version history exists in Firestore yet. Load defaults from Git history to populate.'}
                    </p>
                    {!searchQuery && (
                        <button onClick={handleSeedDefaults} className="btn btn-primary">
                            + Load Defaults from Git History
                        </button>
                    )}
                </div>
            ) : viewMode === 'tile' ? (
                /* Tile / Cards View */
                <div className="collection-grid">
                    {filteredItems.map(item => {
                        const changesCount = (item.changes || []).length;
                        const isExpanded = !!expandedChanges[item.id];
                        return (
                            <div key={item.id} className={`collection-item ${selectedItems.includes(item.id) ? 'selected' : ''}`} style={{ paddingLeft: '1.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => toggleSelection(item.id)}
                                    className="item-checkbox"
                                />
                                <div className="item-header" style={{ paddingLeft: '1.8rem' }}>
                                    <h3 className="item-title" style={{ color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span>v{item.version}</span>
                                        {item.isLatest && <span style={{ color: '#fbbf24', fontSize: '0.8rem', background: 'rgba(251, 191, 36, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>⭐ LATEST</span>}
                                    </h3>
                                    <div className="item-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button
                                            onClick={() => toggleVisibility(item)}
                                            className="icon-btn"
                                            style={{ color: item.isVisible !== false ? '#4ade80' : '#f87171' }}
                                            title={item.isVisible !== false ? 'Visible on public site' : 'Hidden from public site'}
                                        >
                                            {item.isVisible !== false ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                        <button
                                            onClick={() => toggleLatestStatus(item)}
                                            className="icon-btn"
                                            style={{ color: item.isLatest ? '#facc15' : '#666' }}
                                            title={item.isLatest ? 'Current Latest Release' : 'Mark as Latest Release'}
                                        >
                                            <FaStar />
                                        </button>
                                        <button onClick={() => handleEdit(item)} className="icon-btn edit" title="Edit release entry"><FaEdit /></button>
                                        <button onClick={() => confirmDelete(item.id)} className="icon-btn delete" title="Delete release entry"><FaTrash /></button>
                                    </div>
                                </div>

                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem', paddingLeft: '1.8rem' }}>
                                    {item.title || `Version ${item.version} Update`}
                                </div>

                                <p className="item-desc" style={{ paddingLeft: '1.8rem', marginBottom: '1rem' }}>
                                    {item.highlights || 'No highlights summary provided.'}
                                </p>

                                <div style={{ paddingLeft: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaCalendarAlt style={{ opacity: 0.7 }} /> {item.date || 'N/A'}
                                    </div>
                                    <button
                                        onClick={() => toggleExpandChanges(item.id)}
                                        className="btn btn-outline"
                                        style={{ padding: '3px 8px', fontSize: '0.8rem' }}
                                    >
                                        <FaList /> {changesCount} {changesCount === 1 ? 'change' : 'changes'}
                                    </button>
                                </div>

                                {/* Expanded Commit Changes View */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}
                                        >
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                                                Commit Change Log ({changesCount}):
                                            </div>
                                            {changesCount === 0 ? (
                                                <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>No change entries.</div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                                                    {(item.changes || []).map((change, cIdx) => {
                                                        const type = typeof change === 'string' ? 'feat' : (change.type || 'feat');
                                                        const desc = typeof change === 'string' ? change : (change.description || '');
                                                        const hash = typeof change === 'object' ? change.hash : null;

                                                        const badgeColors = {
                                                            feat: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' },
                                                            fix: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' },
                                                            refactor: { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' },
                                                            style: { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' },
                                                            chore: { bg: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' },
                                                            docs: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }
                                                        };
                                                        const bStyle = badgeColors[type] || badgeColors.feat;

                                                        return (
                                                            <div key={cIdx} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'flex-start', gap: '6px', background: 'rgba(0, 0, 0, 0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                                                                <span style={{ background: bStyle.bg, color: bStyle.color, padding: '1px 4px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                                                    {type}
                                                                </span>
                                                                <span style={{ flex: 1, color: '#ddd', lineHeight: '1.3' }}>{desc}</span>
                                                                {hash && <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#888' }}>{hash}</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Detailed List / Table View */
                <div style={{ overflowX: 'auto', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--admin-card-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--admin-card-border)', background: 'rgba(255, 255, 255, 0.04)' }}>
                                <th style={{ padding: '12px 16px', width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th style={{ padding: '12px 16px', width: '120px' }}>Version</th>
                                <th style={{ padding: '12px 16px', width: '120px' }}>Release Date</th>
                                <th style={{ padding: '12px 16px' }}>Title & Summary</th>
                                <th style={{ padding: '12px 16px', width: '110px' }}>Commits</th>
                                <th style={{ padding: '12px 16px', width: '110px' }}>Status</th>
                                <th style={{ padding: '12px 16px', width: '120px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => {
                                const changesCount = (item.changes || []).length;
                                const isExpanded = !!expandedChanges[item.id];
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr style={{ borderBottom: '1px solid var(--admin-card-border)', background: selectedItems.includes(item.id) ? 'rgba(var(--accent-rgb), 0.08)' : 'transparent' }}>
                                            <td style={{ padding: '16px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleSelection(item.id)}
                                                />
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--accent-color)' }}>
                                                        v{item.version}
                                                    </span>
                                                    {item.isLatest && (
                                                        <span style={{ color: '#fbbf24', fontSize: '0.7rem', background: 'rgba(251, 191, 36, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.3)', fontWeight: 600 }}>
                                                            ⭐ LATEST
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                <FaCalendarAlt style={{ marginRight: '6px', opacity: 0.7 }} />
                                                {item.date || 'N/A'}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '600', color: '#fff', marginBottom: '4px', fontSize: '0.95rem' }}>
                                                    {item.title || `Version ${item.version} Update`}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                    {item.highlights || 'No highlights summary provided.'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <button
                                                    onClick={() => toggleExpandChanges(item.id)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '3px 8px', fontSize: '0.8rem' }}
                                                >
                                                    <FaList /> {changesCount} {changesCount === 1 ? 'change' : 'changes'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => toggleVisibility(item)}
                                                        className="icon-btn"
                                                        style={{ color: item.isVisible !== false ? '#4ade80' : '#f87171' }}
                                                        title={item.isVisible !== false ? 'Visible' : 'Hidden'}
                                                    >
                                                        {item.isVisible !== false ? <FaEye /> : <FaEyeSlash />}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleLatestStatus(item)}
                                                        className="icon-btn"
                                                        style={{ color: item.isLatest ? '#facc15' : '#666' }}
                                                        title={item.isLatest ? 'Current Latest' : 'Set as Latest'}
                                                    >
                                                        <FaStar />
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleEdit(item)} className="icon-btn edit" title="Edit release entry"><FaEdit /></button>
                                                    <button onClick={() => confirmDelete(item.id)} className="icon-btn delete" title="Delete release entry"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expanded Changes Row */}
                                        {isExpanded && (
                                            <tr style={{ background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid var(--admin-card-border)' }}>
                                                <td colSpan="7" style={{ padding: '16px 24px' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                        Commit Change Log ({changesCount} items):
                                                    </div>
                                                    {changesCount === 0 ? (
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                            No individual commit changes listed.
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '8px' }}>
                                                            {(item.changes || []).map((change, cIdx) => {
                                                                const type = typeof change === 'string' ? 'feat' : (change.type || 'feat');
                                                                const desc = typeof change === 'string' ? change : (change.description || '');
                                                                const hash = typeof change === 'object' ? change.hash : null;

                                                                const typeColors = {
                                                                    feat: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' },
                                                                    fix: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' },
                                                                    refactor: { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' },
                                                                    style: { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' },
                                                                    chore: { bg: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' },
                                                                    docs: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }
                                                                };
                                                                const style = typeColors[type] || typeColors.feat;

                                                                return (
                                                                    <div key={cIdx} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                                        <span style={{ background: style.bg, color: style.color, padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                                                            {type}
                                                                        </span>
                                                                        <div style={{ flex: 1, color: '#e2e8f0', lineHeight: '1.4' }}>
                                                                            {desc}
                                                                        </div>
                                                                        {hash && (
                                                                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 4px', borderRadius: '4px' }}>
                                                                                {hash}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create & Edit Modal matching standard modal design */}
            <AnimatePresence>
                {isEditing && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ maxWidth: '650px', width: '100%' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                                    {currentItem ? `Edit Version v${currentItem.version}` : 'Add New Version Release'}
                                </h3>
                                <button onClick={() => setIsEditing(false)} className="icon-btn" style={{ color: '#aaa' }}>
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Version Number *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 4.5.6"
                                            value={formData.version}
                                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--admin-card-border)', borderRadius: '6px', color: '#fff' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Release Date *</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--admin-card-border)', borderRadius: '6px', color: '#fff' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Release Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Header Navigation & Version History UI Revamp"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--admin-card-border)', borderRadius: '6px', color: '#fff' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Release Highlights / Summary</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Short summary highlighting the key changes in this version..."
                                        value={formData.highlights}
                                        onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--admin-card-border)', borderRadius: '6px', color: '#fff', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--admin-card-border)' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isLatest}
                                            onChange={(e) => setFormData({ ...formData, isLatest: e.target.checked })}
                                        />
                                        <span>Mark as Latest Release</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isVisible}
                                            onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                        />
                                        <span>Visible on Public Page</span>
                                    </label>
                                </div>

                                {/* Change Log Itemized Editor */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Commit Changes & Updates ({formData.changesList.length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addChangeItem}
                                            className="btn btn-outline"
                                            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                        >
                                            + Add Item
                                        </button>
                                    </div>

                                    {formData.changesList.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                                            {formData.changesList.map((item, index) => (
                                                <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                    <select
                                                        value={item.type || 'feat'}
                                                        onChange={(e) => updateChangeItem(index, 'type', e.target.value)}
                                                        style={{ padding: '4px 6px', background: '#1e1f2b', border: '1px solid var(--admin-card-border)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                                                    >
                                                        <option value="feat">feat</option>
                                                        <option value="fix">fix</option>
                                                        <option value="refactor">refactor</option>
                                                        <option value="style">style</option>
                                                        <option value="chore">chore</option>
                                                        <option value="docs">docs</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="Description of change..."
                                                        value={item.description || ''}
                                                        onChange={(e) => updateChangeItem(index, 'description', e.target.value)}
                                                        style={{ flex: 1, padding: '4px 8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--admin-card-border)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="hash"
                                                        value={item.hash || ''}
                                                        onChange={(e) => updateChangeItem(index, 'hash', e.target.value)}
                                                        style={{ width: '70px', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--admin-card-border)', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChangeItem(index)}
                                                        className="icon-btn delete"
                                                        style={{ padding: '2px' }}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            <textarea
                                                rows="4"
                                                placeholder={`Multi-line changes format:\nfeat: implement moon component quote generator\nfix: resolved star parallax movement issue`}
                                                value={formData.changesText}
                                                onChange={(e) => setFormData({ ...formData, changesText: e.target.value })}
                                                style={{ width: '100%', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--admin-card-border)', borderRadius: '6px', color: '#fff', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="btn btn-outline"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Seed Confirm Modal */}
            <AnimatePresence>
                {showSeedConfirm && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            style={{ maxWidth: '420px', textAlign: 'center' }}
                        >
                            <h3 style={{ marginBottom: '1rem' }}>Load Defaults from Git History?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                This will populate all 14+ historical Day One release entries into Cloud Firestore.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button onClick={() => setShowSeedConfirm(false)} className="btn btn-outline">
                                    Cancel
                                </button>
                                <button onClick={handleSeedDefaults} className="btn btn-primary">
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {itemsToDelete.length > 0 && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            style={{ maxWidth: '400px', textAlign: 'center' }}
                        >
                            <h3 style={{ marginBottom: '1rem' }}>Confirm Delete</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Are you sure you want to delete {itemsToDelete.length} version entry(ies)?
                                <br />This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button onClick={() => setItemsToDelete([])} className="btn btn-outline">
                                    Cancel
                                </button>
                                <button onClick={executeDelete} className="btn btn-danger">
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VersionHistoryManager;
