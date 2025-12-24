import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPalette, FaTimes } from 'react-icons/fa';

const themes = [
    // Original space themes
    { name: 'Void Purple', color: '#6366f1', rgb: '99, 102, 241', glow: 'rgba(99, 102, 241, 0.5)', background: '#6366f1' },
    { name: 'Nebula Blue', color: '#0ea5e9', rgb: '14, 165, 233', glow: 'rgba(14, 165, 233, 0.5)', background: '#0ea5e9' },
    { name: 'Aurora Green', color: '#10b981', rgb: '16, 185, 129', glow: 'rgba(16, 185, 129, 0.5)', background: '#10b981' },
    { name: 'Stellar Gold', color: '#eab308', rgb: '234, 179, 8', glow: 'rgba(234, 179, 8, 0.5)', background: '#eab308' },
    { name: 'Martian Red', color: '#ef4444', rgb: '239, 68, 68', glow: 'rgba(239, 68, 68, 0.5)', background: '#ef4444' },

    // New space-themed colors
    { name: 'Deep Space', color: '#1e3a5f', rgb: '30, 58, 95', glow: 'rgba(30, 58, 95, 0.6)', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' },
    { name: 'Pulsar Pink', color: '#ec4899', rgb: '236, 72, 153', glow: 'rgba(236, 72, 153, 0.5)', background: '#ec4899' },
    { name: 'Quantum Teal', color: '#14b8a6', rgb: '20, 184, 166', glow: 'rgba(20, 184, 166, 0.5)', background: '#14b8a6' },
    { name: 'Black Hole', color: '#374151', rgb: '55, 65, 81', glow: 'rgba(55, 65, 81, 0.6)', background: 'radial-gradient(circle, #374151 0%, #111827 100%)' },
    { name: 'Starlight', color: '#fbbf24', rgb: '251, 191, 36', glow: 'rgba(251, 191, 36, 0.5)', background: '#fbbf24' },

    // Gradient themes
    { name: 'Supernova', color: '#f43f5e', rgb: '244, 63, 94', glow: 'rgba(244, 63, 94, 0.5)', background: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)' },
    { name: 'Nova', color: '#22d3ee', rgb: '34, 211, 238', glow: 'rgba(34, 211, 238, 0.5)', background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)' },
    { name: 'Cosmos', color: '#d946ef', rgb: '217, 70, 239', glow: 'rgba(217, 70, 239, 0.5)', background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)' },
    { name: 'Andromeda', color: '#818cf8', rgb: '129, 140, 248', glow: 'rgba(129, 140, 248, 0.5)', background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)' },
];

const ThemeSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTheme, setActiveTheme] = useState(themes[4].name);
    const [hoveredTheme, setHoveredTheme] = useState(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('cosmos-theme');
        if (savedTheme) {
            const theme = themes.find(t => t.name === savedTheme);
            if (theme) {
                applyTheme(theme);
            }
        }
    }, []);

    const applyTheme = (theme) => {
        document.documentElement.style.setProperty('--accent-color', theme.color);
        document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
        document.documentElement.style.setProperty('--accent-glow', theme.glow);
        setActiveTheme(theme.name);
        localStorage.setItem('cosmos-theme', theme.name);
    };

    // Calculate positions in a spread pattern (going right and up from the button)
    const getPosition = (index, total) => {
        // Spread themes in multiple arcs that go right and upward from the button
        // This keeps them visible on screen (bottom-left corner origin)

        const row = Math.floor(index / 5); // 5 items per row
        const col = index % 5;

        // Base positions spread horizontally and vertically
        const baseX = 70 + col * 55; // Spread right
        const baseY = -(80 + row * 65); // Spread upward (negative Y)

        // Add slight stagger for organic feel
        const offsetX = (row % 2) * 25;
        const offsetY = Math.sin(index * 0.8) * 15;

        return {
            x: baseX + offsetX,
            y: baseY + offsetY
        };
    };

    return (
        <>
            <div className="theme-switcher-container" style={{
                position: 'fixed',
                bottom: '40px',
                left: '40px',
                zIndex: 10000,
            }}>
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {themes.map((theme, index) => {
                                const pos = getPosition(index, themes.length);
                                return (
                                    <motion.div
                                        key={theme.name}
                                        initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                                        animate={{
                                            opacity: 1,
                                            x: pos.x,
                                            y: pos.y,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: 0,
                                            y: 0,
                                            scale: 0,
                                            transition: { duration: 0.2, delay: index * 0.02 }
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.04,
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 15
                                        }}
                                        style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '0',
                                            zIndex: hoveredTheme === theme.name ? 9999 : 1,
                                        }}
                                    >

                                        <motion.button
                                            onClick={() => applyTheme(theme)}
                                            onMouseEnter={() => setHoveredTheme(theme.name)}
                                            onMouseLeave={() => setHoveredTheme(null)}
                                            className="theme-option"
                                            animate={{
                                                y: [0, -8, 0],
                                                x: [0, Math.sin(index) * 3, 0],
                                            }}
                                            transition={{
                                                duration: 3 + Math.random() * 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: index * 0.2
                                            }}
                                            style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '50%',
                                                background: theme.background,
                                                border: activeTheme === theme.name
                                                    ? '3px solid white'
                                                    : '2px solid rgba(255,255,255,0.2)',
                                                cursor: 'pointer',
                                                boxShadow: `0 0 20px ${theme.glow}, inset 0 2px 5px rgba(255,255,255,0.3)`,
                                                position: 'relative',
                                            }}
                                            whileHover={{
                                                scale: 1.3,
                                                zIndex: 100,
                                                boxShadow: `0 0 35px ${theme.glow}, 0 0 60px ${theme.glow}`
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {/* Active indicator */}
                                            {activeTheme === theme.name && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        width: '10px',
                                                        height: '10px',
                                                        borderRadius: '50%',
                                                        background: 'white',
                                                        boxShadow: '0 0 10px rgba(255,255,255,0.8)'
                                                    }}
                                                />
                                            )}

                                            {/* Tooltip */}
                                            <AnimatePresence>
                                                {hoveredTheme === theme.name && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: -35 }}
                                                        exit={{ opacity: 0, y: 5 }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-5px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            background: 'rgba(0,0,0,0.9)',
                                                            color: theme.color,
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500',
                                                            whiteSpace: 'nowrap',
                                                            pointerEvents: 'none',
                                                            border: `1px solid ${theme.color}`,
                                                            backdropFilter: 'blur(4px)',
                                                            zIndex: 200,
                                                            boxShadow: `0 0 15px ${theme.glow}`
                                                        }}
                                                    >
                                                        {theme.name}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </>
                    )}
                </AnimatePresence>

                {/* Core Star / Toggle Button */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="theme-toggle-btn"
                    animate={{
                        boxShadow: isOpen
                            ? [`0 0 25px var(--accent-color)`, `0 0 50px var(--accent-color)`, `0 0 25px var(--accent-color)`]
                            : [`0 0 5px var(--accent-color)`, `0 0 20px var(--accent-color)`, `0 0 5px var(--accent-color)`],
                        rotate: isOpen ? 180 : 0
                    }}
                    transition={{
                        boxShadow: { duration: 2, repeat: Infinity },
                        rotate: { duration: 0.4 }
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: '55px',
                        height: '55px',
                        borderRadius: '50%',
                        background: 'rgba(10, 10, 10, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid var(--accent-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-color)',
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        zIndex: 10001,
                        boxShadow: '0 0 30px var(--accent-glow)'
                    }}
                >
                    {isOpen ? <FaTimes /> : <FaPalette />}
                </motion.button>
            </div >
            {/* <motion.button
                onClick={() => window.location.hash = '#/playground'}
                className="playground-btn"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    left: '110px',
                    width: '55px',
                    height: '55px',
                    borderRadius: '50%',
                    background: 'rgba(10, 10, 10, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-color)',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10000,
                    boxShadow: '0 0 30px var(--accent-glow)'
                }}
                title="Physics Playground"
            >
                <FaRocket />
            </motion.button> */}

            <style>
                {`
                    @media (max-width: 768px) {
                        .theme-switcher-container {
                            bottom: 25px !important;
                            left: 25px !important;
                        }
                        .playground-btn {
                            bottom: 25px !important;
                            left: 85px !important;
                            width: 48px !important;
                            height: 48px !important;
                            font-size: 1.1rem !important;
                        }
                        .theme-toggle-btn {
                            width: 48px !important;
                            height: 48px !important;
                            font-size: 1.1rem !important;
                        }
                        .theme-option {
                            width: 36px !important;
                            height: 36px !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .theme-switcher-container {
                            bottom: 20px !important;
                            left: 20px !important;
                        }
                        .playground-btn {
                            bottom: 20px !important;
                            left: 75px !important;
                            width: 44px !important;
                            height: 44px !important;
                            font-size: 1rem !important;
                        }
                        .theme-toggle-btn {
                            width: 44px !important;
                            height: 44px !important;
                            font-size: 1rem !important;
                        }
                        .theme-option {
                            width: 32px !important;
                            height: 32px !important;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default ThemeSwitcher;
