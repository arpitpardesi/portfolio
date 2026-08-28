import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaBookmark, FaEye, FaEyeSlash, FaSearch, FaBookOpen, FaSave, FaMagic } from 'react-icons/fa';
import MultiMediaUpload from './MultiMediaUpload';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './Admin.css';

const defaultSampleBlogs = [
    {
        id: 'architecting-scalable-web-apps',
        title: 'Architecting Scalable Web Applications with React & Modern Frontend Patterns',
        description: 'A deep dive into state management, clean architecture, performance optimization, and modular code structures that scale effortlessly.',
        fullDesc: `### Introduction

Building modern web applications requires balancing performance, developer experience, and scalability. In this article, we explore architectural patterns that have proven effective across production applications.

#### Key Architectural Pillars

1. **State Management Decoupling**: Keeping UI components presentation-focused while moving business logic to hooks or state containers.
2. **Code Splitting & Lazy Loading**: Dynamic imports reduce initial bundle size and speed up Largest Contentful Paint (LCP).
3. **Design Token Systems**: Utilizing CSS custom properties and standardized color tokens for maintainable theme switching.

\`\`\`javascript
// Example: Custom Reactive Hook Pattern
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}
\`\`\`

#### Conclusion

By enforcing modular boundaries and leveraging React 18+ capabilities, we build applications that remain fast, responsive, and robust as they scale.`,
        tags: ['Tech', 'React', 'Architecture', 'Web Dev'],
        date: '2026-08-15',
        readTime: '5 min read',
        color: '#6366f1',
        isPinned: true,
        isVisible: true,
        author: 'Arpit Pardesi',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'building-autonomous-ai-agents',
        title: 'Building Autonomous AI Agents: From Prompting to Tool Orchestration',
        description: 'Exploring LLM tool calling, multi-agent coordination, stateful execution loops, and robust error recovery mechanisms.',
        fullDesc: `### The Shift to Autonomous AI Agents

Artificial Intelligence is shifting rapidly from single-turn chat interfaces to goal-directed autonomous agents capable of using tools and modifying system state.

#### Core Components of Agentic Systems

- **Task Planning & Decomposition**: Breaking complex goals into sub-tasks.
- **Tool Access (MCP & APIs)**: Giving agents programmatic access to web search, filesystems, and databases.
- **Memory Systems**: Short-term context management paired with vector databases for long-term retrieval.

\`\`\`python
# Agentic Tool Invocation Loop Pattern
async def run_agent_loop(agent, initial_prompt):
    messages = [{"role": "user", "content": initial_prompt}]
    while True:
        response = await agent.generate(messages)
        if not response.tool_calls:
            return response.text
        
        for tool_call in response.tool_calls:
            result = await execute_tool(tool_call)
            messages.append({"role": "tool", "content": result})
\`\`\`

#### Looking Ahead

As tool execution becomes safer and context windows grow, agentic software development will transform how developers build tools.`,
        tags: ['AI', 'Tech', 'Python', 'Agents'],
        date: '2026-08-01',
        readTime: '6 min read',
        color: '#8b5cf6',
        isPinned: false,
        isVisible: true,
        author: 'Arpit Pardesi',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'hardware-to-cloud-esp32-iot',
        title: 'Hardware to Cloud: Building Smart Home Automation with ESP32 & MQTT',
        description: 'Step-by-step guide to custom IoT sensor nodes, edge processing, Home Assistant integration, and real-time telemetry streaming.',
        fullDesc: `### Bringing Hardware to Life

Combining low-cost microcontrollers like the ESP32 with open protocols like MQTT opens up endless possibilities for custom home automation and sensor networks.

#### System Architecture

1. **Edge Node (ESP32)**: Captures temperature, humidity, and motion events using sensor interrupts.
2. **Message Broker (Mosquitto MQTT)**: Low-latency pub/sub messaging framework over local Wi-Fi.
3. **Automation Core (Home Assistant)**: Collects metrics and triggers real-time alerts.

#### Summary

Edge computing with microcontrollers allows building privacy-first smart home systems that don't rely on third-party cloud vendor APIs.`,
        tags: ['IoT', 'Tech', 'Embedded', 'Hardware'],
        date: '2026-07-20',
        readTime: '4 min read',
        color: '#0ea5e9',
        isPinned: false,
        isVisible: true,
        author: 'Arpit Pardesi',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
    }
];

const BlogManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // All, Published, Drafts, Pinned
    const [isEditing, setIsEditing] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);
    const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
    const [selectedBlogs, setSelectedBlogs] = useState([]);
    const [itemsToDelete, setItemsToDelete] = useState([]);
    const [showSeedConfirm, setShowSeedConfirm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        fullDesc: '',
        tags: '',
        author: 'Arpit Pardesi',
        date: new Date().toISOString().split('T')[0],
        readTime: '5 min read',
        color: '#6366f1',
        image: '',
        isPinned: false,
        isVisible: true,
        mediaItems: []
    });

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'blogs'));
            const list = querySnapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            setBlogs(list);
        } catch (error) {
            console.error("Error fetching blogs: ", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    // Auto calculate read time when fullDesc updates
    const calculateReadTime = (text) => {
        const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} min read`;
    };

    // Auto generate slug from title
    const generateSlug = (text) => {
        return (text || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    };

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: val,
            slug: currentBlog ? prev.slug : generateSlug(val)
        }));
    };

    const handleFullDescChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            fullDesc: val,
            readTime: calculateReadTime(val)
        }));
    };

    const handleAddNew = () => {
        setCurrentBlog(null);
        setFormData({
            title: '',
            slug: '',
            description: '',
            fullDesc: '',
            tags: 'Tech, Web Dev',
            author: 'Arpit Pardesi',
            date: new Date().toISOString().split('T')[0],
            readTime: '3 min read',
            color: '#6366f1',
            image: '',
            isPinned: false,
            isVisible: true,
            mediaItems: []
        });
        setActiveTab('editor');
        setIsEditing(true);
    };

    const handleEdit = (blog) => {
        setCurrentBlog(blog);
        setFormData({
            title: blog.title || '',
            slug: blog.id || generateSlug(blog.title),
            description: blog.description || blog.desc || '',
            fullDesc: blog.fullDesc || blog.content || '',
            tags: blog.tags ? (Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags) : '',
            author: blog.author || 'Arpit Pardesi',
            date: blog.date || new Date().toISOString().split('T')[0],
            readTime: blog.readTime || calculateReadTime(blog.fullDesc),
            color: blog.color || '#6366f1',
            image: blog.image || '',
            isPinned: !!blog.isPinned,
            isVisible: blog.isVisible !== false,
            mediaItems: blog.mediaItems || []
        });
        setActiveTab('editor');
        setIsEditing(true);
    };

    const handleQuickTogglePin = async (blog, e) => {
        e.stopPropagation();
        try {
            const docRef = doc(db, 'blogs', blog.id);
            await updateDoc(docRef, { isPinned: !blog.isPinned, updatedAt: new Date() });
            fetchBlogs();
        } catch (err) {
            console.error("Error toggling pin:", err);
        }
    };

    const handleQuickToggleVisibility = async (blog, e) => {
        e.stopPropagation();
        try {
            const docRef = doc(db, 'blogs', blog.id);
            await updateDoc(docRef, { isVisible: !blog.isVisible, updatedAt: new Date() });
            fetchBlogs();
        } catch (err) {
            console.error("Error toggling visibility:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Please enter an article title.');
            return;
        }

        const blogId = (formData.slug || generateSlug(formData.title)).trim();
        if (!blogId) {
            alert('Invalid article slug / ID');
            return;
        }

        const tagsArray = formData.tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);

        const dataToSave = {
            title: formData.title,
            description: formData.description,
            fullDesc: formData.fullDesc,
            tags: tagsArray,
            author: formData.author,
            date: formData.date,
            readTime: formData.readTime,
            color: formData.color,
            image: formData.image || (formData.mediaItems && formData.mediaItems[0]?.url) || '',
            isPinned: formData.isPinned,
            isVisible: formData.isVisible,
            mediaItems: formData.mediaItems || [],
            updatedAt: new Date()
        };

        try {
            const docRef = doc(db, 'blogs', blogId);
            await setDoc(docRef, {
                ...dataToSave,
                createdAt: currentBlog?.createdAt || new Date()
            }, { merge: true });

            setIsEditing(false);
            fetchBlogs();
        } catch (error) {
            console.error("Error saving blog article: ", error);
            alert("Error saving blog article");
        }
    };

    const handleSeedDefaults = async () => {
        try {
            for (const item of defaultSampleBlogs) {
                await setDoc(doc(db, 'blogs', item.id), {
                    ...item,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            alert("Default sample articles created successfully! 🎉");
            fetchBlogs();
            setShowSeedConfirm(false);
        } catch (err) {
            console.error(err);
            alert("Error seeding default blogs.");
        }
    };

    const toggleSelection = (id) => {
        setSelectedBlogs(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (blogs.length === 0) return;
        if (selectedBlogs.length === blogs.length) {
            setSelectedBlogs([]);
        } else {
            setSelectedBlogs(blogs.map(b => b.id));
        }
    };

    const executeDelete = async () => {
        if (itemsToDelete.length === 0) return;
        try {
            await Promise.all(itemsToDelete.map(id => deleteDoc(doc(db, 'blogs', id))));
            fetchBlogs();
            setItemsToDelete([]);
            setSelectedBlogs(prev => prev.filter(id => !itemsToDelete.includes(id)));
        } catch (error) {
            console.error("Error deleting document(s): ", error);
            alert("Error deleting blog item(s)");
        }
    };

    // Filtered list calculation
    const filteredBlogs = useMemo(() => {
        return blogs.filter(blog => {
            const matchesSearch =
                (blog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (blog.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (Array.isArray(blog.tags) && blog.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

            let matchesStatus = true;
            if (statusFilter === 'Published') matchesStatus = blog.isVisible !== false;
            else if (statusFilter === 'Drafts') matchesStatus = blog.isVisible === false;
            else if (statusFilter === 'Pinned') matchesStatus = !!blog.isPinned;

            return matchesSearch && matchesStatus;
        });
    }, [blogs, searchQuery, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const total = blogs.length;
        const published = blogs.filter(b => b.isVisible !== false).length;
        const drafts = blogs.filter(b => b.isVisible === false).length;
        const pinned = blogs.filter(b => b.isPinned).length;
        return { total, published, drafts, pinned };
    }, [blogs]);

    const addTagPill = (tagText) => {
        const existing = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
        if (!existing.includes(tagText)) {
            const updated = [...existing, tagText].filter(Boolean).join(', ');
            setFormData(prev => ({ ...prev, tags: updated }));
        }
    };

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            {/* Top Title & Header Actions */}
            <div className="collection-header">
                <div className="collection-header-top" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 className="collection-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaBookOpen style={{ color: 'var(--accent-color)' }} /> Blog Article Manager
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                                Publish, edit, pin, and manage technical articles on your portfolio blog.
                            </p>
                        </div>

                        <div className="collection-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            {blogs.length === 0 && (
                                <button
                                    onClick={() => setShowSeedConfirm(true)}
                                    className="btn btn-outline"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <FaMagic /> Load Sample Posts
                                </button>
                            )}

                            <button
                                onClick={handleAddNew}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <FaPlus /> Add New Article
                            </button>
                        </div>
                    </div>

                    {/* Stats Metric Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '1rem',
                        width: '100%',
                        marginTop: '0.5rem'
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Articles</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>{stats.total}</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px 16px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase' }}>Published</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#10b981', marginTop: '4px' }}>{stats.published}</div>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px 16px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase' }}>Drafts</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f59e0b', marginTop: '4px' }}>{stats.drafts}</div>
                        </div>
                        <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '12px', padding: '12px 16px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase' }}>Pinned / Featured</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fbbf24', marginTop: '4px' }}>{stats.pinned}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
            }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Filter articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                    />
                </div>

                {/* Status Filter Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['All', 'Published', 'Drafts', 'Pinned'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: statusFilter === st ? '1px solid var(--accent-color)' : '1px solid transparent',
                                background: statusFilter === st ? 'rgba(var(--accent-rgb), 0.2)' : 'rgba(255,255,255,0.05)',
                                color: statusFilter === st ? 'var(--accent-color)' : 'var(--text-secondary)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: statusFilter === st ? '600' : '400'
                            }}
                        >
                            {st}
                        </button>
                    ))}
                </div>

                {/* Bulk Select Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: '#aaa' }}>
                        <input
                            type="checkbox"
                            checked={blogs.length > 0 && selectedBlogs.length === blogs.length}
                            onChange={handleSelectAll}
                            disabled={blogs.length === 0}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                        />
                        Select All
                    </label>
                    {selectedBlogs.length > 0 && (
                        <button
                            onClick={() => setItemsToDelete([...selectedBlogs])}
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                            <FaTrash /> Delete ({selectedBlogs.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Articles List Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading blog entries...
                </div>
            ) : filteredBlogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <FaBookOpen size={30} style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No articles match the current filter.</p>
                </div>
            ) : (
                <div className="collection-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {filteredBlogs.map(blog => (
                        <div key={blog.id} className={`collection-item ${selectedBlogs.includes(blog.id) ? 'selected' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
                            <input
                                type="checkbox"
                                checked={selectedBlogs.includes(blog.id)}
                                onChange={() => toggleSelection(blog.id)}
                                className="item-checkbox"
                            />
                            
                            {/* Card Top Header */}
                            <div className="item-header" style={{ paddingLeft: '1.8rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                        {blog.isPinned && (
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
                                                ⭐ Pinned
                                            </span>
                                        )}
                                        {blog.isVisible !== false ? (
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                                                Published
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="item-title" style={{ color: blog.color || 'var(--text-primary)', fontSize: '1.1rem' }}>
                                        {blog.title}
                                    </h3>
                                </div>
                                <div className="item-actions">
                                    <button onClick={(e) => handleQuickTogglePin(blog, e)} className="icon-btn" title={blog.isPinned ? 'Unpin' : 'Pin to featured'}>
                                        <FaBookmark style={{ color: blog.isPinned ? '#fbbf24' : '#666' }} />
                                    </button>
                                    <button onClick={(e) => handleQuickToggleVisibility(blog, e)} className="icon-btn" title={blog.isVisible !== false ? 'Hide (Set Draft)' : 'Publish'}>
                                        {blog.isVisible !== false ? <FaEye style={{ color: '#10b981' }} /> : <FaEyeSlash style={{ color: '#f59e0b' }} />}
                                    </button>
                                    <button onClick={() => handleEdit(blog)} className="icon-btn edit"><FaEdit /></button>
                                    <button onClick={() => setItemsToDelete([blog.id])} className="icon-btn delete"><FaTrash /></button>
                                </div>
                            </div>

                            <p className="item-desc" style={{ fontSize: '0.85rem', flex: 1 }}>{blog.description}</p>

                            {/* Tags list */}
                            {blog.tags && (
                                <div style={{ paddingLeft: '1.8rem', display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                                    {(Array.isArray(blog.tags) ? blog.tags : blog.tags.split(',')).map(t => (
                                        <span key={t} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#aaa' }}>
                                            #{t.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Image Thumbnail */}
                            {blog.image && (
                                <div style={{ height: '110px', overflow: 'hidden', borderRadius: '8px', marginTop: 'auto' }}>
                                    <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Seed Confirmation Modal */}
            <AnimatePresence>
                {showSeedConfirm && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Load Sample Articles?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                This will add sample technical articles (React, AI, and IoT) to your Firestore database.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button onClick={() => setShowSeedConfirm(false)} className="btn btn-outline">Cancel</button>
                                <button onClick={handleSeedDefaults} className="btn btn-primary">Yes, Load Sample Articles</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {itemsToDelete.length > 0 && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Confirm Delete</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Delete {itemsToDelete.length} article{itemsToDelete.length > 1 ? 's' : ''}? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button onClick={() => setItemsToDelete([])} className="btn btn-outline">Cancel</button>
                                <button onClick={executeDelete} className="btn btn-danger-solid">Delete Article(s)</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add / Edit Article Dialog Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content"
                            style={{ maxWidth: '840px', width: '90%' }}
                        >
                            <button onClick={() => setIsEditing(false)} className="close-modal-btn">
                                <FaTimes />
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                                <h3 style={{ fontSize: '1.5rem' }}>{currentBlog ? 'Edit Blog Article' : 'Create New Blog Article'}</h3>

                                {/* Editor / Live Preview Toggle */}
                                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('editor')}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: activeTab === 'editor' ? 'var(--accent-color)' : 'transparent',
                                            color: activeTab === 'editor' ? '#fff' : 'var(--text-secondary)',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Markdown Editor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('preview')}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: activeTab === 'preview' ? 'var(--accent-color)' : 'transparent',
                                            color: activeTab === 'preview' ? '#fff' : 'var(--text-secondary)',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Live Article Preview
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {activeTab === 'editor' ? (
                                    <>
                                        {/* Status Toggles Row */}
                                        <div style={{ display: 'flex', gap: '2rem', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isVisible}
                                                    onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                                                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                                />
                                                <span style={{ color: 'var(--text-primary)' }}>👁️ Published (Public on portfolio)</span>
                                            </label>

                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isPinned}
                                                    onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                                                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#fbbf24' }}
                                                />
                                                <span style={{ color: 'var(--text-primary)' }}>⭐ Pin as Featured Hero Article</span>
                                            </label>
                                        </div>

                                        {/* Title & Slug Row */}
                                        <div className="form-row-responsive">
                                            <div className="form-group" style={{ flex: 2 }}>
                                                <label className="form-label">Article Title</label>
                                                <input
                                                    placeholder="e.g. Building Scalable Web Apps"
                                                    value={formData.title}
                                                    onChange={handleTitleChange}
                                                    className="form-input"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label className="form-label">URL Slug / ID</label>
                                                <input
                                                    placeholder="building-scalable-web-apps"
                                                    value={formData.slug}
                                                    onChange={e => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                                    className="form-input"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Short Excerpt / Description */}
                                        <div className="form-group">
                                            <label className="form-label">Short Description / Excerpt</label>
                                            <textarea
                                                placeholder="Brief summary displayed on article cards and search results..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="form-textarea"
                                                style={{ minHeight: '70px' }}
                                                required
                                            />
                                        </div>

                                        {/* Full Markdown Content Body */}
                                        <div className="form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <label className="form-label" style={{ margin: 0 }}>Full Article Content (Markdown)</label>
                                                <span style={{ fontSize: '0.75rem', color: '#aaa', fontFamily: 'var(--font-mono)' }}>{formData.readTime}</span>
                                            </div>
                                            <textarea
                                                placeholder="# Write your article using Markdown...&#10;&#10;### Introduction&#10;&#10;Use markdown headers, code blocks (```js), lists, and quotes."
                                                value={formData.fullDesc}
                                                onChange={handleFullDescChange}
                                                className="form-textarea"
                                                style={{ minHeight: '220px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.9rem', lineHeight: '1.5' }}
                                            />
                                        </div>

                                        {/* Media Upload & Cover Image */}
                                        <MultiMediaUpload
                                            currentMediaItems={formData.mediaItems}
                                            onUpload={(mediaItems) => {
                                                const primaryImg = mediaItems && mediaItems[0]?.url ? mediaItems[0].url : formData.image;
                                                setFormData({ ...formData, mediaItems, image: primaryImg });
                                            }}
                                        />

                                        <div className="form-group">
                                            <label className="form-label">Cover Image URL (Direct Link)</label>
                                            <input
                                                placeholder="https://images.unsplash.com/..."
                                                value={formData.image}
                                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                className="form-input"
                                            />
                                        </div>

                                        {/* Tags & Quick Tag Pills */}
                                        <div className="form-group">
                                            <label className="form-label">Tags (comma separated)</label>
                                            <input
                                                placeholder="Tech, React, Architecture, AI"
                                                value={formData.tags}
                                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                                className="form-input"
                                            />
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#888', alignSelf: 'center' }}>Quick Suggestions:</span>
                                                {['Tech', 'React', 'AI', 'Web Dev', 'Python', 'IoT', 'Hardware', 'Design', 'Life'].map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => addTagPill(t)}
                                                        style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        + {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Author, Date & Accent Color Row */}
                                        <div className="form-row-responsive">
                                            <div className="form-group">
                                                <label className="form-label">Author</label>
                                                <input
                                                    value={formData.author}
                                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Published Date</label>
                                                <input
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="form-group" style={{ maxWidth: '80px' }}>
                                                <label className="form-label">Color</label>
                                                <input
                                                    type="color"
                                                    value={formData.color}
                                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                                    className="color-input"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Live Preview Mode */
                                    <div style={{ background: '#0a0a0d', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', maxHeight: '600px', overflowY: 'auto' }}>
                                        <div style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                            ARTICLE PREVIEW
                                        </div>
                                        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.8rem' }}>{formData.title || 'Untitled Article'}</h1>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
                                            <span>By {formData.author}</span>
                                            <span>•</span>
                                            <span>{formData.date}</span>
                                            <span>•</span>
                                            <span>{formData.readTime}</span>
                                        </div>

                                        {formData.image && (
                                            <img src={formData.image} alt={formData.title} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }} />
                                        )}

                                        <div className="markdown-content" style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.7' }}>
                                            <ReactMarkdown>{formData.fullDesc || formData.description || '*No article content entered yet...*'}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '14px', width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <FaSave /> Save Article
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlogManager;
