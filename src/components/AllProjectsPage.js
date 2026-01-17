import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaFolder, FaArrowLeft } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import ProjectModal from './ProjectModal';

const AllProjectsPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'projects'));
                if (!querySnapshot.empty) {
                    const items = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        tech: Array.isArray(doc.data().tech) ? doc.data().tech : (doc.data().tags || [])
                    }));
                    // Sort to show pinned projects first
                    const sortedItems = items.sort((a, b) => {
                        if (a.isPinned && !b.isPinned) return -1;
                        if (!a.isPinned && b.isPinned) return 1;
                        return 0;
                    });
                    setProjects(sortedItems);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
            setLoading(false);
        };
        fetchProjects();
    }, []);

    return (
        <section className="all-projects-page" style={{
            minHeight: '100vh',
            padding: '120px 20px 80px',
            position: 'relative',
            zIndex: 1
        }}>
            <div className="container" style={{ maxWidth: '1200px', width: '100%' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'fixed', top: '100px', left: '40px', zIndex: 100 }}
                    className="back-nav"
                >
                    <button onClick={() => navigate(-1)} style={{
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
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.color = 'var(--accent-color)';
                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                            e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'rgba(10, 10, 10, 0.5)';
                        }}
                    >
                        <FaArrowLeft /> Back
                    </button>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '5rem' }}
                >
                    <h1 style={{
                        fontSize: '3.5rem',
                        marginBottom: '1.5rem',
                        fontWeight: '700',
                        lineHeight: '1.2'
                    }}>
                        <span style={{
                            color: 'var(--accent-color)',
                            textShadow: '0 0 40px rgba(var(--accent-rgb), 0.5)'
                        }}>
                            Archive{' '}
                        </span>
                        <span style={{
                            color: 'var(--text-primary)'
                        }}>
                            of Ideas
                        </span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.15rem',
                            maxWidth: '700px',
                            margin: '0 auto 2rem',
                            lineHeight: '1.8',
                            fontStyle: 'italic',
                            opacity: 0.9
                        }}
                    >
                        A constellation of ideas brought to life. <br /> Each project is a journey through the intersection of imagination and engineering, where curiosity transforms into creation.

                    </motion.p>

                    {projects.some(p => p.isPinned) && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="floating-featured-note"
                            style={{
                                position: 'fixed',
                                bottom: '40px',
                                right: '40px',
                                zIndex: 100,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '50px',
                                background: 'rgba(10, 10, 10, 0.6)',
                                border: '1px solid rgba(var(--accent-rgb), 0.3)',
                                backdropFilter: 'blur(10px)',
                                fontSize: '0.8rem',
                                fontWeight: '400',
                                color: 'var(--text-secondary)',
                                cursor: 'default',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'var(--accent-color)';
                                e.currentTarget.style.background = 'rgba(10, 10, 10, 0.8)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
                                e.currentTarget.style.background = 'rgba(10, 10, 10, 0.6)';
                            }}
                        >
                            <span style={{
                                fontSize: '1rem',
                                filter: 'drop-shadow(0 0 4px rgba(var(--accent-rgb), 0.5))'
                            }}>⭐</span>
                            <span className="note-text">Featured projects</span>
                        </motion.div>
                    )}
                </motion.div>

                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '6rem 2rem',
                        color: 'var(--text-secondary)',
                        fontSize: '1.1rem'
                    }}>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Gathering the pieces...
                        </motion.div>
                    </div>
                ) : projects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '6rem 2rem',
                        color: 'var(--text-secondary)',
                        fontSize: '1.1rem'
                    }}>
                        The vault is empty. More to come soon.
                    </div>
                ) : (
                    <div className="projects-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '2rem',
                        padding: '0 1rem'
                    }}>
                        {projects.map((project, i) => (
                            <motion.div
                                key={project.id || i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.5 }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.02
                                }}
                                onClick={() => setSelectedProject(project)}
                                className="project-card"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '2.5rem 2rem',
                                    borderRadius: '16px',
                                    border: project.isPinned ? '1px solid rgba(var(--accent-rgb), 0.3)' : '1px solid var(--border-color)',
                                    boxShadow: project.isPinned ? '0 0 20px rgba(var(--accent-rgb), 0.15), 0 0 40px rgba(var(--accent-rgb), 0.1)' : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'default',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    left: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: `radial-gradient(circle, ${project.color || 'var(--accent-color)'}15 0%, transparent 70%)`,
                                    opacity: 0,
                                    transition: 'opacity 0.4s ease',
                                    pointerEvents: 'none'
                                }} className="card-glow" />

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '1.5rem',
                                    zIndex: 2,
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        color: project.color || 'var(--accent-color)',
                                        filter: `drop-shadow(0 0 10px ${project.color || 'var(--accent-color)'}40)`
                                    }}>
                                        <FaFolder />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        {project.isPinned && (
                                            <span style={{
                                                fontSize: '1.3rem',
                                                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
                                            }}>⭐</span>
                                        )}
                                        {project.github && (
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    color: 'var(--text-secondary)',
                                                    transition: 'all 0.3s ease',
                                                    fontSize: '1.2rem'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.color = 'var(--accent-color)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <FaGithub />
                                            </a>
                                        )}
                                        {project.external && (
                                            <a
                                                href={project.external}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    color: 'var(--text-secondary)',
                                                    transition: 'all 0.3s ease',
                                                    fontSize: '1.1rem'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.color = 'var(--accent-color)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <FaExternalLinkAlt />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <h3 style={{
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    zIndex: 2,
                                    position: 'relative'
                                }}>
                                    {project.title}
                                </h3>

                                <p style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: '2rem',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    zIndex: 2,
                                    position: 'relative',
                                    flexGrow: 1
                                }}>
                                    {project.description}
                                </p>

                                <div style={{ marginTop: 'auto', zIndex: 2, position: 'relative' }}>
                                    <ul style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        {project.tech.map((t, index) => (
                                            <li key={index} style={{
                                                background: 'rgba(var(--accent-rgb), 0.1)',
                                                color: 'var(--accent-color)',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(var(--accent-rgb), 0.2)',
                                                transition: 'all 0.3s ease'
                                            }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.2)';
                                                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                                                    e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.2)';
                                                }}
                                            >
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />

            <style>
                {`
                    .project-card {
                        cursor: pointer !important;
                    }
                    .project-card:hover {
                        border-color: rgba(var(--accent-rgb), 0.5) !important;
                        background: rgba(var(--accent-rgb), 0.05) !important;
                    }
                    .project-card:hover h3 {
                        color: var(--accent-color);
                    }
                    .project-card:hover .project-icon {
                        transform: scale(1.1);
                    }
                    .project-icon {
                        transition: transform 0.3s ease;
                    }
                    .project-card .card-glow {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: radial-gradient(circle at center, rgba(var(--accent-rgb), 0.1) 0%, transparent 70%);
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        pointer-events: none;
                    }
                    .project-card:hover .card-glow {
                        opacity: 1 !important;
                    }

                    @media (max-width: 1024px) {
                        .back-nav {
                            position: static !important;
                            margin-bottom: 2rem;
                            display: inline-block;
                        }
                    }

                    @media (max-width: 768px) {
                        .all-projects-page {
                            padding: 100px 15px 60px !important;
                        }
                        .all-projects-page h1 {
                            font-size: 2.5rem !important;
                        }
                        .all-projects-page > div > div > p {
                            font-size: 1rem !important;
                        }
                        .projects-grid {
                            gridTemplateColumns: 1fr !important;
                            gap: 1.5rem !important;
                        }
                        .project-card {
                            padding: 2rem 1.5rem !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .floating-featured-note {
                            bottom: 20px !important;
                            right: 20px !important;
                            padding: 0.5rem 1rem !important;
                            font-size: 0.75rem !important;
                        }
                        .floating-featured-note .note-text {
                            display: none;
                        }
                    }

                    @media (max-width: 480px) {
                        .floating-featured-note {
                            display: none !important;
                        }
                    }

                    @media (max-height: 500px) and (orientation: landscape) {
                        .floating-featured-note {
                            display: none !important;
                        }
                        .all-projects-page {
                            padding-top: 60px !important;
                            padding-bottom: 20px !important;
                        }
                        .all-projects-page h1 {
                            font-size: 1.8rem !important;
                            margin-bottom: 0.5rem !important;
                        }
                        .all-projects-page > div > div > p {
                            font-size: 0.9rem !important;
                            margin-bottom: 1.5rem !important;
                        }
                    }
                `}
            </style>
        </section >
    );
};

export default AllProjectsPage;
