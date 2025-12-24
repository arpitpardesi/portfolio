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
                        // Ensure tech is an array if stored as string, though CollectionManager handles it
                        tech: Array.isArray(doc.data().tech) ? doc.data().tech : (doc.data().tags || [])
                    }));
                    // Filter to show only pinned projects on homepage
                    const pinnedProjects = items.filter(item => item.isPinned);
                    // Sort to show pinned projects first (redundant here but for consistency)
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
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="projects-title"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '2rem',
                        marginBottom: '3rem',
                        fontWeight: '700'
                    }}
                >
                    <span style={{ color: 'var(--accent-color)', marginRight: '0.5rem', fontSize: '1.5rem' }}></span>
                    Some Things I've Built
                    <span className="title-line" style={{
                        height: '1px',
                        background: 'var(--border-color)',
                        flexGrow: 1,
                        marginLeft: '1.5rem',
                        maxWidth: '300px'
                    }}></span>
                </motion.h2>

                <div className="projects-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    minHeight: loading ? '400px' : 'auto'
                }}>
                    {!loading && projects.map((project, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{
                                y: -10,
                                boxShadow: '0 20px 30px -15px rgba(2, 12, 27, 0.7)'
                            }}
                            className="project-card"
                            style={{
                                background: '#112240',
                                padding: '2rem 1.75rem',
                                borderRadius: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1)',
                                cursor: 'default',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', zIndex: 2, position: 'relative' }}>
                                <FaFolder style={{ fontSize: '2.5rem', color: 'var(--accent-color)' }} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {project.github && (
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}
                                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                        >
                                            <FaGithub size={20} />
                                        </a>
                                    )}
                                    {project.external && (
                                        <a
                                            href={project.external}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}
                                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                        >
                                            <FaExternalLinkAlt size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <h3 className="project-title" style={{
                                marginBottom: '0.75rem',
                                fontSize: '1.35rem',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                zIndex: 2,
                                position: 'relative'
                            }}>
                                <span style={{
                                    background: 'linear-gradient(to right, var(--text-primary), var(--text-primary))',
                                    backgroundSize: '0% 1px',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'left bottom',
                                    transition: 'background-size 0.3s ease'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundSize = '100% 1px'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundSize = '0% 1px'}
                                >
                                    {project.title}
                                </span>
                            </h3>

                            <p className="project-description" style={{
                                color: 'var(--text-secondary)',
                                marginBottom: '2rem',
                                fontSize: '0.9rem',
                                zIndex: 2,
                                position: 'relative'
                            }}>
                                {project.description}
                            </p>

                            <div style={{ marginTop: 'auto', zIndex: 2, position: 'relative' }}>
                                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                    {project.tech.map((t, index) => (
                                        <li key={index} style={{
                                            background: 'rgba(var(--accent-rgb), 0.1)',
                                            color: 'var(--accent-color)',
                                            padding: '4px 10px',
                                            borderRadius: '12px'
                                        }}>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* More Projects Button */}
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '3rem'
                        }}
                    >
                        <Link
                            to="/projects"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem 2rem',
                                background: 'transparent',
                                border: '2px solid var(--accent-color)',
                                borderRadius: '4px',
                                color: 'var(--accent-color)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            View All Projects
                            <FaArrowRight />
                        </Link>
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
                            gridTemplateColumns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                            gap: 1.25rem !important;
                        }
                        .project-card {
                            padding: 1.5rem 1.25rem !important;
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
                        .project-title {
                            font-size: 1.2rem !important;
                        }
                        .project-description {
                            font-size: 0.85rem !important;
                            margin-bottom: 1.5rem !important;
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default Projects;

