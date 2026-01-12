import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const Hero = ({ startAnimations = true }) => {
    const { settings } = useSettings();
    const name = settings.heroName || "Arpit Pardesi.";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 200,
            },
        },
    };

    const typewriterVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section
            id="hero"
            className="hero-section"
            style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1, // Above particles
                padding: '0 20px'
            }}
        >
            {/* Background Gradient Blob */}
            <div
                className="hero-blob"
                style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                    zIndex: -1,
                    opacity: 0.5,
                    filter: 'blur(60px)',
                }}
            />

            <motion.div
                className="container"
                style={{ textAlign: 'center' }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.p
                    variants={typewriterVariants}
                    initial="hidden"
                    animate={startAnimations ? "visible" : "hidden"}
                    className="hero-intro"
                    style={{
                        color: 'var(--accent-color)',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontSize: '1rem',
                        display: 'inline-block',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        borderRight: '2px solid var(--accent-color)',
                        animation: 'blink-caret 0.75s step-end infinite'
                    }}
                >
                    {settings.heroIntro || "Hi, my name is"}
                </motion.p>
                <style>
                    {`
                @keyframes blink-caret {
                    from, to { border-color: transparent }
                    50% { border-color: var(--accent-color) }
                }
            `}
                </style>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={startAnimations ? "visible" : "hidden"}
                    style={{ marginBottom: '1rem' }}
                >
                    {name.split("").map((char, index) => (
                        <motion.span
                            key={index}
                            variants={letterVariants}
                            whileHover={{
                                scale: 1.25,
                                color: '#ffffff',
                                textShadow: '0 0 20px #fff, 0 0 40px var(--accent-color)',
                                transition: { duration: 0.2 }
                            }}
                            style={{
                                fontSize: 'clamp(3rem, 8vw, 6rem)',
                                fontWeight: '700',
                                lineHeight: '1.1',
                                display: 'inline-block',
                                color: '#ffffff',
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
                                filter: 'drop-shadow(0 0 8px var(--accent-glow))',
                                cursor: 'default',
                                letterSpacing: '2px',
                                transition: 'text-shadow 0.3s ease, filter 0.3s ease'
                            }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={startAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="hero-subtitle"
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        fontWeight: '700',
                        color: 'var(--text-secondary)',
                        marginBottom: '2rem'
                    }}
                >
                    {settings.heroSubtitle || "I turn curiosity into creation."}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={startAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ delay: 1.7, duration: 0.8 }}
                    className="hero-description"
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto 3rem auto',
                        color: 'var(--text-secondary)',
                        fontSize: '1.1rem'
                    }}
                >
                    {settings.heroDescription || "I weave together data, design, and code to build experiences that feel intuitive and alive. As a Software Developer, I explore the space where logic meets imagination — architecting solutions, solving puzzles, and shaping ideas into something you can see, feel, and use."}
                    {/* I'm a Software Engineer at Accenture, specializing in Data Engineering and Full Stack Development. I build accessible, pixel-perfect, and performant web experiences while diving deep into data with Python and Cloud technologies. */}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={startAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ delay: 1.9, duration: 0.5 }}
                >
                    <motion.a
                        href={settings.heroCtaLink || "#projects"}
                        onClick={(e) => {
                            e.preventDefault();
                            const projects = document.getElementById('projects');
                            if (projects) {
                                projects.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="hero-cta"
                        style={{
                            padding: '1rem 2.5rem',
                            border: '1px solid var(--accent-color)',
                            borderRadius: '4px',
                            color: 'var(--accent-color)',
                            fontWeight: '500',
                            fontSize: '1rem',
                            textDecoration: 'none',
                            display: 'inline-block',
                            position: 'relative',
                            overflow: 'hidden' // For potential fill effect
                        }}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0px 0px 8px var(--accent-color)",
                            backgroundColor: "rgba(var(--accent-rgb), 0.1)"
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {settings.heroCtaText || "Check out my work"}
                    </motion.a>
                </motion.div>

            </motion.div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .hero-blob {
                            width: 400px !important;
                            height: 400px !important;
                            right: -20% !important;
                        }
                        .hero-description {
                            font-size: 1rem !important;
                            margin-bottom: 2rem !important;
                        }
                        .hero-cta {
                            padding: 0.875rem 2rem !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .hero-section {
                            padding: 0 15px !important;
                        }
                        .hero-blob {
                            width: 300px !important;
                            height: 300px !important;
                            top: -10% !important;
                            right: -30% !important;
                        }
                        .hero-intro {
                            font-size: 0.85rem !important;
                            letter-spacing: 1px !important;
                        }
                        .hero-description {
                            font-size: 0.95rem !important;
                        }
                        .hero-cta {
                            padding: 0.75rem 1.5rem !important;
                            font-size: 0.9rem !important;
                        }
                    }

                    @media (max-height: 500px) and (orientation: landscape) {
                         /* Reduce font sizes for short landscape screens */
                        .hero-section span {
                            font-size: 3rem !important; /* Name */
                        }
                        .hero-subtitle {
                            font-size: 1.5rem !important;
                            margin-bottom: 1rem !important;
                        }
                        .hero-description {
                            font-size: 0.9rem !important;
                            margin-bottom: 1.5rem !important;
                            max-width: 500px !important;
                        }
                        .hero-blob {
                            width: 300px !important;
                            height: 300px !important;
                            opacity: 0.3 !important;
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default Hero;