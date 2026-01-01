import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useSettings } from '../context/SettingsContext';

const About = () => {
    const [skills, setSkills] = useState([]);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const skillsCollection = collection(db, 'skills');
                const snapshot = await getDocs(skillsCollection);

                if (!snapshot.empty) {
                    const fetchedSkills = snapshot.docs.map(doc => doc.data());
                    // Sort by displayOrder
                    fetchedSkills.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                    setSkills(fetchedSkills.map(s => s.name));
                } else {
                    // Fallback if no skills in DB yet (or during load)
                    // Note: SkillsManager migration should handle data population.
                    setSkills(['Python', 'FastAPI', 'LLM', 'SQL', 'Git', 'Github', 'Linux', 'Docker', 'React', 'Machine Learning']);
                }
            } catch (error) {
                console.error("Error fetching skills:", error);
                setSkills(['Python', 'FastAPI', 'LLM', 'SQL', 'Git', 'Github', 'Linux', 'Docker', 'React', 'Machine Learning']);
            }
        };

        fetchSkills();
    }, []);


    const { settings } = useSettings();
    const content = settings?.home?.about || {};

    return (
        <section id="about" className="section about-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <div className="container about-container" style={{ display: 'grid', gap: '3rem', alignItems: 'start' }}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="about-text-section"
                >
                    <h2 style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '2rem',
                        marginBottom: '2.5rem',
                        fontWeight: '700'
                    }}>
                        <span style={{ color: 'var(--accent-color)', marginRight: '0.5rem', fontSize: '1.5rem' }}></span>
                        {content.title || "About Me"}
                        <span style={{
                            height: '1px',
                            background: 'var(--border-color)',
                            flexGrow: 1,
                            marginLeft: '1.5rem',
                            maxWidth: '300px'
                        }}></span>
                    </h2>

                    <div className="about-text" style={{ flex: 1, fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                        <p style={{ marginBottom: '1rem' }}>
                            {content.text1 || "Hello! I’m Arpit..."}
                        </p>
                        <p style={{ marginBottom: '1rem' }}>
                            {content.text2 || "My journey began..."}
                        </p>
                        <p style={{ marginBottom: '1rem' }}>
                            {content.text3 || "Today, I craft..."}
                        </p>

                        <p style={{ marginBottom: '2rem' }}>
                            Every project is a chance to explore, to improve, to understand a little more.
                        </p>

                        <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{content.techIntro || "Here are a few technologies I've been working with recently:"}</p>

                        <ul className="skills-list" style={{
                            display: 'grid',
                            gap: '12px',
                            listStyle: 'none',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.9rem'
                        }}>
                            {skills.map((skill, index) => (
                                <motion.li
                                    key={skill}
                                    style={{
                                        position: 'relative',
                                        padding: '8px 16px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'default',
                                        overflow: 'hidden'
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        scale: 1.05,
                                        borderColor: 'var(--accent-color)',
                                        background: 'rgba(var(--accent-rgb), 0.1)',
                                    }}
                                >
                                    <span style={{ color: 'var(--accent-color)', marginRight: '8px' }}>▹</span>
                                    {skill}
                                </motion.li>
                            ))}
                        </ul>

                        {/* <div style={{ marginTop: '2.5rem' }}>
                            <Link to="/about" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '10px 20px',
                                background: 'rgba(var(--accent-rgb), 0.1)',
                                border: '1px solid var(--accent-color)',
                                borderRadius: '4px',
                                color: 'var(--accent-color)',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                textDecoration: 'none'
                            }}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'var(--accent-color)';
                                    e.target.style.color = '#fff';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(var(--accent-rgb), 0.1)';
                                    e.target.style.color = 'var(--accent-color)';
                                }}
                            >
                                Want to know more about me? →
                            </Link>
                        </div> */}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ position: 'relative', height: '100%' }}
                    className="about-image-section"
                >
                    <motion.div
                        className="profile-image-wrapper"
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '300px',
                            margin: '0 auto',
                            aspectRatio: '1/1',
                            cursor: 'pointer'
                        }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            width: '100%',
                            height: '100%',
                            border: '2px solid var(--accent-color)',
                            borderRadius: '4px',
                            zIndex: 0,
                            transition: 'all 0.3s ease'
                        }} className="image-border" />

                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            background: '#333',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            filter: 'grayscale(100%) contrast(1)',
                            transition: 'all 0.3s ease',
                            zIndex: 1
                        }}
                            className="image-container"
                            onMouseOver={(e) => {
                                e.currentTarget.style.filter = 'none';
                                e.currentTarget.parentElement.querySelector('.image-border').style.transform = 'translate(-10px, -10px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.filter = 'grayscale(100%) contrast(1)';
                                e.currentTarget.parentElement.querySelector('.image-border').style.transform = 'translate(0, 0)';
                            }}
                        >
                            {/* Profile Image linked to LinkedIn */}
                            <a href="https://www.linkedin.com/in/arpitpardesi/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                                <img
                                    src={content.image || "https://github.com/arpitpardesi.png"}
                                    alt={settings?.profile?.name || "Arpit Pardesi"}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease',
                                    }}
                                />
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <style>
                {`
                    .about-container {
                        grid-template-columns: minmax(300px, 3fr) 2fr;
                    }
                    .skills-list {
                        grid-template-columns: repeat(2, minmax(140px, 200px));
                    }
                    
                    @media (max-width: 900px) {
                        .about-container {
                            grid-template-columns: 1fr;
                        }
                        .about-image-section {
                            order: -1;
                        }
                        .profile-image-wrapper {
                            max-width: 250px !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .about-section h2 {
                            font-size: 1.5rem !important;
                        }
                        .about-text {
                            font-size: 1rem !important;
                        }
                        .profile-image-wrapper {
                            max-width: 200px !important;
                        }
                        .skills-list {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default About;

