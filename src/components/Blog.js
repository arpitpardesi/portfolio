import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaClock, FaTag, FaBookOpen, FaBookmark, FaArrowRight, FaTimes } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';

const defaultBlogPosts = [
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
        author: 'Arpit Pardesi',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'crafting-portfolio-dark-mode-glassmorphism',
        title: 'Crafting a Modern Portfolio: Glassmorphism, Micro-Animations & Dark Mode Aesthetics',
        description: 'Reflections on designing intuitive developer portfolios with dynamic theme systems, Matter.js interactive physics, and high visual polish.',
        fullDesc: `### Design Philosophy & Aesthetic Details

Your portfolio is often the first impression a potential user or team has of your work. Combining functional utility with visual delight creates an engaging experience.

#### Principles Applied

- **Glassmorphism**: Subtle translucent backgrounds (\`backdrop-filter: blur(10px)\`) paired with crisp borders.
- **Dynamic Accent Colors**: Allowing site-wide accent theme shifting using CSS custom variables.
- **Interactive Micro-Animations**: Spring physics with Framer Motion for responsive hover states.`,
        tags: ['Web Dev', 'Design', 'Life', 'React'],
        date: '2026-07-05',
        readTime: '3 min read',
        color: '#f43f5e',
        isPinned: false,
        author: 'Arpit Pardesi',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    }
];

const Blog = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState(defaultBlogPosts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'blogs'));
                if (!querySnapshot.empty) {
                    const fetchedPosts = querySnapshot.docs
                        .map(doc => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                title: data.title,
                                description: data.description || data.desc || '',
                                fullDesc: data.fullDesc || data.content || '',
                                tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : ['General']),
                                date: data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '2026-08-28'),
                                readTime: data.readTime || `${Math.max(1, Math.ceil((data.fullDesc || data.description || '').split(' ').length / 200))} min read`,
                                color: data.color || '#6366f1',
                                isPinned: !!data.isPinned,
                                author: data.author || 'Arpit Pardesi',
                                image: data.image || (data.mediaItems && data.mediaItems[0]?.url) || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
                                isVisible: data.isVisible !== false
                            };
                        })
                        .filter(p => p.isVisible);

                    if (fetchedPosts.length > 0) {
                        const dbIds = new Set(fetchedPosts.map(p => p.id));
                        const filteredDefaults = defaultBlogPosts.filter(p => !dbIds.has(p.id));
                        setPosts([...fetchedPosts, ...filteredDefaults]);
                    }
                }
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Unique tags calculation
    const allTags = useMemo(() => {
        const tagSet = new Set(['All']);
        posts.forEach(post => {
            if (Array.isArray(post.tags)) {
                post.tags.forEach(t => tagSet.add(t));
            }
        });
        return Array.from(tagSet);
    }, [posts]);

    // Filtered posts
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesSearch =
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.tags && post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

            const matchesTag = selectedTag === 'All' || (post.tags && post.tags.includes(selectedTag));

            return matchesSearch && matchesTag;
        });
    }, [posts, searchQuery, selectedTag]);

    // Pinned article
    const featuredPost = useMemo(() => {
        return filteredPosts.find(p => p.isPinned) || (selectedTag === 'All' && !searchQuery ? filteredPosts[0] : null);
    }, [filteredPosts, selectedTag, searchQuery]);

    // Grid articles (excluding featured if featured is showing)
    const gridPosts = useMemo(() => {
        if (featuredPost) {
            return filteredPosts.filter(p => p.id !== featuredPost.id);
        }
        return filteredPosts;
    }, [filteredPosts, featuredPost]);

    return (
        <section className="blog-section" style={{
            padding: 'calc(120px + env(safe-area-inset-top)) 20px 80px',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 1
        }}>
            <Helmet>
                <title>Blog & Insights | Arpit Pardesi</title>
                <meta name="description" content="Technical articles, software engineering insights, AI agent workflows, and hardware projects by Arpit Pardesi." />
            </Helmet>

            {/* Top Navigation Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'fixed', top: 'calc(100px + env(safe-area-inset-top))', left: '40px', zIndex: 100 }}
                className="back-nav"
            >
                <button onClick={() => navigate(-1)} className="back-link">
                    <FaArrowLeft /> Back
                </button>
            </motion.div>

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '3.5rem' }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        borderRadius: '30px',
                        background: 'rgba(var(--accent-rgb), 0.1)',
                        border: '1px solid rgba(var(--accent-rgb), 0.3)',
                        color: 'var(--accent-color)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        <FaBookOpen size={13} /> Writing & Insights
                    </div>

                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        <span style={{ color: 'var(--text-primary)' }}>My </span>
                        <span style={{
                            color: 'var(--accent-color)',
                            textShadow: '0 0 35px rgba(var(--accent-rgb), 0.5)'
                        }}>
                            Blog
                        </span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.15rem', lineHeight: '1.6' }}>
                        Thoughtful articles on software architecture, AI agent systems, web engineering, and hardware automation.
                    </p>
                </motion.div>

                {/* Search Bar & Tag Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{ marginBottom: '3rem' }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        alignItems: 'center'
                    }}>
                        {/* Search Input */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '540px'
                        }}>
                            <FaSearch style={{
                                position: 'absolute',
                                left: '18px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)',
                                fontSize: '1rem'
                            }} />
                            <input
                                type="text"
                                placeholder="Search articles by title, tag, or topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 45px 14px 48px',
                                    borderRadius: '50px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--accent-color)';
                                    e.target.style.boxShadow = '0 0 20px rgba(var(--accent-rgb), 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-color)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    aria-label="Clear Search"
                                >
                                    <FaTimes size={14} />
                                </button>
                            )}
                        </div>

                        {/* Tag Pills */}
                        <div style={{
                            display: 'flex',
                            gap: '0.6rem',
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        }}>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '30px',
                                        border: selectedTag === tag ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                                        background: selectedTag === tag ? 'rgba(var(--accent-rgb), 0.18)' : 'rgba(255, 255, 255, 0.03)',
                                        color: selectedTag === tag ? 'var(--accent-color)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        fontWeight: selectedTag === tag ? '600' : '400',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        backdropFilter: 'blur(5px)'
                                    }}
                                >
                                    {tag !== 'All' && <FaTag size={10} style={{ marginRight: '6px' }} />}
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        Loading blog experience...
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <FaBookOpen size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            No articles found
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Try resetting your search query or choosing a different topic tag.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedTag('All'); }}
                            style={{
                                marginTop: '1.5rem',
                                padding: '10px 22px',
                                borderRadius: '30px',
                                background: 'rgba(var(--accent-rgb), 0.2)',
                                border: '1px solid var(--accent-color)',
                                color: 'var(--accent-color)',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Reset Filters
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Featured Pinned Post Hero Card */}
                        {featuredPost && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7 }}
                                style={{ marginBottom: '3.5rem' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '1rem',
                                    color: '#fbbf24',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    <FaBookmark /> Featured Article
                                </div>

                                <Link to={`/blog/${featuredPost.id}`} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        whileHover={{ y: -6, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(var(--accent-rgb), 0.3)',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {/* Image */}
                                        <div style={{
                                            minHeight: '260px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            background: featuredPost.color ? `linear-gradient(135deg, ${featuredPost.color}30, #0a0a0d)` : '#111'
                                        }}>
                                            <img
                                                src={featuredPost.image}
                                                alt={featuredPost.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.5s ease'
                                                }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                background: 'linear-gradient(to top, rgba(10,10,12,0.8), transparent 60%)'
                                            }} />
                                        </div>

                                        {/* Content */}
                                        <div style={{
                                            padding: '2.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                {featuredPost.tags.map(t => (
                                                    <span key={t} style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        background: 'rgba(var(--accent-rgb), 0.15)',
                                                        color: 'var(--accent-color)',
                                                        border: '1px solid rgba(var(--accent-rgb), 0.3)'
                                                    }}>
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            <h2 style={{
                                                fontSize: '1.8rem',
                                                fontWeight: '700',
                                                color: 'var(--text-primary)',
                                                marginBottom: '1rem',
                                                lineHeight: '1.3'
                                            }}>
                                                {featuredPost.title}
                                            </h2>

                                            <p style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '1rem',
                                                lineHeight: '1.6',
                                                marginBottom: '1.8rem'
                                            }}>
                                                {featuredPost.description}
                                            </p>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                paddingTop: '1.2rem',
                                                borderTop: '1px solid var(--border-color)',
                                                marginTop: 'auto'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    <span>{featuredPost.date}</span>
                                                    <span>•</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FaClock size={12} /> {featuredPost.readTime}
                                                    </span>
                                                </div>

                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: 'var(--accent-color)',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}>
                                                    Read Article <FaArrowRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        )}

                        {/* Article Grid */}
                        <div className="blog-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '2rem'
                        }}>
                            <AnimatePresence mode="popLayout">
                                {gridPosts.map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
                                            <motion.div
                                                whileHover={{ y: -8, boxShadow: '0 20px 35px -10px rgba(0,0,0,0.5)' }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                    height: '100%',
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '20px',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    backdropFilter: 'blur(10px)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.borderColor = post.color || 'var(--accent-color)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                                }}
                                            >
                                                {/* Cover Image */}
                                                <div style={{
                                                    height: '190px',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    background: post.color ? `linear-gradient(135deg, ${post.color}25, #0a0a0d)` : '#111'
                                                }}>
                                                    {post.image ? (
                                                        <img
                                                            src={post.image}
                                                            alt={post.title}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: post.color || 'var(--accent-color)',
                                                            fontSize: '2.5rem'
                                                        }}>
                                                            <FaBookOpen />
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, right: 0, bottom: 0,
                                                        background: 'linear-gradient(to top, rgba(10,10,12,0.9), transparent 60%)'
                                                    }} />
                                                </div>

                                                {/* Article Content */}
                                                <div style={{
                                                    padding: '1.8rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    flex: 1
                                                }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                                                        {post.tags.slice(0, 3).map(t => (
                                                            <span key={t} style={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: '600',
                                                                padding: '3px 8px',
                                                                borderRadius: '12px',
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                                color: 'var(--text-secondary)',
                                                                border: '1px solid rgba(255, 255, 255, 0.08)'
                                                            }}>
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <h3 style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: '700',
                                                        color: 'var(--text-primary)',
                                                        marginBottom: '0.7rem',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {post.title}
                                                    </h3>

                                                    <p style={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '0.9rem',
                                                        lineHeight: '1.5',
                                                        marginBottom: '1.5rem',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {post.description}
                                                    </p>

                                                    <div style={{
                                                        marginTop: 'auto',
                                                        paddingTop: '1rem',
                                                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        fontSize: '0.8rem',
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        <span>{post.date}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaClock size={11} /> {post.readTime}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .blog-section {
                            padding: calc(100px + env(safe-area-inset-top)) 16px 60px !important;
                        }
                        .blog-grid {
                            grid-template-columns: 1fr !important;
                        }
                        .back-nav {
                            position: static !important;
                            margin-bottom: 2rem;
                            display: inline-block;
                            align-self: flex-start;
                        }
                    }
                    .back-link {
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
                        border: 1px solid var(--border-color);
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }
                    .back-link:hover {
                        background: rgba(var(--accent-rgb), 0.1);
                        border-color: var(--accent-color);
                        color: var(--accent-color);
                        transform: translateX(-4px);
                    }
                `}
            </style>
        </section>
    );
};

export default Blog;
