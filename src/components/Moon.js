import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { getMoonPhase } from '../utils/moonCalc';

const Moon = () => {
    const [moonData, setMoonData] = useState({ phase: 0, stage: '' });
    const [isSouthern, setIsSouthern] = useState(false);

    useEffect(() => {
        // 1. Calculate Phase
        const data = getMoonPhase();
        setMoonData(data);

        // 2. Detect Location (Hemisphere)
        // Try to get from API
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                if (data.latitude && data.latitude < 0) {
                    setIsSouthern(true);
                }
            })
            .catch(err => {
                console.warn("Could not fetch location for moon orientation:", err);
            });
    }, []);

    const size = 100;
    const { phase, stage, illumination } = moonData;

    return (
        <>
            <motion.div
                className="moon-container"
                title={`Phase: ${stage} (${Math.round((illumination || 0) * 100)}% Lit)`}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'fixed',
                    top: '120px',
                    right: '50px',
                    width: `${size}px`,
                    height: `${size}px`,
                    zIndex: 100,
                    opacity: 0.9,
                    // Glow varies with illumination
                    filter: `drop-shadow(0 0 ${10 + (illumination || 0) * 20}px rgba(255, 255, 255, ${0.2 + (illumination || 0) * 0.3}))`,
                    transform: isSouthern ? 'scaleX(-1)' : 'none'
                }}
            >
                <div style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    background: '#050505', // Base: Dark (Shadow)
                    position: 'relative',
                    overflow: 'hidden',
                    // Subtle dark glow for the "new moon" part to separate from space
                    boxShadow: '0 0 5px rgba(255,255,255,0.05)'
                }}>
                    {/* Lit Part */}
                    <MoonPhaseSVG size={size} phase={phase} />

                    {/* Texture Overlay (always on top of light and dark) */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)', // Sphere shading
                        pointerEvents: 'none'
                    }}></div>
                    {/* Craters - simplistic */}
                    <div style={{
                        position: 'absolute', top: '20%', left: '30%', width: '20%', height: '20%',
                        borderRadius: '50%', background: 'rgba(0,0,0,0.1)', filter: 'blur(1px)'
                    }}></div>
                </div>
            </motion.div>

            <style>
                {`
                    @media (max-width: 768px) {
                        .moon-container {
                            width: 70px !important;
                            height: 70px !important;
                            top: 90px !important;
                            right: 30px !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .moon-container {
                            width: 50px !important;
                            height: 50px !important;
                            top: 80px !important;
                            right: 20px !important;
                            opacity: 0.7 !important;
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

