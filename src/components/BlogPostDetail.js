import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaClock, FaTag, FaShareAlt, FaCheck, FaUser, FaBookOpen } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet-async';

const BlogPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                // Fetch Firestore document by ID
                const docRef = doc(db, 'blogs', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    let formattedDate = 'Recent';
                    if (data.date) {
                        formattedDate = data.date;
                    } else if (data.createdAt?.toDate) {
                        formattedDate = data.createdAt.toDate().toISOString().split('T')[0];
                    }

                    const wordCount = (data.fullDesc || data.description || '').split(' ').length;
                    const estimatedRead = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

                    setPost({
                        id: docSnap.id,
                        title: data.title || 'Untitled Post',
                        description: data.description || data.desc || '',
                        fullDesc: data.fullDesc || data.content || data.description || '',
                        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : ['General']),
                        date: formattedDate,
                        readTime: data.readTime || estimatedRead,
                        author: data.author || 'Arpit Pardesi',
                        color: data.color || '#6366f1',
                        image: data.image || (data.mediaItems && data.mediaItems[0]?.url) || ''
                    });
                } else {
                    setPost(null);
                }
            } catch (err) {
                console.error("Error loading blog post from Firestore:", err);
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                Loading article...
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <FaBookOpen size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', color: 'var(--text-primary)' }}>Article Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', fontSize: '0.95rem' }}>
                    The requested blog post could not be found or has not been published.
                </p>
                <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px var(--accent-color)", backgroundColor: "rgba(var(--accent-rgb), 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    style={{ borderRadius: '50px', display: 'inline-block' }}
                >
                    <button onClick={() => navigate('/blog', { replace: true })} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
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
                        <FaArrowLeft /> Return to Blog
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <article className="blog-post-detail" style={{
            padding: 'calc(120px + env(safe-area-inset-top)) 20px 100px',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 1
        }}>
            <Helmet>
                <title>{`${post.title} | Arpit Pardesi Blog`}</title>
                <meta name="description" content={post.description} />
            </Helmet>

            {/* Back Navigation */}
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
                        backgroundColor: "rgba(var(--accent-rgb), 0.1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{ borderRadius: '50px', display: 'inline-block' }}
                >
                    <button onClick={() => navigate('/blog', { replace: true })} style={{
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

            <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
                {/* Post Header Container */}
                <motion.header
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    style={{ marginBottom: '2.2rem' }}
                >
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {post.tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(var(--accent-rgb), 0.15)',
                                color: 'var(--accent-color)',
                                border: '1px solid rgba(var(--accent-rgb), 0.3)'
                            }}>
                                <FaTag size={9} style={{ marginRight: '5px' }} />
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Main Title */}
                    <h1 style={{
                        fontSize: 'clamp(1.7rem, 4.5vw, 2.6rem)',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        lineHeight: '1.28',
                        marginBottom: '1rem'
                    }}>
                        {post.title}
                    </h1>

                    {/* Metadata Row */}
                    <div className="blog-detail-meta" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.8rem',
                        paddingBottom: '1.25rem',
                        borderBottom: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.88rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                                <div style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-color)',
                                    color: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: '700'
                                }}>
                                    <FaUser size={11} />
                                </div>
                                {post.author}
                            </div>
                            <span>•</span>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaClock size={11} /> {post.readTime}
                            </span>
                        </div>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: '7px 14px',
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-color)',
                                color: copied ? '#10b981' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {copied ? <FaCheck /> : <FaShareAlt />}
                            {copied ? 'Link Copied!' : 'Share'}
                        </button>
                    </div>
                </motion.header>

                {/* Banner / Cover Image */}
                {post.image && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            width: '100%',
                            height: 'clamp(200px, 35vh, 380px)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            marginBottom: '2.5rem',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
                        }}
                    >
                        <img
                            src={post.image}
                            alt={post.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </motion.div>
                )}

                {/* Markdown Post Body */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="markdown-content"
                    style={{
                        color: 'var(--text-primary)',
                        fontSize: 'clamp(1rem, 2.2vw, 1.1rem)',
                        lineHeight: '1.8'
                    }}
                >
                    <ReactMarkdown>{post.fullDesc || post.description}</ReactMarkdown>
                </motion.div>

                {/* Footer Navigation Back */}
                <div style={{
                    marginTop: '3.5rem',
                    paddingTop: '1.75rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <motion.div
                        whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px var(--accent-color)", backgroundColor: "rgba(var(--accent-rgb), 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        style={{ borderRadius: '50px', display: 'inline-block' }}
                    >
                        <button onClick={() => navigate('/blog', { replace: true })} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
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
                            <FaArrowLeft /> Back to All Articles
                        </button>
                    </motion.div>
                </div>
            </div>

            <style>
                {`
                    .markdown-content h1,
                    .markdown-content h2,
                    .markdown-content h3,
                    .markdown-content h4 {
                        color: var(--text-primary);
                        font-weight: 700;
                        margin-top: 1.8rem;
                        margin-bottom: 0.9rem;
                        line-height: 1.3;
                    }
                    .markdown-content h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); }
                    .markdown-content h2 { font-size: clamp(1.3rem, 3.5vw, 1.8rem); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
                    .markdown-content h3 { font-size: clamp(1.1rem, 3vw, 1.4rem); color: var(--accent-color); }
                    .markdown-content h4 { font-size: clamp(1rem, 2.5vw, 1.2rem); }

                    .markdown-content p {
                        margin-bottom: 1.3rem;
                        color: rgba(255, 255, 255, 0.88);
                    }

                    .markdown-content ul,
                    .markdown-content ol {
                        margin-bottom: 1.3rem;
                        padding-left: 1.5rem;
                        color: rgba(255, 255, 255, 0.88);
                    }

                    .markdown-content li {
                        margin-bottom: 0.4rem;
                    }

                    .markdown-content img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 14px;
                        margin: 1.5rem 0;
                        border: 1px solid var(--border-color);
                    }

                    .markdown-content blockquote {
                        border-left: 4px solid var(--accent-color);
                        padding: 0.8rem 1.2rem;
                        margin: 1.5rem 0;
                        background: rgba(var(--accent-rgb), 0.08);
                        border-radius: 0 12px 12px 0;
                        font-style: italic;
                        color: var(--text-primary);
                    }

                    .markdown-content code {
                        background: rgba(255, 255, 255, 0.08);
                        color: var(--accent-color);
                        padding: 3px 7px;
                        border-radius: 6px;
                        font-family: var(--font-mono, monospace);
                        font-size: 0.88em;
                    }

                    .markdown-content pre {
                        background: #0d0d12;
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        padding: 1.25rem;
                        border-radius: 14px;
                        overflow-x: auto;
                        margin: 1.5rem 0;
                        max-width: 100%;
                    }

                    .markdown-content pre code {
                        background: transparent;
                        color: #e2e8f0;
                        padding: 0;
                    }

                    @media (max-width: 768px) {
                        .blog-post-detail {
                            padding: calc(100px + env(safe-area-inset-top)) 16px 60px !important;
                        }
                        .back-nav {
                            position: static !important;
                            margin-bottom: 1.5rem;
                            display: inline-block;
                            align-self: flex-start;
                        }
                    }

                    @media (max-width: 480px) {
                        .blog-detail-meta {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                        }
                    }
                `}
            </style>
        </article>
    );
};

export default BlogPostDetail;
