import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
    return (
        <section id="contact" className="section contact-section" style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <motion.div
                className="container"
                style={{ maxWidth: '600px' }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="contact-label"
                    style={{ color: 'var(--accent-color)', fontSize: '1rem', marginBottom: '1.5rem' }}
                >
                    What's Next?
                </motion.p>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="contact-title"
                    style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}
                >
                    Get In Touch
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="contact-description"
                    style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '3rem' }}
                >
                    Although I'm not currently looking for any new opportunities, my inbox is always open. Whether you have a question or just want to say hi, I'll try my best to get back to you!
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.a
                        href="mailto:arpit.pardesi6@gmail.com"
                        className="contact-btn"
                        style={{
                            padding: '1.25rem 3rem',
                            border: '1px solid var(--accent-color)',
                            borderRadius: '4px',
                            color: 'var(--accent-color)',
                            fontWeight: '500',
                            fontSize: '1rem',
                            textDecoration: 'none',
                            display: 'inline-block',
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'transparent',
                            zIndex: 1
                        }}
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                            boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.4)'
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Say Hello
                    </motion.a>
                </motion.div>
            </motion.div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .contact-section {
                            padding: 80px 20px !important;
                            min-height: 50vh !important;
                        }
                        .contact-title {
                            font-size: 2.5rem !important;
                        }
                        .contact-description {
                            font-size: 1rem !important;
                            margin-bottom: 2rem !important;
                        }
                        .contact-btn {
                            padding: 1rem 2rem !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .contact-section {
                            padding: 60px 15px !important;
                        }
                        .contact-title {
                            font-size: 2rem !important;
                            margin-bottom: 1rem !important;
                        }
                        .contact-label {
                            font-size: 0.9rem !important;
                            margin-bottom: 1rem !important;
                        }
                        .contact-description {
                            font-size: 0.95rem !important;
                        }
                        .contact-btn {
                            padding: 0.875rem 1.75rem !important;
                            font-size: 0.9rem !important;
                        }
                    }
                `}
            </style>
        </section>
    );
};

export default Contact;

