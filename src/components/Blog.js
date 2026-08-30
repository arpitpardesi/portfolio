import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaClock, FaTag, FaBookOpen, FaBookmark, FaArrowRight, FaTimes } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';

const Blog = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'blogs'));
                if (!querySnapshot.empty) {
                    const fetchedPosts = querySnapshot.docs
                        .map(doc => {
                            const data = doc.data();
                            let formattedDate = 'Recent';
                            if (data.date) {
                                formattedDate = data.date;
                            } else if (data.createdAt?.toDate) {
                                formattedDate = data.createdAt.toDate().toISOString().split('T')[0];
                            }

                            const wordCount = (data.fullDesc || data.description || '').split(' ').length;
                            const estimatedRead = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

                            return {
                                id: doc.id,
                                title: data.title || 'Untitled Post',
                                description: data.description || data.desc || '',
                                fullDesc: data.fullDesc || data.content || '',
                                tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : ['General']),
                                date: formattedDate,
                                readTime: data.readTime || estimatedRead,
                                color: data.color || '#6366f1',
                                isPinned: !!data.isPinned,
                                author: data.author || 'Arpit Pardesi',
                                image: data.image || (data.mediaItems && data.mediaItems[0]?.url) || '',
                                isVisible: data.isVisible !== false
                            };
                        })
                        .filter(p => p.isVisible);

                    setPosts(fetchedPosts);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error("Error fetching blog posts from Firestore:", error);
                setPosts([]);
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
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ borderRadius: '50px', display: 'inline-block' }}
                >
                    <button onClick={() => navigate('/')} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        fontWeight: '500',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        background: 'rgba(10, 10, 10, 0.5)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                    }}>
                        <FaArrowLeft /> Back
                    </button>
                </motion.div>
            </motion.div>

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Header Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="blog-header-wrapper"
                    style={{ textAlign: 'center', marginBottom: '3.5rem' }}
                >
                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
                        marginBottom: '1rem',
                        fontWeight: '700',
                        lineHeight: '1.2'
                    }}>
                        <span style={{
                            color: 'var(--accent-color)',
                            textShadow: '0 0 40px rgba(var(--accent-rgb), 0.5)'
                        }}>
                            My{' '}
                        </span>
                        <span style={{
                            color: 'var(--text-primary)'
                        }}>
                            Blog
                        </span>
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        maxWidth: '600px',
                        margin: '0 auto',
                        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                        lineHeight: '1.6'
                    }}>
                        Exploring ideas, technology, and engineering stories.
                    </p>
                </motion.div>

                {/* Search Bar & Tag Filters (Only when there are posts) */}
                {posts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{ marginBottom: '3rem' }}
                    >
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            alignItems: 'center'
                        }}>
                            {/* Search Input */}
                            <div className="search-input-box" style={{
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
                                    fontSize: '0.95rem'
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
                                        transition: 'all 0.3s ease',
                                        boxSizing: 'border-box'
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
                            {allTags.length > 1 && (
                                <div className="tag-pills-container" style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    maxWidth: '100%'
                                }}>
                                    {allTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setSelectedTag(tag)}
                                            style={{
                                                padding: '7px 16px',
                                                borderRadius: '30px',
                                                border: selectedTag === tag ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                                                background: selectedTag === tag ? 'rgba(var(--accent-rgb), 0.18)' : 'rgba(255, 255, 255, 0.03)',
                                                color: selectedTag === tag ? 'var(--accent-color)' : 'var(--text-secondary)',
                                                fontSize: '0.82rem',
                                                fontWeight: selectedTag === tag ? '600' : '400',
                                                cursor: 'pointer',
                                                transition: 'all 0.25s ease',
                                                backdropFilter: 'blur(5px)'
                                            }}
                                        >
                                            {tag !== 'All' && <FaTag size={9} style={{ marginRight: '5px' }} />}
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Loading blog posts...
                    </div>
                ) : posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="empty-blog-card"
                        style={{
                            textAlign: 'center',
                            padding: '3.5rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            maxWidth: '600px',
                            margin: '0 auto',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <FaBookOpen size={44} style={{ color: 'var(--accent-color)', marginBottom: '1.2rem', opacity: 0.8 }} />
                        <h3 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', color: 'var(--text-primary)', marginBottom: '0.8rem', fontWeight: '700' }}>
                            {currentUser ? 'No blog posts published yet' : 'Articles Coming Soon'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: currentUser ? '1.8rem' : '0' }}>
                            {currentUser
                                ? 'Articles will appear here once published from the Admin Dashboard.'
                                : 'Check back soon for writings on software architecture, AI agent systems, and engineering.'}
                        </p>
                        {currentUser && (
                            <Link
                                to="/admin"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    borderRadius: '30px',
                                    background: 'rgba(var(--accent-rgb), 0.2)',
                                    border: '1px solid var(--accent-color)',
                                    color: 'var(--accent-color)',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Open Admin Dashboard
                            </Link>
                        )}
                    </motion.div>
                ) : filteredPosts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '3.5rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <FaBookOpen size={38} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            No matching articles found
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
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
                                style={{ marginBottom: '3rem' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '0.8rem',
                                    color: '#fbbf24',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    <FaBookmark /> Featured Article
                                </div>

                                <Link to={`/blog/${featuredPost.id}`} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        whileHover={{ y: -6, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                                        transition={{ duration: 0.3 }}
                                        className="featured-post-card"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(var(--accent-rgb), 0.3)',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {/* Image */}
                                        <div className="featured-card-image" style={{
                                            minHeight: '240px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            background: featuredPost.color ? `linear-gradient(135deg, ${featuredPost.color}30, #0a0a0d)` : '#111'
                                        }}>
                                            {featuredPost.image ? (
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
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    minHeight: '220px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: featuredPost.color || 'var(--accent-color)',
                                                    fontSize: '3rem'
                                                }}>
                                                    <FaBookOpen />
                                                </div>
                                            )}
                                            <div style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                background: 'linear-gradient(to top, rgba(10,10,12,0.8), transparent 60%)'
                                            }} />
                                        </div>

                                        {/* Content */}
                                        <div className="featured-card-content" style={{
                                            padding: '2.2rem 2rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                                                {featuredPost.tags.map(t => (
                                                    <span key={t} style={{
                                                        fontSize: '0.72rem',
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
                                                fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
                                                fontWeight: '700',
                                                color: 'var(--text-primary)',
                                                marginBottom: '0.8rem',
                                                lineHeight: '1.3'
                                            }}>
                                                {featuredPost.title}
                                            </h2>

                                            <p style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.96rem',
                                                lineHeight: '1.6',
                                                marginBottom: '1.5rem'
                                            }}>
                                                {featuredPost.description}
                                            </p>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                paddingTop: '1rem',
                                                borderTop: '1px solid var(--border-color)',
                                                marginTop: 'auto',
                                                flexWrap: 'wrap',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                    <span>{featuredPost.date}</span>
                                                    <span>•</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FaClock size={11} /> {featuredPost.readTime}
                                                    </span>
                                                </div>

                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: 'var(--accent-color)',
                                                    fontSize: '0.88rem',
                                                    fontWeight: '600'
                                                }}>
                                                    Read Article <FaArrowRight size={11} />
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
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.75rem'
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
                                                    height: '175px',
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
                                                            fontSize: '2.4rem'
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
                                                    padding: '1.5rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    flex: 1
                                                }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
                                                        {post.tags.slice(0, 3).map(t => (
                                                            <span key={t} style={{
                                                                fontSize: '0.68rem',
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
                                                        fontSize: '1.18rem',
                                                        fontWeight: '700',
                                                        color: 'var(--text-primary)',
                                                        marginBottom: '0.6rem',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {post.title}
                                                    </h3>

                                                    <p style={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '0.88rem',
                                                        lineHeight: '1.5',
                                                        marginBottom: '1.25rem',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {post.description}
                                                    </p>

                                                    <div style={{
                                                        marginTop: 'auto',
                                                        paddingTop: '0.8rem',
                                                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        fontSize: '0.78rem',
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        <span>{post.date}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaClock size={10} /> {post.readTime}
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
                        .blog-header-wrapper {
                            margin-bottom: 2rem !important;
                        }
                        .blog-grid {
                            grid-template-columns: 1fr !important;
                            gap: 1.25rem !important;
                        }
                        .featured-card-content {
                            padding: 1.5rem 1.25rem !important;
                        }
                        .featured-card-image {
                            min-height: 190px !important;
                        }
                        .back-nav {
                            position: static !important;
                            margin-bottom: 1.8rem;
                            display: inline-block;
                            align-self: flex-start;
                        }
                    }

                    @media (max-width: 480px) {
                        .search-input-box input {
                            padding: 12px 38px 12px 40px !important;
                            font-size: 0.88rem !important;
                        }
                        .empty-blog-card {
                            padding: 2.5rem 1rem !important;
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default Blog;
