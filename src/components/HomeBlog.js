import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaClock, FaArrowRight, FaBookmark } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const HomeBlog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
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

                    const sorted = fetchedPosts.sort((a, b) => {
                        if (a.isPinned && !b.isPinned) return -1;
                        if (!a.isPinned && b.isPinned) return 1;
                        return 0;
                    }).slice(0, 3);

                    setPosts(sorted);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error("Error fetching homepage blog posts:", error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <section id="home-blog" className="home-blog-section" style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
            <motion.div
                className="container"
                style={{ maxWidth: '1200px', margin: '0 auto' }}
            >
                {/* Section Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="home-blog-title"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '2.2rem',
                        marginBottom: '3rem',
                        fontWeight: '800',
                        letterSpacing: '-0.5px'
                    }}
                >
                    <span style={{ color: 'var(--accent-color)', textShadow: '0 0 40px rgba(var(--accent-rgb), 0.5)' }}>
                        Latest{' '}
                    </span>
                    Thoughts & Insights
                    <span className="title-line" style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, var(--border-color), transparent)',
                        flexGrow: 1,
                        marginLeft: '1.5rem',
                        maxWidth: '300px'
                    }}></span>
                </motion.h2>

                {/* Content Grid / State */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        Loading latest articles...
                    </div>
                ) : posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            textAlign: 'center',
                            padding: '3.5rem 2rem',
                            background: 'linear-gradient(135deg, rgba(16, 22, 36, 0.8), rgba(10, 14, 26, 0.9))',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            maxWidth: '650px',
                            margin: '0 auto'
                        }}
                    >
                        <FaBookOpen size={42} style={{ color: 'var(--accent-color)', marginBottom: '1rem', opacity: 0.8 }} />
                        <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.6rem', fontWeight: '700' }}>
                            Articles Coming Soon
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            Check back soon for writings on software architecture, AI agent systems, and engineering.
                        </p>
                    </motion.div>
                ) : (
                    <div className="home-blog-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.75rem'
                    }}>
                        {posts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                whileHover={{
                                    y: -8,
                                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
                                }}
                                style={{ height: '100%', borderRadius: '16px' }}
                            >
                                <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                                    <div
                                        className="blog-home-card"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(16, 22, 36, 0.8), rgba(10, 14, 26, 0.9))',
                                            backdropFilter: 'blur(16px)',
                                            WebkitBackdropFilter: 'blur(16px)',
                                            padding: '2.2rem 1.8rem',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                            height: '100%',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.6)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                        }}
                                    >
                                        {/* Top Glow Accent Line */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: '10%', right: '10%',
                                            height: '1px',
                                            background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.5), transparent)',
                                            pointerEvents: 'none'
                                        }} />

                                        {/* Ambient Corner Glow Orb */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-40px',
                                            right: '-40px',
                                            width: '140px',
                                            height: '140px',
                                            background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.18) 0%, transparent 70%)',
                                            pointerEvents: 'none',
                                            borderRadius: '50%'
                                        }} />

                                        {/* Card Top Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1.8rem',
                                            zIndex: 2,
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(var(--accent-rgb), 0.12)',
                                                border: '1px solid rgba(var(--accent-rgb), 0.25)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--accent-color)',
                                                boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.15)'
                                            }}>
                                                <FaBookOpen size={22} />
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono, monospace)' }}>
                                                {post.isPinned && (
                                                    <span style={{
                                                        color: '#fbbf24',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        background: 'rgba(251, 191, 36, 0.12)',
                                                        border: '1px solid rgba(251, 191, 36, 0.3)',
                                                        padding: '3px 10px',
                                                        borderRadius: '20px',
                                                        fontWeight: '600'
                                                    }}>
                                                        <FaBookmark size={10} /> Featured
                                                    </span>
                                                )}
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FaClock size={11} /> {post.readTime}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Post Title */}
                                        <h3 style={{
                                            marginBottom: '0.85rem',
                                            fontSize: '1.35rem',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            lineHeight: '1.35',
                                            zIndex: 2,
                                            position: 'relative'
                                        }}>
                                            {post.title}
                                        </h3>

                                        {/* Description */}
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            marginBottom: '1.8rem',
                                            fontSize: '0.92rem',
                                            lineHeight: '1.65',
                                            opacity: 0.9,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            zIndex: 2,
                                            position: 'relative'
                                        }}>
                                            {post.description}
                                        </p>

                                        {/* Bottom Tag List */}
                                        <div style={{ marginTop: 'auto', zIndex: 2, position: 'relative' }}>
                                            <ul style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '8px',
                                                fontSize: '0.75rem',
                                                color: 'var(--text-secondary)',
                                                fontFamily: 'var(--font-mono, monospace)',
                                                listStyle: 'none',
                                                padding: 0,
                                                margin: 0
                                            }}>
                                                {post.tags.slice(0, 3).map((t, index) => (
                                                    <li key={index} style={{
                                                        background: 'rgba(var(--accent-rgb), 0.12)',
                                                        border: '1px solid rgba(var(--accent-rgb), 0.25)',
                                                        color: 'var(--accent-color)',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {t}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Uniform Action Button */}
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '3.5rem'
                        }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            style={{ borderRadius: '10px' }}
                        >
                            <Link
                                to="/blog"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.9rem 2.2rem',
                                    background: 'rgba(var(--accent-rgb), 0.08)',
                                    border: '1px solid var(--accent-color)',
                                    borderRadius: '10px',
                                    color: 'var(--accent-color)',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                View All Articles
                                <FaArrowRight />
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .home-blog-section {
                            padding: 80px 20px !important;
                        }
                        .home-blog-title {
                            font-size: 1.75rem !important;
                            margin-bottom: 2rem !important;
                        }
                        .title-line {
                            display: none !important;
                        }
                        .home-blog-grid {
                            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                            gap: 1.25rem !important;
                        }
                        .blog-home-card {
                            padding: 1.6rem 1.4rem !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .home-blog-section {
                            padding: 60px 15px !important;
                        }
                        .home-blog-title {
                            font-size: 1.5rem !important;
                        }
                        .home-blog-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default HomeBlog;
