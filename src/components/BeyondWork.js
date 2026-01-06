import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaCamera, FaMicrochip, FaBrain, FaRaspberryPi, FaShapes, FaArrowLeft } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const defaultHobbies = [
    {
        id: 'photography',
        title: "Photography",
        description: "Capturing the world meant to be seen. A collection of my favorite shots from travel and life.",
        icon: <FaCamera />,
        link: "/beyond-work/photography",
        color: "#f472b6"
    },
    {
        id: 'iot',
        title: "IOT & Smart Home",
        description: "Connecting the physical world to the digital. ESP32, MQTT, and Home Assistant automation stories.",
        icon: <FaMicrochip />,
        link: "/beyond-work/iot",
        color: "#0ea5e9"
    },
    {
        id: 'ai',
        title: "Artificial Intelligence",
        description: "Experiments with Computer Vision, LLMs, and Generative Art. Exploring the edge of possibilities.",
        icon: <FaBrain />,
        link: "/beyond-work/ai",
        color: "#8b5cf6"
    },
    {
        id: 'rpi',
        title: "Raspberry Pi",
        description: "My homelab heart. From Pi-hole clusters to retro gaming and custom servers.",
        icon: <FaRaspberryPi />,
        link: "/beyond-work/raspberry-pi",
        color: "#d946ef"
    }
];

const BeyondWork = () => {
    const navigate = useNavigate();
    const [hobbies, setHobbies] = useState(defaultHobbies);

    useEffect(() => {
        const fetchHobbies = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'hobbies'));
                if (!querySnapshot.empty) {
                    const dynamicHobbies = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            title: data.title,
                            description: data.description || data.desc, // handle both field names
                            icon: <FaShapes />, // Generic icon for database items unless we map them
                            // Check both 'link' (legacy) and 'category' (slug)
                            link: (data.link && data.link.startsWith('/')) ? data.link : `/beyond-work/${data.category || data.link || doc.id}`,
                            color: data.color || '#fff'
                        };
                    });

                    // Prefer database items. If database has items with same IDs as defaults (e.g. 'photography'), use DB version.
                    // Otherwise keep defaults.
                    const dbIds = new Set(dynamicHobbies.map(h => h.id));
                    const filteredDefaults = defaultHobbies.filter(h => !dbIds.has(h.id));

                    setHobbies([...filteredDefaults, ...dynamicHobbies]);
                }
            } catch (error) {
                console.error("Error fetching hobbies:", error);
            }
        };
        fetchHobbies();
    }, []);

    return (
        <section className="beyond-work-section" style={{
            padding: '120px 20px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1
        }}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'fixed', top: '100px', left: '40px', zIndex: 100 }}
                className="back-nav"
            >
                <button onClick={() => navigate(-1)} className="back-link">
                    <FaArrowLeft /> Back
                </button>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}>
                    <span style={{
                        color: 'var(--accent-color)',
                        textShadow: '0 0 40px rgba(var(--accent-rgb), 0.5)'
                    }}>
                        Beyond{' '}
                    </span>
                    <span style={{
                        color: 'var(--text-primary)'
                    }}>
                        Work
                    </span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.2rem' }}>
                    Exploring the cosmos of creativity, one hobby at a time.
                </p>
            </motion.div>

            <div className="hobby-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '1200px',
                padding: '0 20px'
            }}>
                {hobbies.map((hobby, index) => (
                    <Link to={hobby.link} key={hobby.id} style={{ textDecoration: 'none' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{
                                scale: 1.05,
                                y: -10,
                                boxShadow: `0 20px 40px -10px ${hobby.color}40`,
                                borderColor: hobby.color
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '3rem 2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                height: '100%',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{
                                fontSize: '3.5rem',
                                color: hobby.color,
                                marginBottom: '1.5rem',
                                filter: `drop-shadow(0 0 15px ${hobby.color}60)`
                            }}>
                                {hobby.icon}
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                color: 'var(--text-primary)',
                                marginBottom: '0.5rem',
                                fontWeight: '600'
                            }}>
                                {hobby.title}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                                {hobby.desc || hobby.description}
                            </p>
                        </motion.div>
                    </Link>
                ))}
            </div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .beyond-work-section {
                            padding: 100px 20px !important;
                        }
                        .hobby-grid {
                            grid-template-columns: 1fr !important;
                        }
                        .back-nav {
                            position: static !important;
                            margin-bottom: 2rem;
                            display: inline-block;
                            align-self: flex-start;
                        }
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
                `}
            </style>
        </section>
    );
};

export default BeyondWork;
