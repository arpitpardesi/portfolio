import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGithub, FaExternalLinkAlt, FaTag } from 'react-icons/fa';

const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: '#111',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header Image / Color Bar */}
                    <div style={{
                        height: '12px',
                        background: `linear-gradient(to right, var(--accent-color), transparent)`
                    }} />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#fff',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                    >
                        <FaTimes />
                    </button>

                    <div className="modal-content-scroll" style={{
                        padding: '2rem',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            marginBottom: '1rem',
                            color: 'var(--accent-color)'
                        }}>
                            {project.title}
                        </h2>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            {project.tags && project.tags.map(tag => (
                                <span key={tag} style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '4px 12px',
                                    borderRadius: '50px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <FaTag size={10} style={{ opacity: 0.7 }} /> {tag}
                                </span>
                            ))}
                        </div>

                        {project.image && (
                            <div style={{ marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden' }}>
                                <img src={project.image} alt={project.title} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                            </div>
                        )}

                        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            {project.fullDesc || project.description}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                            {project.github && (
                                <a href={project.github} target="_blank" rel="noreferrer" className="btn-link" style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none',
                                    padding: '10px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', transition: 'all 0.2s'
                                }}>
                                    <FaGithub /> View Code
                                </a>
                            )}
                            {project.link && (
                                <a href={project.link} target="_blank" rel="noreferrer" className="btn-link" style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', color: '#000', textDecoration: 'none',
                                    padding: '10px 20px', background: 'var(--accent-color)', borderRadius: '4px', fontWeight: '500'
                                }}>
                                    <FaExternalLinkAlt /> Live Demo
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProjectModal;
