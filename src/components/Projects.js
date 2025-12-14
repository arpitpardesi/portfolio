import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaFolder } from 'react-icons/fa';

const Projects = () => {
    const projects = [{
            title: 'Project 1',
            description: 'Description of Project 1',
            tech: ['A', 'B', 'C'],
            github: '#',
            external: '#'
        },
        {
            title: 'Project 2',
            description: 'Description of Project 2',
            tech: ['A', 'B', 'C'],
            github: '#',
            external: '#'
        },
        {
            title: 'Project 3',
            description: 'Description of Project 3',
            tech: ['A', 'B', 'C'],
            github: '#',
            external: '#'
        },
        {
            title: 'Project 4',
            description: 'Description of Project 4',
            tech: ['A', 'B', 'C'],
            github: '#',
            external: '#'
        },
        {
            title: 'Project 5',
            description: 'Description of Project 5',
            tech: ['A', 'B', 'C'],
            github: '#',
            external: '#'
        },
    ];
    // const projects = [
    //     {
    //         title: 'E-Commerce Dashboard',
    //         description: 'A comprehensive dashboard for managing online stores, featuring real-time analytics and inventory management.',
    //         tech: ['React', 'D3.js', 'Firebase'],
    //         github: '#',
    //         external: '#'
    //     },
    //     {
    //         title: 'Task Management App',
    //         description: 'A collaborative task manager that lets teams organize and prioritize work with Kanban boards.',
    //         tech: ['Vue.js', 'Vuex', 'Node.js'],
    //         github: '#',
    //         external: '#'
    //     },
    //     {
    //         title: 'Weather Visualizer',
    //         description: 'An interactive weather application using OpenWeatherMap API to visualize global weather patterns.',
    //         tech: ['React', 'Chart.js', 'API'],
    //         github: '#',
    //         external: '#'
    //     },
    //     {
    //         title: 'Portfolio v1',
    //         description: 'My first portfolio website built with simple HTML/CSS and vanilla JavaScript.',
    //         tech: ['HTML', 'CSS', 'JS'],
    //         github: '#',
    //         external: '#'
    //     },
    //     {
    //         title: 'Chat Application',
    //         description: 'Real-time chat application with room support and private messaging.',
    //         tech: ['Socket.io', 'Express', 'React'],
    //         github: '#',
    //         external: '#'
    //     },
    //     {
    //         title: 'Recipe Finder',
    //         description: 'Search for recipes based on ingredients you have in your fridge.',
    //         tech: ['React', 'API', 'Sass'],
    //         github: '#',
    //         external: '#'
    //     }
    // ];

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
                    gap: '1.5rem'
                }}>
                    {projects.map((project, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -7 }}
                            className="project-card"
                            style={{
                                background: '#112240',
                                padding: '2rem 1.75rem',
                                borderRadius: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.25s ease',
                                cursor: 'default'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <FaFolder style={{ fontSize: '2.5rem', color: 'var(--accent-color)' }} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <a href={project.github} style={{ color: 'var(--text-secondary)' }}><FaGithub size={20} /></a>
                                    <a href={project.external} style={{ color: 'var(--text-secondary)' }}><FaExternalLinkAlt size={18} /></a>
                                </div>
                            </div>

                            <h3 className="project-title" style={{
                                marginBottom: '0.75rem',
                                fontSize: '1.35rem',
                                fontWeight: '600',
                                color: 'var(--text-primary)'
                            }}>
                                {project.title}
                            </h3>

                            <p className="project-description" style={{
                                color: 'var(--text-secondary)',
                                marginBottom: '2rem',
                                fontSize: '0.9rem'
                            }}>
                                {project.description}
                            </p>

                            <div style={{ marginTop: 'auto' }}>
                                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                    {project.tech.map((t, index) => (
                                        <li key={index}>{t}</li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
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

