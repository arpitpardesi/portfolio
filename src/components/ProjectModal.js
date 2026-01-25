import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FaTimes, FaGithub, FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaExpand, FaStar } from 'react-icons/fa';

const ProjectModal = ({ project, onClose }) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Check if project has mediaItems array
    const hasMediaItems = project?.mediaItems && project.mediaItems.length > 0;
    const mediaItems = hasMediaItems ? project.mediaItems : (project?.image ? [{ url: project.image, type: 'image' }] : []);

    const nextMedia = useCallback(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
    }, [mediaItems.length]);

    const prevMedia = useCallback(() => {
        setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    }, [mediaItems.length]);

    const techStack = project?.techStack || project?.tech || project?.tags || [];

    // Keyboard navigation
    useEffect(() => {
        if (!project) return;

        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' && mediaItems.length > 1) {
                prevMedia();
            } else if (e.key === 'ArrowRight' && mediaItems.length > 1) {
                nextMedia();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [project, mediaItems.length, onClose, nextMedia, prevMedia]);

    if (!project) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(10, 10, 10, 0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1.5rem',
                    overflowY: 'auto'
                }}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'linear-gradient(135deg, rgba(17, 34, 64, 0.98) 0%, rgba(10, 18, 36, 0.98) 100%)',
                        border: '1px solid rgba(100, 255, 218, 0.1)',
                        borderRadius: '20px',
                        maxWidth: '950px',
                        width: '100%',
                        maxHeight: '85vh',
                        margin: '1rem auto',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(var(--accent-rgb), 0.1)',
                    }}
                >
                    {/* Close Button */}
                    <motion.button
                        onClick={onClose}
                        whileHover={{
                            scale: 1.1,
                            rotate: 90,
                            backgroundColor: "rgba(239, 68, 68, 0.25)",
                            borderColor: "rgba(239, 68, 68, 0.5)"
                        }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: '1.2rem',
                            transition: 'all 0.3s',
                            zIndex: 10,
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <FaTimes />
                    </motion.button>

                    {/* Pinned Badge */}
                    {project.isPinned && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                left: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.2) 0%, rgba(var(--accent-rgb), 0.1) 100%)',
                                border: '1px solid rgba(var(--accent-rgb), 0.3)',
                                borderRadius: '50px',
                                padding: '0.5rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                color: 'var(--accent-color)',
                                fontWeight: '600',
                                zIndex: 10,
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.2)'
                            }}
                        >
                            <FaStar /> Featured
                        </motion.div>
                    )}

                    {/* Media Gallery */}
                    {mediaItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                position: 'relative',
                                width: '100%',
                                height: isFullscreen ? '60vh' : 'var(--gallery-height, 350px)',
                                borderRadius: '20px 20px 0 0',
                                overflow: 'hidden',
                                background: '#000'
                            }}
                            className="media-gallery"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentMediaIndex}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ width: '100%', height: '100%', position: 'relative' }}
                                >
                                    {mediaItems[currentMediaIndex].type === 'image' ? (
                                        <img
                                            src={mediaItems[currentMediaIndex].url}
                                            alt={project.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <video
                                            src={mediaItems[currentMediaIndex].url}
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}

                                    {/* Gradient Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '40%',
                                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
                                        pointerEvents: 'none'
                                    }} />
                                </motion.div>
                            </AnimatePresence>

                            {/* Fullscreen Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '5.5rem',
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s',
                                    zIndex: 20
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                            >
                                <FaExpand />
                            </motion.button>

                            {/* Navigation Arrows (only if multiple media items) */}
                            {mediaItems.length > 1 && (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.15, x: -3 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={prevMedia}
                                        style={{
                                            position: 'absolute',
                                            left: '1.5rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '50%',
                                            width: '48px',
                                            height: '48px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white',
                                            transition: 'all 0.3s',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: '1.2rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.3)';
                                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                        }}
                                    >
                                        <FaChevronLeft />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.15, x: 3 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={nextMedia}
                                        style={{
                                            position: 'absolute',
                                            right: '1.5rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '50%',
                                            width: '48px',
                                            height: '48px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white',
                                            transition: 'all 0.3s',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: '1.2rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.3)';
                                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                        }}
                                    >
                                        <FaChevronRight />
                                    </motion.button>

                                    {/* Pagination Dots */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '1.5rem',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        gap: '0.6rem',
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '50px',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        {mediaItems.map((_, index) => (
                                            <motion.div
                                                key={index}
                                                onClick={() => setCurrentMediaIndex(index)}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                style={{
                                                    width: currentMediaIndex === index ? '28px' : '8px',
                                                    height: '8px',
                                                    borderRadius: '4px',
                                                    background: currentMediaIndex === index
                                                        ? 'var(--accent-color)'
                                                        : 'rgba(255, 255, 255, 0.4)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s',
                                                    boxShadow: currentMediaIndex === index
                                                        ? '0 0 10px rgba(var(--accent-rgb), 0.6)'
                                                        : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Media Counter */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '1.5rem',
                                        left: '1.5rem',
                                        background: 'rgba(0, 0, 0, 0.6)',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        color: 'white',
                                        fontFamily: 'var(--font-mono)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        zIndex: 20
                                    }}>
                                        {currentMediaIndex + 1} / {mediaItems.length}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* Content */}
                    <div className="modal-body" style={{ padding: mediaItems.length > 0 ? '2.5rem' : '5.5rem 2.5rem 2.5rem' }}>
                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="modal-title"
                            style={{
                                fontSize: '2.25rem',
                                fontWeight: '700',
                                marginBottom: '1.5rem',
                                color: 'var(--primary-text-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                flexWrap: 'wrap'
                            }}
                        >
                            {(() => {
                                const title = project.title;
                                const words = title.split(' ');
                                if (words.length <= 1) return <span style={{ color: 'var(--accent-color)', textShadow: '0 0 40px rgba(var(--accent-rgb), 0.5)' }}>{title}</span>;
                                return (
                                    <>
                                        <span style={{ color: 'var(--accent-color)', textShadow: '0 0 40px rgba(var(--accent-rgb), 0.5)' }}>
                                            {words[0]}
                                        </span>
                                        <span>{words.slice(1).join(' ')}</span>
                                    </>
                                );
                            })()}
                        </motion.h2>

                        {/* Tech Stack & Metadata Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="modal-metadata-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0, 1fr) auto',
                                gap: '2rem',
                                marginBottom: '2rem'
                            }}
                        >
                            {/* Tech Stack */}
                            <div>
                                <h3 style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--accent-color)',
                                    marginBottom: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    fontWeight: '700'
                                }}>
                                    Tech Stack
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                    {techStack.map((tech, index) => (
                                        <motion.span
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + index * 0.05 }}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(var(--accent-rgb), 0.08)',
                                                border: '1px solid rgba(var(--accent-rgb), 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                color: 'var(--accent-color)',
                                                fontFamily: 'var(--font-mono)',
                                                transition: 'all 0.3s',
                                                cursor: 'default',
                                                fontWeight: '500'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.15)';
                                                e.currentTarget.style.borderColor = 'var(--accent-color)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--accent-rgb), 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.08)';
                                                e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.2)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {tech}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>

                            {/* Metadata Sidebar */}
                            <div className="metadata-sidebar" style={{ textAlign: 'right', minWidth: '150px' }}>
                                {project.category && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        style={{ marginBottom: '1.2rem' }}
                                    >
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#888',
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            Category
                                        </div>
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(var(--accent-rgb), 0.12)',
                                            border: '1px solid rgba(var(--accent-rgb), 0.3)',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            color: 'var(--accent-color)',
                                            display: 'inline-block',
                                            fontWeight: '600'
                                        }}>
                                            {project.category}
                                        </div>
                                    </motion.div>
                                )}
                                {project.createdAt && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.45 }}
                                    >
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#888',
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            Development
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: 'var(--primary-text-color)',
                                            fontWeight: '500'
                                        }}>
                                            {new Date(project.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Description (with Markdown support) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                fontSize: '1.05rem',
                                lineHeight: '1.8',
                                color: 'var(--secondary-text-color)',
                                marginBottom: '2.5rem',
                                padding: '1.5rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                            className="markdown-content"
                        >
                            {project.fullDesc ? (
                                <ReactMarkdown>{project.fullDesc}</ReactMarkdown>
                            ) : (
                                <p>{project.description}</p>
                            )}
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
                        >
                            {project.github && (
                                <motion.a
                                    href={project.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0px 0px 8px rgba(255, 255, 255, 0.3)",
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                        borderColor: "rgba(255, 255, 255, 0.3)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.85rem 1.75rem',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '12px',
                                        color: 'var(--primary-text-color)',
                                        textDecoration: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaGithub size={18} /> View Source
                                </motion.a>
                            )}
                            {project.link && (
                                <motion.a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0px 0px 15px rgba(var(--accent-rgb), 0.5)",
                                        filter: 'brightness(1.1)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.85rem 1.75rem',
                                        background: 'linear-gradient(135deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.8) 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: 'white',
                                        textDecoration: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 20px rgba(var(--accent-rgb), 0.3)'
                                    }}
                                >
                                    <FaExternalLinkAlt size={16} /> Live Demo
                                </motion.a>
                            )}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Styles */}
                <style>{`
                    :root {
                        --gallery-height: 350px;
                    }

                    @keyframes shimmer {
                        0% { background-position: 0% center; }
                        100% { background-position: 200% center; }
                    }

                    .markdown-content h1,
                    .markdown-content h2,
                    .markdown-content h3 {
                        color: var(--accent-color);
                        margin-top: 1.5rem;
                        margin-bottom: 0.75rem;
                    }

                    .markdown-content p {
                        margin-bottom: 1rem;
                    }

                    .markdown-content code {
                        background: rgba(var(--accent-rgb), 0.1);
                        padding: 0.2rem 0.4rem;
                        border-radius: 4px;
                        font-family: var(--font-mono);
                        font-size: 0.9em;
                        color: var(--accent-color);
                    }

                    .markdown-content ul,
                    .markdown-content ol {
                        margin-left: 1.5rem;
                        margin-bottom: 1rem;
                    }

                    .markdown-content li {
                        margin-bottom: 0.5rem;
                    }

                    @media (max-width: 992px) {
                        --gallery-height: 300px;
                    }

                    @media (max-width: 768px) {
                        :root {
                            --gallery-height: 250px;
                        }
                        
                        .modal-body {
                            padding: 1.5rem !important;
                        }

                        .modal-title {
                            font-size: 1.75rem !important;
                        }

                        .modal-metadata-grid {
                            grid-template-columns: 1fr !important;
                            gap: 1.5rem !important;
                        }

                        .metadata-sidebar {
                            text-align: left !important;
                            min-width: auto !important;
                            display: flex !important;
                            gap: 2rem !important;
                            flex-wrap: wrap !important;
                        }

                        .markdown-content {
                            font-size: 0.95rem !important;
                            padding: 1rem !important;
                            line-height: 1.6 !important;
                        }

                        .cta-group {
                            flex-direction: column !important;
                        }

                        .cta-group a {
                            width: 100% !important;
                            justify-content: center !important;
                        }
                    }

                    @media (max-width: 480px) {
                        :root {
                            --gallery-height: 200px;
                        }

                        .modal-title {
                            font-size: 1.5rem !important;
                        }

                        .metadata-sidebar {
                            flex-direction: column !important;
                            gap: 1rem !important;
                        }
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProjectModal;
