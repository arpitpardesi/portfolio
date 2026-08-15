import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaUser, FaFolder, FaGamepad, FaCopy, FaCheck, FaTimes, FaCamera, FaRobot, FaLaptopCode } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';

const CommandPalette = ({ isOpen, onClose }) => {
    let navigate = () => {};
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        navigate = useNavigate();
    } catch (e) {
        // Fallback for non-router test contexts
    }
    const { settings } = useSettings();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef(null);

    const email = settings.contactEmail || 'arpit.pardesi6@gmail.com';

    const items = [
        {
            id: 'home',
            title: 'Go to Home',
            subtitle: 'Main overview & hero section',
            icon: <FaHome />,
            category: 'Navigation',
            action: () => { navigate('/'); onClose(); }
        },
        {
            id: 'about',
            title: 'Detailed About Me',
            subtitle: 'Read about my journey, skills & story',
            icon: <FaUser />,
            category: 'Navigation',
            action: () => { navigate('/about'); onClose(); }
        },
        {
            id: 'projects',
            title: 'View All Projects',
            subtitle: 'Explore full project portfolio & code',
            icon: <FaFolder />,
            category: 'Navigation',
            action: () => { navigate('/projects'); onClose(); }
        },
        {
            id: 'playground',
            title: 'Physics Playground',
            subtitle: 'Interactive Matter.js physics simulations',
            icon: <FaGamepad />,
            category: 'Interactive',
            action: () => { navigate('/playground'); onClose(); }
        },
        {
            id: 'beyond-work',
            title: 'Beyond Work & Hobbies',
            subtitle: 'Photography, IoT, AI & Raspberry Pi projects',
            icon: <FaLaptopCode />,
            category: 'Navigation',
            action: () => { navigate('/beyond-work'); onClose(); }
        },
        {
            id: 'photography',
            title: 'Photography Gallery',
            subtitle: 'Visual captures & creative photos',
            icon: <FaCamera />,
            category: 'Hobbies',
            action: () => { navigate('/beyond-work/photography'); onClose(); }
        },
        {
            id: 'ai',
            title: 'AI & Machine Learning',
            subtitle: 'Generative AI & smart agent projects',
            icon: <FaRobot />,
            category: 'Hobbies',
            action: () => { navigate('/beyond-work/ai'); onClose(); }
        },
        {
            id: 'copy-email',
            title: `Copy Contact Email (${email})`,
            subtitle: 'Copy email address to clipboard',
            icon: copied ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />,
            category: 'Quick Actions',
            action: () => {
                navigator.clipboard.writeText(email);
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                    onClose();
                }, 1000);
            }
        }
    ];

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    filteredItems[selectedIndex].action();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredItems, selectedIndex, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100000,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: 'calc(10vh + env(safe-area-inset-top))',
                    paddingLeft: '1rem',
                    paddingRight: '1rem'
                }}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '640px',
                        background: '#0d0d12',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(var(--accent-rgb), 0.15)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Search Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(255, 255, 255, 0.02)'
                    }}>
                        <FaSearch style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a command or search page..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#ffffff',
                                fontSize: '1.05rem',
                                fontFamily: 'var(--font-main, sans-serif)'
                            }}
                        />
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                borderRadius: '6px',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                            aria-label="Close Command Palette"
                        >
                            <FaTimes size={12} />
                        </button>
                    </div>

                    {/* Results List */}
                    <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
                        {filteredItems.length === 0 ? (
                            <div style={{
                                padding: '32px 16px',
                                textAlign: 'center',
                                color: 'var(--text-secondary)',
                                fontSize: '0.95rem'
                            }}>
                                No results found for "{query}"
                            </div>
                        ) : (
                            filteredItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    onClick={item.action}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        background: index === selectedIndex ? 'rgba(var(--accent-rgb), 0.15)' : 'transparent',
                                        border: index === selectedIndex ? '1px solid rgba(var(--accent-rgb), 0.3)' : '1px solid transparent',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <div style={{
                                        color: index === selectedIndex ? 'var(--accent-color)' : 'var(--text-secondary)',
                                        fontSize: '1.1rem',
                                        display: 'flex'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            color: '#ffffff',
                                            fontSize: '0.95rem',
                                            fontWeight: '600'
                                        }}>
                                            {item.title}
                                        </div>
                                        <div style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.8rem',
                                            marginTop: '2px'
                                        }}>
                                            {item.subtitle}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-secondary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {item.category}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Tip */}
                    <div style={{
                        padding: '10px 20px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono, monospace)'
                    }}>
                        <span>Use ↑ ↓ arrows to navigate, Enter to select</span>
                        <span>ESC to close</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommandPalette;
