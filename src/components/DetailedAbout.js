import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
    FaBriefcase, FaGraduationCap, FaDownload, FaCode, FaMicrochip,
    FaCamera, FaRocket, FaLightbulb, FaArrowLeft
} from 'react-icons/fa';

const DetailedAbout = () => {
    const [experienceTimeline, setExperienceTimeline] = useState([]);
    const [educationTimeline, setEducationTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'timeline'));
                const allTimelineItems = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort by dateFrom (most recent first)
                const sortByDate = (items) => items.sort((a, b) => {
                    const dateA = new Date(a.dateFrom || '1900-01-01');
                    const dateB = new Date(b.dateFrom || '1900-01-01');
                    return dateB - dateA;
                });

                // Split by category
                setExperienceTimeline(sortByDate(allTimelineItems.filter(item => item.category === 'experience')));
                setEducationTimeline(sortByDate(allTimelineItems.filter(item => item.category === 'education')));
            } catch (error) {
                console.error('Error fetching timeline:', error);
            }
            setLoading(false);
        };

        fetchTimeline();
    }, []);

    const skills = [
        "Python", "React", "FastAPI", "JavaScript", "TypeScript",
        "Node.js", "PostgreSQL", "MySQL", "Docker", "AWS",
        "Git", "Linux", "Tailwind CSS", "Framer Motion",
        "LLMs & AI", "Machine Learning", "IoT", "Raspberry Pi"
    ];

    return (
        <section className="section detailed-about-section">
            <div className="container">
                {/* 1. Hero Section with Flipped Colors */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="about-hero"
                >
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ position: 'fixed', top: '100px', left: '40px', zIndex: 100 }}
                        className="back-nav"
                    >
                        <Link to="/" className="back-link">
                            <FaArrowLeft /> Back
                        </Link>
                    </motion.div>
                    <div className="hero-content">
                        <h1>
                            <span className="highlight">About</span> Me
                        </h1>
                        <p className="hero-subtitle">
                            Explorer. Engineer. Creator. <br />
                            Turning coffee into code and ideas into reality.
                        </p>
                    </div>
                </motion.div>

                <div className="detailed-content">
                    {/* 2. The Story */}
                    <div className="content-block story-block">
                        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <motion.h3
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                >
                                    The Origin Story
                                </motion.h3>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                                        I'm a developer who loves building things that matter. Whether it's crafting seamless web experiences,
                                        architecting scalable backends, or experimenting with AI and machine learning, I'm driven by the joy
                                        of creating solutions that make a difference.
                                    </p>
                                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                                        Currently pursuing B.Tech in Computer Science at MPSTME, Mumbai, I combine academic knowledge with
                                        hands-on experience in full-stack development, machine learning, and cloud technologies.
                                    </p>
                                    <p style={{ lineHeight: '1.8' }}>
                                        When I'm not coding, you'll find me tinkering with IoT devices, exploring photography,
                                        or diving deep into the latest AI research. Every project is an opportunity to learn,
                                        grow, and push the boundaries of what's possible.
                                    </p>
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                style={{ flexShrink: 0 }}
                            >
                                <div style={{
                                    width: '280px',
                                    height: '280px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '4px solid var(--accent-color)',
                                    boxShadow: '0 0 40px rgba(var(--accent-rgb), 0.6)',
                                    position: 'relative'
                                }}>
                                    <img
                                        src="https://github.com/arpitpardesi.png"
                                        alt="Arpit Pardesi"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* 3. Journey Timeline - Experience */}
                    <div className="content-block timeline-block">
                        <h3>Professional Journey</h3>
                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</p>
                        ) : (
                            <div className="timeline">
                                {experienceTimeline.map((item, index) => {
                                    const isCurrent = item.isPresent || (item.dateTo && new Date(item.dateTo) >= new Date());
                                    return (
                                        <motion.div
                                            key={item.id}
                                            className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'} ${isCurrent ? 'current-entry' : ''}`}
                                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <div className="timeline-content">
                                                <div className="date">{item.dateRange}</div>
                                                <h4><FaBriefcase className="inline-icon" />{item.title}</h4>
                                                {item.subtitle && <h5>{item.subtitle}</h5>}
                                                {item.location && (
                                                    <div style={{
                                                        fontSize: '0.9rem',
                                                        color: 'var(--text-secondary)',
                                                        marginTop: '0.25rem',
                                                        marginBottom: '0.5rem',
                                                        fontStyle: 'italic',
                                                        opacity: 0.8
                                                    }}>
                                                        📍 {item.location}
                                                    </div>
                                                )}
                                                <p>{item.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 4. Education Timeline */}
                    <div className="content-block timeline-block">
                        <h3>Education</h3>
                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</p>
                        ) : (
                            <div className="timeline">
                                {educationTimeline.map((item, index) => {
                                    const isCurrent = item.isPresent || (item.dateTo && new Date(item.dateTo) >= new Date());
                                    return (
                                        <motion.div
                                            key={item.id}
                                            className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'} ${isCurrent ? 'current-entry' : ''}`}
                                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <div className="timeline-content">
                                                <div className="date">{item.dateRange}</div>
                                                <h4><FaGraduationCap className="inline-icon" />{item.title}</h4>
                                                {item.subtitle && <h5>{item.subtitle}</h5>}
                                                {item.location && (
                                                    <div style={{
                                                        fontSize: '0.9rem',
                                                        color: 'var(--text-secondary)',
                                                        marginTop: '0.25rem',
                                                        marginBottom: '0.5rem',
                                                        fontStyle: 'italic',
                                                        opacity: 0.8
                                                    }}>
                                                        📍 {item.location}
                                                    </div>
                                                )}
                                                <p>{item.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 5. Simple Elegant Skills */}
                    <div className="content-block skills-block">
                        <h3>Technical Arsenal</h3>
                        <motion.div
                            className="skills-elegant-grid"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            {skills.map((skill, index) => (
                                <motion.div
                                    key={skill}
                                    className="skill-tag"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    {skill}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* 6. Enhanced Beyond Code */}
                    <div className="content-block beyond-block">
                        <h3>Beyond Code</h3>
                        <p className="section-intro">
                            When I step away from the terminal, you'll find me exploring the intersection of technology and creativity —
                            from capturing moments through photography to building smart IoT devices and experimenting with AI.
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="beyond-cta"
                        >
                            <Link to="/beyond-work" className="beyond-link-btn">
                                Explore My Interests →
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Floating Resume Button */}
            <motion.a
                href="/resume.pdf"
                target="_blank"
                className="floating-resume-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
            >
                <FaDownload />
                <span>Resume</span>
            </motion.a>

            <style>{`
                .detailed-about-section {
                    padding-top: 100px;
                    min-height: 100vh;
                }

                /* Hero Section */
                .about-hero {
                    text-align: center;
                    margin-bottom: 6rem;
                    position: relative;
                    padding: 2rem 0;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 1rem;
                    font-weight: 500;
                    padding: 8px 16px;
                    border-radius: 50px;
                    background: rgba(10, 10, 10, 0.5);
                    backdrop-filter: blur(5px);
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }
                .back-link:hover {
                    background: rgba(var(--accent-rgb), 0.1);
                    border-color: var(--accent-color);
                    color: var(--accent-color);
                    transform: translateX(-4px);
                }
                .hero-content {
                    text-align: center;
                }
                .about-hero h1 {
                    font-size: 4rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    letter-spacing: -1px;
                }
                .highlight {
                    color: var(--accent-color);
                    position: relative;
                    display: inline-block;
                }
                .hero-subtitle {
                    font-size: 1.5rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    max-width: 700px;
                    margin: 0 auto;
                }

                /* Floating Resume Button */
                .floating-resume-btn {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--accent-color);
                    color: #fff;
                    padding: 1rem 1.5rem;
                    border-radius: 50px;
                    font-weight: 600;
                    text-decoration: none;
                    box-shadow: 0 4px 20px rgba(var(--accent-rgb), 0.5);
                    z-index: 1000;
                    transition: all 0.3s ease;
                    font-size: 1rem;
                }
                .floating-resume-btn svg {
                    font-size: 1.1rem;
                    transition: transform 0.3s ease;
                }
                .floating-resume-btn span {
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .floating-resume-btn:hover {
                    box-shadow: 0 6px 30px rgba(var(--accent-rgb), 0.7);
                    transform: translateY(-2px);
                    color: #fff;
                }
                .floating-resume-btn:hover svg {
                    transform: translateY(-2px);
                }

                /* Layout */
                .detailed-content {
                    max-width: 900px;
                    margin: 0 auto;
                    display: grid;
                    gap: 7rem;
                }
                .content-block h3 {
                    font-size: 2.5rem;
                    margin-bottom: 2.5rem;
                    color: var(--text-primary);
                }
                .text-content p {
                    font-size: 1.15rem;
                    color: var(--text-secondary);
                    margin-bottom: 1.2rem;
                    line-height: 1.8;
                }

                /* Timeline */
                .timeline {
                    position: relative;
                    padding: 2rem 0;
                }
                .timeline::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 50%;
                    width: 2px;
                    background: var(--border-color);
                    transform: translateX(-50%);
                }
                .timeline-item {
                    margin-bottom: 4rem;
                    position: relative;
                    width: 50%;
                }
                .timeline-item.left {
                    left: 0;
                    padding-right: 3rem;
                    text-align: right;
                }
                .timeline-item.right {
                    left: 50%;
                    padding-left: 3rem;
                    text-align: left;
                }
                .timeline-content {
                    background: rgba(255, 255, 255, 0.04);
                    padding: 1.75rem;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    position: relative;
                    transition: all 0.3s ease;
                    overflow: hidden;
                }
                .timeline-content::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--accent-color);
                    opacity: 0.5;
                    transition: opacity 0.3s ease;
                }
                /* Accent bar on right side for left-positioned items */
                .timeline-item.left .timeline-content::before {
                    right: 0;
                    left: auto;
                }
                /* Accent bar on left side for right-positioned items */
                .timeline-item.right .timeline-content::before {
                    left: 0;
                    right: auto;
                }
                .timeline-content:hover::before {
                    opacity: 1;
                }
                .timeline-content:hover {
                    background: rgba(255, 255, 255, 0.06);
                    transform: translateX(4px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
                    border-color: rgba(var(--accent-rgb), 0.3);
                }
                .timeline-item::after {
                    content: '';
                    position: absolute;
                    top: 20px;
                    width: 16px;
                    height: 16px;
                    background: var(--bg-color);
                    border: 3px solid var(--accent-color);
                    border-radius: 50%;
                    z-index: 1;
                    box-shadow: 0 0 0 4px var(--bg-color);
                }
                .timeline-item.left::after {
                    right: -8px;
                }
                .timeline-item.right::after {
                    left: -8px;
                }
                .inline-icon {
                    margin-right: 8px;
                    color: var(--accent-color);
                }
                .date {
                    display: inline-block;
                    background: rgba(var(--accent-rgb), 0.15);
                    color: var(--accent-color);
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    font-family: var(--font-mono);
                    letter-spacing: 0.5px;
                }
                .timeline-content h4 {
                    font-size: 1.4rem;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                    font-weight: 700;
                    line-height: 1.3;
                }
                .timeline-content h4 .inline-icon {
                    color: var(--accent-color);
                    font-size: 1.2rem;
                    margin-right: 0.5rem;
                }
                .timeline-content h5 {
                    font-size: 1.1rem;
                    color: var(--accent-color);
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                    opacity: 0.9;
                }
                .timeline-content p {
                    color: var(--text-secondary);
                    line-height: 1.8;
                    font-size: 1rem;
                    margin-top: 1rem;
                }

                /* Simple Elegant Skills */
                .skills-elegant-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    justify-content: center;
                }
                .skill-tag {
                    padding: 0.7rem 1.4rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 50px;
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    transition: all 0.3s;
                    font-weight: 500;
                }
                .skill-tag:hover {
                    border-color: var(--accent-color);
                    color: var(--accent-color);
                    background: rgba(var(--accent-rgb), 0.08);
                    transform: translateY(-2px);
                }

                /* Enhanced Beyond Code */
                .section-intro {
                    font-size: 1.2rem;
                    color: var(--text-secondary);
                    margin-bottom: 3rem;
                    text-align: center;
                    line-height: 1.8;
                }
                .beyond-cta {
                    text-align: center;
                }
                .beyond-link-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 14px 32px;
                    background: rgba(var(--accent-rgb), 0.1);
                    border: 2px solid var(--accent-color);
                    border-radius: 50px;
                    color: var(--accent-color);
                    font-weight: 600;
                    font-size: 1.1rem;
                    text-decoration: none;
                    transition: all 0.3s;
                }
                .beyond-link-btn:hover {
                    background: var(--accent-color);
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.4);
                }

                /* Glow effect for current/ongoing entries */
                .current-entry .timeline-content {
                    position: relative;
                    animation: glow-pulse 3s ease-in-out infinite;
                    box-shadow: 0 0 25px rgba(var(--accent-rgb), 0.4);
                    border: 2px solid rgba(var(--accent-rgb), 0.3);
                }

                @keyframes glow-pulse {
                    0%, 100% {
                        box-shadow: 0 0 25px rgba(var(--accent-rgb), 0.4);
                    }
                    50% {
                        box-shadow: 0 0 35px rgba(var(--accent-rgb), 0.7), 0 0 50px rgba(var(--accent-rgb), 0.3);
                    }
                }

                @media (max-width: 768px) {
                    .about-hero h1 { font-size: 2.5rem; }
                    .timeline::before { left: 20px; }
                    .timeline-item { width: 100%; padding-left: 3rem !important; padding-right: 0 !important; text-align: left !important; left: 0 !important; }
                    .timeline-item::after { left: 12px !important; }
                    .beyond-grid { grid-template-columns: 1fr; }
                    .content-block h3 { font-size: 2rem; }
                    .back-nav {
                        position: static !important;
                        margin-bottom: 2rem;
                        display: inline-block;
                    }
                    .floating-resume-btn {
                        bottom: 1rem;
                        right: 1rem;
                        padding: 0.8rem 1.2rem;
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default DetailedAbout;
