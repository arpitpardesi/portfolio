import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { getMoonPhase } from '../utils/moonCalc';
import { useLocation } from 'react-router-dom';

const Moon = () => {
    const [moonData, setMoonData] = useState({ phase: 0, stage: '', illumination: 0 });
    const [isSouthern, setIsSouthern] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const data = getMoonPhase();
        setMoonData(data);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        fetch('https://ipapi.co/json/', { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (data.latitude && data.latitude < 0) setIsSouthern(true);
            })
            .catch(() => {
                // Silently fallback to Northern hemisphere default on network fail/timeout
            })
            .finally(() => clearTimeout(timeoutId));

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, []);

    const size = 100;
    const { phase, stage, illumination } = moonData;

    const reflections = {
        "New Moon": "The silent observer, waiting in the shadows.",
        "Waxing Crescent": "A sliver of hope, emerging from the dark.",
        "First Quarter": "Balanced in the void, half-seen, half-dreamed.",
        "Waxing Gibbous": "Swelling with the light of ancient stars.",
        "Full Moon": "A beacon of silver, illuminating the digital aether.",
        "Waning Gibbous": "A gentle retreat, returning to the silence.",
        "Last Quarter": "A fading echo of the peak, yet steady and strong.",
        "Waning Crescent": "Preparing to sleep, the cycle prepares to restart."
    };

    // Hide moon on admin pages
    if (location.pathname.startsWith('/admin')) return null;

    return (
        <>
            <motion.div
                className="moon-container"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                animate={{
                    y: [0, -15, 0],
                    scale: isHovered ? 1.1 : 1
                }}
                transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.3 }
                }}
                style={{
                    position: 'fixed',
                    top: 'calc(150px + env(safe-area-inset-top))',
                    right: '50px',
                    width: `${size}px`,
                    height: `${size}px`,
                    zIndex: 100,
                    cursor: 'help',
                    filter: `drop-shadow(0 0 ${10 + (illumination || 0) * 20}px rgba(255, 255, 255, ${0.2 + (illumination || 0) * 0.3}))`,
                    transform: isSouthern ? 'scaleX(-1)' : 'none'
                }}
            >
                <div style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    background: '#050505',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 0 5px rgba(255,255,255,0.05)'
                }}>
                    <MoonPhaseSVG size={size} phase={phase} />
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)',
                        pointerEvents: 'none'
                    }}></div>
                </div>

                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className="moon-tooltip"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                position: 'absolute',
                                background: 'rgba(10, 10, 15, 0.85)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                pointerEvents: 'none',
                                textAlign: 'center',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                zIndex: 110
                            }}
                        >
                            <div style={{
                                color: 'var(--accent-color)',
                                fontSize: '0.7rem',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                marginBottom: '4px',
                                opacity: 0.9,
                                fontWeight: '600'
                            }}>
                                {stage}
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '600', marginBottom: '6px' }}>
                                {Math.round(illumination * 100)}% Lit
                            </div>
                            <div style={{
                                fontStyle: 'italic',
                                color: 'var(--text-secondary)',
                                fontSize: '0.78rem',
                                lineHeight: '1.35'
                            }}>
                                "{reflections[stage] || "Surrounded by stars."}"
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <style>
                {`
                    .moon-tooltip {
                        top: 50%;
                        right: calc(100% + 15px);
                        transform: translateY(-50%);
                        width: 170px;
                        padding: 14px;
                    }

                    @media (max-width: 768px) {
                        .moon-container {
                            width: 60px !important;
                            height: 60px !important;
                            top: calc(110px + env(safe-area-inset-top)) !important;
                            right: 24px !important;
                        }
                        .moon-tooltip {
                            top: calc(100% + 10px) !important;
                            right: 0 !important;
                            transform: none !important;
                            width: 150px !important;
                            padding: 10px !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .moon-container {
                            width: 48px !important;
                            height: 48px !important;
                            top: calc(95px + env(safe-area-inset-top)) !important;
                            right: 16px !important;
                            opacity: 0.85 !important;
                        }
                        .moon-tooltip {
                            width: 135px !important;
                            padding: 8px !important;
                            font-size: 0.75rem !important;
                        }
                    }
                `}
            </style>
        </>
    );
};

const MoonPhaseSVG = ({ size, phase }) => {
    // Look at phase 0..1
    // We draw the WHITE (Lit) part.

    // Northern Hemisphere Standard:
    // 0.0 - 0.5 (Waxing): Light grows from RIGHT.
    // 0.5 - 1.0 (Waning): Light shrinks to LEFT.

    const p = phase;

    let d = "";

    if (p <= 0.5) {
        // Waxing
        // Light is on the RIGHT.

        const rx = 50 * (1 - 4 * p);

        d = `M 50 0 A 50 50 0 0 1 50 100 A ${Math.abs(rx)} 50 0 0 ${p < 0.25 ? 0 : 1} 50 0`;

    } else {
        // Waning (0.5 .. 1.0)
        // Light is on the LEFT.

        const rx = 50 * (3 - 4 * p);

        d = `M 50 100 A 50 50 0 0 1 50 0 A ${Math.abs(rx)} 50 0 0 ${p < 0.75 ? 1 : 0} 50 100`;
    }

    return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Draw Lit Part in White/Light Gray */}
            <path d={d} fill="#f0f0f0" />
        </svg>
    );
};

export default Moon;

