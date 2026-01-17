import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useSettings } from '../context/SettingsContext';

const About = () => {
    const { settings } = useSettings();
    const [skills, setSkills] = useState([]);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const skillsCollection = collection(db, 'skills');
                const snapshot = await getDocs(skillsCollection);

                if (!snapshot.empty) {
                    const fetchedSkills = snapshot.docs.map(doc => doc.data());
                    fetchedSkills.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                    setSkills(fetchedSkills.map(s => s.name));
                } else {
                    setSkills(['Python', 'FastAPI', 'LLM', 'SQL', 'Git', 'Github', 'Linux', 'Docker', 'React', 'Machine Learning']);
                }
            } catch (error) {
                console.error("Error fetching skills:", error);
                setSkills(['Python', 'FastAPI', 'LLM', 'SQL', 'Git', 'Github', 'Linux', 'Docker', 'React', 'Machine Learning']);
            }
        };

        fetchSkills();
    }, []);


    return (
        <section id="about" className="section about-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <motion.div
                className="container about-container"
                style={{ display: 'grid', gap: '3rem', alignItems: 'start' }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
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
                        {settings.aboutTitle || "About Me"}
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
                            {settings.aboutText1 || "Hello! I’m Arpit — a builder at heart, a learner by nature, and a firm believer that technology is just another form of storytelling."}
                            {/* Hello! My name is Arpit and I enjoy creating things that live on the internet and making sense of data. My journey started with a curiosity for how things work, which led me to the world of software engineering. */}
                        </p>
                        <p style={{ marginBottom: '1rem' }}>
                            {settings.aboutText2 || "My journey began with small sparks of curiosity: Why does this work? What happens if I change that? Can I build something new? Those questions carried me into the world of software, where creativity and precision dance together."}
                            {/* My journey started with curiosity for how systems interact with each other, which eventually led me into software engineering. Fast-forward to today, I work at Accenture as a Software Engineer (Application Development Analyst), focusing on data-driven platforms, scalable pipelines, automations, and full-stack applications. */}
                            {/* Fast-forward to today, and I've had the privilege of working at <span style={{ color: 'var(--accent-color)' }}>Accenture</span> as an Application Development Analyst. My main focus these days is building data-driven solutions and scalable web applications. */}
                        </p>
                        <p style={{ marginBottom: '1rem' }}>
                            {settings.aboutText3 || "Today, I craft data-driven solutions, develop applications, and design meaningful digital experiences. I love blending structure with art — from orchestrating raw ideas and data into solutions to writing code that feels elegant and alive."}
                        </p>
                        <p style={{ marginBottom: '1rem' }}>
                            {settings.aboutText4 || "When I’m not engineering solutions, you’ll find me experimenting: building IoT gadgets, teaching machines to see and talk, or creating playful interfaces powered by AI."}
                            {/* Outside of work, I explore hands-on projects with ESP32, Raspberry Pi, and embedded electronics. I enjoy experimenting with AI/ML, including projects like PixMob LED wristband control, real-time object detection using YOLO, AI companion apps, and hardware-integrated automation. */}
                        </p>

                        <p style={{ marginBottom: '2rem' }}>
                            {settings.aboutFooter || "Every project is a chance to explore, to improve, to understand a little more."}
                        </p>

                        <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>Here are a few technologies I've been working with recently:</p>

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

                        <div style={{ marginTop: '2.5rem' }}>
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
                        </div>
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
                            <img
                                src={settings.profileImage || "https://github.com/arpitpardesi.png"}
                                alt="Arpit Pardesi"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.5s ease',
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>

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

