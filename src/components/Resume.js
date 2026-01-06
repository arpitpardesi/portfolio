import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaExclamationTriangle, FaExternalLinkAlt } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';

const Resume = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const resumeUrl = settings.resumeUrl;
    const [iframeError, setIframeError] = useState(false);

    // Fallback if no URL is set
    if (!resumeUrl) {
        return (
            <div className="resume-container empty-state">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'fixed', top: '100px', left: '40px', zIndex: 1002 }}
                    className="back-nav"
                >
                    <button onClick={() => navigate(-1)} className="back-link">
                        <FaArrowLeft /> Back
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="error-content"
                >
                    <FaExclamationTriangle className="error-icon" />
                    <h2>Resume Not Available</h2>
                    <p>The resume has not been uploaded yet. Please check back later.</p>
                </motion.div>
                <style>{`
                    .resume-container {
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        // background: var(--bg-color); /* Handled globally */
                        color: var(--text-primary);
                        position: relative;
                        padding: 2rem;
                    }
                    .back-nav {
                        /* Mobile behavior handled by media query below if needed, 
                           but for empty state we can keep it simple or match exact responsive behavior */
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
                    @media (max-width: 768px) {
                        .back-nav {
                            position: static !important;
                            margin-bottom: 2rem;
                            display: inline-block;
                            align-self: flex-start;
                            margin-left: 2rem;
                            margin-top: 2rem;
                        }
                        .resume-container {
                            flex-direction: column;
                            justify-content: flex-start;
                            padding-top: 100px;
                        }
                    }
                    .error-content {
                        text-align: center;
                        max-width: 500px;
                        background: rgba(255, 255, 255, 0.04);
                        padding: 3rem;
                        border-radius: 20px;
                        border: 1px solid rgba(255, 255, 255, 0.06);
                        backdrop-filter: blur(10px);
                    }
                    .error-icon {
                        font-size: 3rem;
                        color: var(--accent-color);
                        margin-bottom: 1rem;
                    }
                    h2 { margin-bottom: 1rem; font-size: 2rem; }
                    p { color: var(--text-secondary); line-height: 1.6; font-size: 1.1rem; }
                `}</style>
            </div>
        );
    }

    return (
        <section className="section resume-page">
            <div className="container">
                {/* Fixed Back Button moved outside transformed container */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'fixed', top: '100px', left: '40px', zIndex: 1002 }}
                    className="back-nav"
                >
                    <button onClick={() => navigate(-1)} className="back-link">
                        <FaArrowLeft /> Back
                    </button>
                </motion.div>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="resume-hero"
                >
                    <h1 className="page-title"><span className="highlight">My</span> Resume</h1>
                    <p className="hero-subtitle">
                        A closer look at my professional journey, skills, and qualifications.
                    </p>

                    <div className="hero-actions">
                        <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-btn"
                        >
                            <FaDownload /> Download PDF
                        </a>
                    </div>
                </motion.div>

                {/* Resume Viewer */}
                <motion.div
                    className="resume-viewer-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {iframeError ? (
                        <div className="iframe-error">
                            <FaExclamationTriangle className="error-icon-small" />
                            <h3>Preview Unavailable</h3>
                            <p>We couldn't load the PDF directly in the page.</p>
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                                Open in New Tab <FaExternalLinkAlt style={{ fontSize: '0.9em' }} />
                            </a>
                        </div>
                    ) : (
                        <div className="iframe-wrapper">
                            <iframe
                                src={`${resumeUrl}#view=FitH`}
                                title="Resume PDF"
                                className="resume-iframe"
                                onError={() => setIframeError(true)}
                            />
                        </div>
                    )}
                </motion.div>
            </div>

            <style>{`
                .resume-page {
                    padding-top: 100px;
                    min-height: 100vh;
                    padding-bottom: 4rem;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                /* Hero Section */
                .resume-hero {
                    text-align: center;
                    margin-bottom: 3rem;
                    position: relative;
                }
                
                .page-title {
                    font-size: 4rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    letter-spacing: -1px;
                    line-height: 1.1;
                }
                
                .highlight {
                    color: var(--accent-color);
                }
                
                .hero-subtitle {
                    font-size: 1.2rem;
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .hero-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                }

                /* Navigation */
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

                /* Button Styles */
                .download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--accent-color);
                    color: white;
                    padding: 12px 28px;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.4);
                    border: 2px solid transparent;
                }

                .download-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.6);
                    background: transparent;
                    border-color: var(--accent-color);
                    color: var(--accent-color);
                }

                /* Viewer Container */
                .resume-viewer-container {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.08); // Slightly cleaner border
                    backdrop-filter: blur(10px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); // Deeper shadow for depth
                    position: relative;
                }
                
                // Top accent bar
                .resume-viewer-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
                    opacity: 0.7;
                }

                .iframe-wrapper {
                    position: relative;
                    width: 100%;
                    height: 800px;
                    background: #525659; // Typical PDF viewer background neutral
                }

                .resume-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                /* Error State */
                .iframe-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 5rem 2rem;
                    text-align: center;
                    min-height: 400px;
                }
                
                .error-icon-small {
                    font-size: 2.5rem;
                    color: var(--accent-color);
                    margin-bottom: 1rem;
                    opacity: 0.8;
                }
                
                .iframe-error h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                
                .btn-primary {
                    margin-top: 1.5rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.8rem 1.5rem;
                    background: rgba(var(--accent-rgb), 0.1);
                    color: var(--accent-color);
                    border: 1px solid var(--accent-color);
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                
                .btn-primary:hover {
                    background: var(--accent-color);
                    color: #fff;
                }

                @media (max-width: 768px) {
                    .resume-page {
                        padding-top: 80px;
                    }
                    
                    .page-title {
                        font-size: 2.5rem;
                    }
                    
                    .back-nav {
                        position: static !important;
                        margin-bottom: 2rem;
                        display: inline-block;
                    }
                    
                    .iframe-wrapper {
                        height: 500px;
                    }
                }
            `}</style>
        </section>
    );
};

export default Resume;
