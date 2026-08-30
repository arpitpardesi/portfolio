import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaFolder, FaArrowRight } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'projects'));
                if (!querySnapshot.empty) {
                    const items = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        tech: Array.isArray(doc.data().tech) ? doc.data().tech : (doc.data().tags || [])
                    })).filter(item => item.isVisible !== false);

                    const pinnedProjects = items.filter(item => item.isPinned);
                    const sortedItems = pinnedProjects.sort((a, b) => {
                        if (a.isPinned && !b.isPinned) return -1;
                        if (!a.isPinned && b.isPinned) return 1;
                        return 0;
                    });
                    setProjects(sortedItems);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        <section id="projects" className="projects-section" style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
            <motion.div
                className="container"
                style={{ maxWidth: '1200px', margin: '0 auto' }}
            >
                {/* Section Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="projects-title"
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
                        Featured{' '}
                    </span>
                    Creations
                    <span className="title-line" style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, var(--border-color), transparent)',
                        flexGrow: 1,
                        marginLeft: '1.5rem',
                        maxWidth: '300px'
                    }}></span>
                </motion.h2>

                {/* Projects Grid */}
                <div className="projects-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.75rem',
                    minHeight: loading ? '380px' : 'auto'
                }}>
                    {!loading && projects.map((project, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{
                                y: -8,
                                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
                            }}
                            className="project-card-wrapper"
                            style={{ height: '100%', borderRadius: '16px' }}
                        >
                            <div
                                className="project-card"
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

                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', zIndex: 2, position: 'relative' }}>
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
                                        <FaFolder size={22} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {project.github && (
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label="GitHub Repository"
                                                style={{
                                                    color: 'var(--text-secondary)',
                                                    transition: 'all 0.25s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255, 255, 255, 0.04)',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.color = 'var(--accent-color)';
                                                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                                                    e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                                    e.currentTarget.style.transform = 'none';
                                                }}
                                            >
                                                <FaGithub size={18} />
                                            </a>
                                        )}
                                        {project.external && (
                                            <a
                                                href={project.external}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label="Live Demo"
                                                style={{
                                                    color: 'var(--text-secondary)',
                                                    transition: 'all 0.25s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255, 255, 255, 0.04)',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.color = 'var(--accent-color)';
                                                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                                                    e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                                    e.currentTarget.style.transform = 'none';
                                                }}
                                            >
                                                <FaExternalLinkAlt size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Project Title */}
                                <h3 className="project-title" style={{
                                    marginBottom: '0.85rem',
                                    fontSize: '1.35rem',
                                    fontWeight: '700',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.35',
                                    zIndex: 2,
                                    position: 'relative'
                                }}>
                                    {project.title}
                                </h3>

                                {/* Project Description */}
                                <p className="project-description" style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: '1.8rem',
                                    fontSize: '0.92rem',
                                    lineHeight: '1.65',
                                    opacity: 0.9,
                                    zIndex: 2,
                                    position: 'relative'
                                }}>
                                    {project.description}
                                </p>

                                {/* Tech Tag Pills */}
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
                                        {project.tech.map((t, index) => (
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
                        </motion.div>
                    ))}
                </div>

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
                                to="/projects"
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
                                View All Projects
                                <FaArrowRight />
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .projects-section {
                            padding: 80px 20px !important;
                        }
                        .projects-title {
                            font-size: 1.75rem !important;
                            margin-bottom: 2rem !important;
                        }
                        .title-line {
                            display: none !important;
                        }
                        .projects-grid {
                            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                            gap: 1.25rem !important;
                        }
                        .project-card {
                            padding: 1.6rem 1.4rem !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .projects-section {
                            padding: 60px 15px !important;
                        }
                        .projects-title {
                            font-size: 1.5rem !important;
                        }
                        .projects-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default Projects;
