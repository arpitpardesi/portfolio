import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaInstagram, FaRegCopy, FaCheck, FaEnvelope } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
    const { settings } = useSettings();
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(settings.contactEmail || 'arpit.pardesi6@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const socialLinks = [
        { icon: <FaGithub />, href: settings.githubUrl || 'https://github.com/arpitpardesi' },
        { icon: <FaLinkedin />, href: settings.linkedinUrl || 'https://www.linkedin.com/in/arpitpardesi/' },
        { icon: <FaXTwitter />, href: settings.twitterUrl || 'https://x.com/arpit_pardesi' },
        { icon: <FaInstagram />, href: settings.instagramUrl || 'https://www.instagram.com/arpitpardesi' },
    ];

    return (
        <section id="contact" className="section contact-section" style={{
            padding: '100px 20px',
            textAlign: 'center',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, rgba(0,0,0,0) 70%)',
                zIndex: -1,
                pointerEvents: 'none',
                filter: 'blur(60px)',
                opacity: 0.6
            }} />

            <motion.div
                className="container"
                style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="contact-label"
                    style={{
                        color: 'var(--accent-color)',
                        fontSize: '1.2rem',
                        marginBottom: '1.5rem',
                        fontWeight: '500',
                        letterSpacing: '1px'
                    }}
                >
                    {settings.contactSubtitle || "What's Next?"}
                </motion.p>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="contact-title"
                    style={{
                        fontSize: '4rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        color: 'var(--text-primary)',
                        letterSpacing: '-1px'
                    }}
                >
                    {settings.contactTitle || 'Get In Touch'}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="contact-description"
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.2rem',
                        lineHeight: '1.7',
                        marginBottom: '3.5rem',
                        maxWidth: '580px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                >
                    {settings.contactText || "I'm currently looking for new opportunities, and my inbox is always open. Whether you have a question, a project idea, or just want to say hi, I'll try my best to get back to you!"}
                </motion.p>

                <motion.div
                    className="cta-group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    style={{
                        display: 'flex',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginBottom: '4rem'
                    }}
                >
                    <motion.a
                        href={`mailto:${settings.contactEmail || 'arpit.pardesi6@gmail.com'}`}
                        className="contact-btn primary"
                        style={{
                            padding: '1rem 2.5rem',
                            borderRadius: '8px',
                            background: 'transparent',
                            border: '1px solid var(--accent-color)',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                            boxShadow: '0 0 30px rgba(var(--accent-rgb), 0.2)'
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaEnvelope />
                        {settings.contactCta || 'Say Hello'}
                    </motion.a>

                    <div style={{ position: 'relative' }}>
                        <motion.button
                            onClick={handleCopyEmail}
                            className="contact-btn secondary"
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.3s ease'
                            }}
                            whileHover={{
                                scale: 1.05,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.2)'
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {copied ? <FaCheck style={{ color: '#10b981' }} /> : <FaRegCopy />}
                            {copied ? 'Copied!' : 'Copy Email'}
                        </motion.button>

                        <AnimatePresence>
                            {copied && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '-40px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: '#10b981',
                                        color: '#fff',
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        pointerEvents: 'none',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Email copied to clipboard!
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Social Links Row */}
                <motion.div
                    className="social-links-row"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2.5rem',
                        marginTop: 'auto'
                    }}
                >
                    {socialLinks.map((link, index) => (
                        <motion.a
                            key={index}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                color: 'var(--text-secondary)',
                                fontSize: '1.8rem',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            whileHover={{
                                y: -5,
                                color: 'var(--accent-color)',
                                transition: { duration: 0.2 }
                            }}
                        >
                            {link.icon}
                        </motion.a>
                    ))}
                </motion.div>
            </motion.div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .contact-section {
                            padding: 80px 20px !important;
                            min-height: auto !important;
                        }
                        .contact-title {
                            font-size: 2.8rem !important;
                        }
                        .contact-description {
                            font-size: 1.1rem !important;
                            margin-bottom: 2.5rem !important;
                        }
                        .cta-group {
                            flex-direction: column;
                            gap: 1rem;
                            width: 100%;
                            margin-bottom: 3rem !important;
                        }
                        .contact-btn {
                            width: 100%;
                            justify-content: center;
                        }
                        .social-links-row {
                            gap: 2rem !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .contact-title {
                            font-size: 2.2rem !important;
                        }
                        .contact-label {
                            font-size: 1rem !important;
                        }
                        .contact-description {
                            font-size: 1rem !important;
                        }
                        .social-links-row a {
                            font-size: 1.5rem !important;
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default Contact;
