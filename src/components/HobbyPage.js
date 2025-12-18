import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const HobbyPage = ({ title, icon, color, description, children }) => {
    return (
        <section className="hobby-page" style={{
            padding: '120px 20px',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 1
        }}>
            {/* Navigation */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'fixed', top: '100px', left: '40px', zIndex: 100 }}
                className="back-nav"
            >
                <Link to="/beyond-work" style={{
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
                    border: '1px solid var(--border-color)'
                }}>
                    <FaArrowLeft /> Back to Cosmos
                </Link>
            </motion.div>

            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <div style={{
                        fontSize: '4rem',
                        color: color,
                        marginBottom: '1rem',
                        filter: color.includes('var(') ? `drop-shadow(0 0 20px rgba(var(--accent-rgb), 0.4))` : `drop-shadow(0 0 20px ${color}60)`
                    }}>
                        {icon}
                    </div>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        color: color,
                        textShadow: color.includes('var(') ? `0 0 20px rgba(var(--accent-rgb), 0.25)` : `0 0 20px ${color}40`
                    }} className="hobby-title">
                        {title}
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.2rem',
                        maxWidth: '700px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        {description}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {children}
                </motion.div>
            </div>

            <style>
                {`
                    @media (max-width: 1024px) {
                        .back-nav {
                            position: static !important;
                            margin-bottom: 2rem;
                            display: inline-block;
                        }
                    }
                    @media (max-width: 768px) {
                        .hobby-title {
                            font-size: 2.5rem !important;
                        }
                    }
                `}
            </style>
        </section >
    );
};

export default HobbyPage;
