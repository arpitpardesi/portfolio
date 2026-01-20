import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
    FaBriefcase, FaGraduationCap, FaDownload, FaArrowLeft
} from 'react-icons/fa';

const DetailedAbout = () => {
    const navigate = useNavigate();
    const [experienceTimeline, setExperienceTimeline] = useState([]);
    const [educationTimeline, setEducationTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [skills, setSkills] = useState([]);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'timeline'));
                const allTimelineItems = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const sortByDate = (items) => items.sort((a, b) => {
                    const dateA = new Date(a.dateFrom || '1900-01-01');
                    const dateB = new Date(b.dateFrom || '1900-01-01');
                    return dateB - dateA;
                });

                setExperienceTimeline(sortByDate(allTimelineItems.filter(item => item.category === 'experience')));
                setEducationTimeline(sortByDate(allTimelineItems.filter(item => item.category === 'education')));
            } catch (error) {
                console.error('Error fetching timeline:', error);
            }
            setLoading(false);
        };

        fetchTimeline();
    }, []);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const skillsCollection = collection(db, 'skills');
                const snapshot = await getDocs(skillsCollection);

                if (!snapshot.empty) {
                    const fetchedSkills = snapshot.docs.map(doc => doc.data());
                    setSkills(fetchedSkills.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
                } else {
                    setSkills([
                        { name: 'Python', category: 'Backend', proficiency: 90, displayOrder: 1 },
                        { name: 'React', category: 'Frontend', proficiency: 85, displayOrder: 2 },
                        { name: 'FastAPI', category: 'Backend', proficiency: 85, displayOrder: 3 },
                        { name: 'Tensorflow', category: 'AI/ML', proficiency: 80, displayOrder: 4 },
                        { name: 'PostgreSQL', category: 'Database', proficiency: 75, displayOrder: 5 },
                        { name: 'Docker', category: 'DevOps', proficiency: 70, displayOrder: 6 }
                    ]);
                }
            } catch (error) {
                console.error("Error fetching skills:", error);
            }
        };

        fetchSkills();
    }, []);

    return (
        <section className="section detailed-about-section">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'fixed', top: 'calc(100px + env(safe-area-inset-top))', left: '40px', zIndex: 100 }}
                    className="back-nav"
                >
                    <button onClick={() => navigate(-1)} className="back-link">
                        <FaArrowLeft /> Back
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="about-hero"
                >
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
                                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                                        My journey didn't start with code; it started with curiosity. I was the kid who took apart remote controls just to see the circuit boards, fascinated by the invisible logic that made things work. That same curiosity eventually led me to the terminal, where I discovered that software engineering isn't just about syntax—it's about creating something from nothing.
                                    </p>
                                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                                        Today, I operate at the intersection of creativity and engineering. Whether I'm architecting scalable backends, training machine learning models, or crafting pixel-perfect interfaces, my goal is always the same: to build experiences that feel intuitive, human, and alive. I believe that technology, at its best, should disappear, leaving only the solution it provides.
                                    </p>
                                    <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                                        Every commit is a new chapter, and every bug is a puzzle waiting to be solved. From the structured logic of distributed systems to the boundless potential of AI, I am constantly exploring the edge of what's possible—turning abstract ideas into tangible reality.
                                    </p>
                                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                                        To me, code is a form of modern-day alchemy. It's the only medium where you can speak a language of pure logic and have it manifest as art, utility, and connection across the globe. Whether it's a simple script or a complex neural network, the thrill of typing <code>run</code> and watching a static idea come to life never gets old.
                                    </p>
                                    <div style={{ marginTop: '2rem', borderLeft: '3px solid var(--accent-color)', paddingLeft: '1.5rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                        "The only way of discovering the limits of the possible is to venture a little way past them into the impossible."
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-color)', fontStyle: 'normal', fontWeight: '500' }}>— Arthur C. Clarke</div>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                style={{ flexShrink: 0 }}
                            >
                                <div className="profile-image-container" style={{
                                    width: '380px',
                                    height: '380px',
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
                                                <h4><FaBriefcase className="inline-icon" />{item.title ? item.title.replace('Developlent', 'Development') : item.title}</h4>
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

                    {/* 5. Skills */}
                    <div className="content-block skills-block">
                        <h3>Technical Arsenal</h3>
                        <motion.div
                            className="skills-elegant-grid"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="skills-elegant-grid" style={{ justifyContent: 'center' }}>
                                {skills.map((skill, index) => (
                                    <motion.div
                                        key={skill.name}
                                        className="skill-tag"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.03 }}
                                        title={`Proficiency: ${skill.proficiency}%`}
                                    >
                                        {skill.name}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* 6. Beyond Code */}
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

            {/* Resume Button */}
            <motion.div
                className="floating-resume-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
            >
                <Link to="/resume" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none' }}>
                    <FaDownload />
                    <span>Resume</span>
                </Link>
            </motion.div>

            <style>{`
                .detailed-about-section {
                    padding-top: calc(100px + env(safe-area-inset-top));
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
                    cursor: pointer;
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
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    gap: 7rem;
                }
                .content-block h3 {
                    font-size: 2rem;
                    margin-bottom: 2.5rem;
                    color: var(--text-primary);
                }
                .text-content p {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    margin-bottom: 1.2rem;
                    line-height: 1.6;
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
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    margin-bottom: 3rem;
                    text-align: center;
                    line-height: 1.6;
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

                .date {
                    display: inline-block;
                    background: rgba(var(--accent-rgb), 0.25);
                    color: #fff;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    font-family: var(--font-mono);
                    letter-spacing: 0.5px;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
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

                @media (max-height: 500px) and (orientation: landscape) {
                    .detailed-about-section {
                        padding-top: 60px !important;
                    }
                    .about-hero {
                         margin-bottom: 2rem !important;
                         padding: 0 !important;
                    }
                    .about-hero h1 {
                         font-size: 2.5rem !important;
                         margin-bottom: 0.5rem !important;
                    }
                    .hero-subtitle {
                         font-size: 1.1rem !important;
                         margin-bottom: 2rem !important;
                    }
                    .profile-image-container {
                         width: 200px !important;
                         height: 200px !important;
                         margin: 0 auto;
                    }
                    .content-block {
                         gap: 2rem !important;
                    }
                    .detailed-content {
                         gap: 3rem !important;
                    }
                    /* Timeline fixes for landscape */
                     .timeline-item {
                        margin-bottom: 2rem;
                     }
                     .floating-resume-btn {
                        padding: 0.5rem 1rem;
                        bottom: 0.5rem;
                        right: 4rem; /* Move left to avoid other icons */
                        transform: scale(0.8);
                        transform-origin: bottom right;
                    }
                }

                @media (max-height: 500px) and (orientation: landscape) {
                    .floating-resume-btn {
                        padding: 0.5rem 1rem;
                        bottom: 0.5rem;
                        right: 4rem; /* Move left to avoid other icons */
                        transform: scale(0.8);
                        transform-origin: bottom right;
                    }
                    .detailed-about-section {
                        padding-top: 80px;
                    }
                    /* Timeline fixes for landscape */
                     .timeline-item {
                        margin-bottom: 2rem;
                     }
                }
            `}</style>
        </section>
    );
};

export default DetailedAbout;
