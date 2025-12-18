import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaInstagram, FaBars, FaTimes, FaRocket, FaUserLock } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Check if we are on the home page
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const socialLinks = [
        { icon: <FaGithub />, href: 'https://github.com/arpitpardesi' },
        { icon: <FaLinkedin />, href: 'https://www.linkedin.com/in/arpitpardesi/' },
        { icon: <FaXTwitter />, href: 'https://x.com/arpit_pardesi' },
        { icon: <FaInstagram />, href: 'https://www.instagram.com/arpitpardesi' },
    ];

    const navItems = ['About', 'Projects', 'Contact'];

    const handleNavClick = (item) => {
        setMobileMenuOpen(false);
        if (isHome) {
            const element = document.getElementById(item.toLowerCase());
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    padding: scrolled ? '1rem 2rem' : '1.5rem 2rem',
                    background: scrolled ? 'rgba(10, 10, 10, 0.8)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(10px)' : 'none',
                    borderBottom: scrolled ? '1px solid var(--border-color)' : 'none',
                    transition: 'all 0.3s ease',
                }}
            >
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '1px', zIndex: 1001, display: 'flex' }}>
                        {['A', 'R', 'P', 'I', 'T'].map((letter, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 200 }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                        <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.1, type: 'spring' }}
                            style={{ color: 'var(--accent-color)' }}
                        >
                            .
                        </motion.span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <ul className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
                            {navItems.map((item) => (
                                <li key={item}>
                                    {isHome ? (
                                        <a
                                            href={`#${item.toLowerCase()}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNavClick(item);
                                            }}
                                            style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                color: 'var(--text-secondary)',
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                                            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                        >
                                            {item}
                                        </a>
                                    ) : (
                                        <Link
                                            to={`/#${item.toLowerCase()}`}
                                            style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                color: 'var(--text-secondary)',
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                                            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                        >
                                            {item}
                                        </Link>
                                    )}
                                </li>
                            ))}
                            <li>
                                <Link
                                    to="/beyond-work"
                                    className={location.pathname.includes('/beyond-work') ? 'active-link' : ''}
                                    style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        color: 'var(--text-secondary)',
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                                    onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                >
                                    Beyond Work
                                </Link>
                            </li>

                        </ul>

                        <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
                            {socialLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}
                                >
                                    {link.icon}
                                </a>
                            ))}
                            <Link
                                to="/login"
                                style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginLeft: '0.5rem', opacity: 0.5 }}
                                title="Admin Login"
                            >
                                <FaUserLock />
                            </Link>
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            display: 'none',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            zIndex: 1001,
                            padding: '0.5rem',
                        }}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="mobile-menu-overlay"
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            width: '75%',
                            maxWidth: '300px',
                            height: '100vh',
                            background: 'rgba(10, 10, 10, 0.95)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 999,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '6rem 2rem 2rem',
                        }}
                    >
                        <nav>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {navItems.map((item, index) => (
                                    <motion.li
                                        key={item}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        {isHome ? (
                                            <a
                                                href={`#${item.toLowerCase()}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleNavClick(item);
                                                }}
                                                style={{
                                                    fontSize: '1.2rem',
                                                    fontWeight: '500',
                                                    color: 'var(--text-secondary)',
                                                    display: 'block',
                                                    padding: '0.5rem 0',
                                                }}
                                            >
                                                {/* <span style={{ color: 'var(--accent-color)', marginRight: '0.5rem' }}>{index + 1}.</span> */}
                                                {item}
                                            </a>
                                        ) : (
                                            <Link
                                                to={`/#${item.toLowerCase()}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{
                                                    fontSize: '1.2rem',
                                                    fontWeight: '500',
                                                    color: 'var(--text-secondary)',
                                                    display: 'block',
                                                    padding: '0.5rem 0',
                                                }}
                                            >
                                                {/* <span style={{ color: 'var(--accent-color)', marginRight: '0.5rem' }}>0{index + 1}.</span> */}
                                                {item}
                                            </Link>
                                        )}
                                    </motion.li>
                                ))}
                                <motion.li
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Link
                                        to="/beyond-work"
                                        onClick={() => setMobileMenuOpen(false)}
                                        style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '500',
                                            color: 'var(--text-secondary)',
                                            display: 'block',
                                            padding: '0.5rem 0',
                                        }}
                                    >
                                        <span style={{ color: 'var(--accent-color)', marginRight: '0.5rem' }}>04.</span>
                                        Beyond Work
                                    </Link>

                                </motion.li>
                            </ul>
                        </nav>

                        {/* Social Links in Mobile Menu */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                marginTop: 'auto',
                                display: 'flex',
                                gap: '1.5rem',
                                justifyContent: 'center',
                                paddingTop: '2rem',
                                borderTop: '1px solid var(--border-color)',
                            }}
                        >
                            {socialLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'var(--text-secondary)', fontSize: '1.3rem' }}
                                >
                                    {link.icon}
                                </a>
                            ))}
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', opacity: 0.5 }}
                                title="Admin Login"
                            >
                                <FaUserLock />
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Backdrop for mobile menu */}
            < AnimatePresence >
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100vh',
                            background: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 998,
                        }}
                    />
                )
                }
            </AnimatePresence >

            <style>
                {`
                    @media (max-width: 768px) {
                        .desktop-nav {
                            display: none !important;
                        }
                        .mobile-menu-btn {
                            display: block !important;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default Header;

