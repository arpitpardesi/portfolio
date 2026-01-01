import React from 'react';
// import { Link } from 'react-router-dom';
// import { FaGithub, FaLinkedin, FaInstagram, FaUserLock } from 'react-icons/fa';
// import { FaXTwitter } from 'react-icons/fa6';
import VisitorCounter from './VisitorCounter';

const Footer = () => {
    // const socialLinks = [
    //     { icon: <FaGithub />, href: 'https://github.com/arpitpardesi' },
    //     { icon: <FaLinkedin />, href: 'https://www.linkedin.com/in/arpitpardesi/' },
    //     { icon: <FaXTwitter />, href: 'https://twitter.com' },
    //     { icon: <FaInstagram />, href: 'https://instagram.com' },
    // ];

    return (
        <footer className="footer" style={{ padding: '1.25rem 0', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            
            {/* for showing social links and admin login button */}
            
            {/* <div style={{ display: 'none', gap: '1.5rem', justifyContent: 'center', marginBottom: '1rem', alignItems: 'center' }} className="mobile-socials">
                {socialLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', transition: 'color 0.3s ease' }}
                    >
                        {link.icon}
                    </a>
                ))}
                <Link
                    to="/login"
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.3rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.5
                    }}
                    className="admin-login-btn"
                    title="Admin Login"
                >
                    <FaUserLock />
                </Link>
            </div> */}
            <div className="footer-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                    href="https://github.com/arpitpardesi"
                    target="_blank"
                    rel="noreferrer"
                    className="footer-link"
                    style={{
                        fontFamily: 'var(--font-mono)',
                        transition: 'color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                    Designed & Developed by Arpit Pardesi
                </a>
                <span className="footer-divider" style={{ opacity: 0.5 }}>|</span>
                <span className="footer-copyright" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    © {new Date().getFullYear()} All rights reserved.
                </span>
            </div>

            <VisitorCounter />

            <style>
                {`
            .mobile-socials a:hover,
            .mobile-socials .admin-login-btn:hover {
                color: var(--accent-color) !important;
                transform: translateY(-2px);
            }
            
            @media (max-width: 768px) {
                .mobile-socials {
                    display: flex !important;
                }
                .footer {
                    padding: 1rem 1rem !important;
                }
                .footer-content {
                    flex-direction: column !important;
                    gap: 0.5rem !important;
                }
                .footer-divider {
                    display: none !important;
                }
                .footer-link {
                    font-size: 0.85rem !important;
                }
                .footer-copyright {
                    font-size: 0.8rem !important;
                }
            }
            
            @media (max-width: 480px) {
                .footer {
                    padding: 1.25rem 0.75rem !important;
                }
                .footer-link {
                    font-size: 0.8rem !important;
                }
                .footer-copyright {
                    font-size: 0.75rem !important;
                }
            }
          `}
            </style>
        </footer>
    );
};

export default Footer;

