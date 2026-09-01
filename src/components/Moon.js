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

    const allPhases = [
        { name: "New Moon", icon: "🌑" },
        { name: "Waxing Crescent", icon: "🌒" },
        { name: "First Quarter", icon: "🌓" },
        { name: "Waxing Gibbous", icon: "🌔" },
        { name: "Full Moon", icon: "🌕" },
        { name: "Waning Gibbous", icon: "🌖" },
        { name: "Last Quarter", icon: "🌗" },
        { name: "Waning Crescent", icon: "🌘" }
    ];

    const lunarAge = (phase * 29.53).toFixed(1);

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
                data-cursor="help"
                style={{
                    position: 'fixed',
                    top: 'calc(150px + env(safe-area-inset-top))',
                    right: '50px',
                    width: `${size}px`,
                    height: `${size}px`,
                    zIndex: 100,
                    cursor: 'none',
                    filter: isHovered
                        ? `drop-shadow(0 0 ${16 + (illumination || 0) * 24}px rgba(255, 255, 255, ${0.3 + (illumination || 0) * 0.4})) drop-shadow(0 0 40px rgba(var(--accent-rgb), ${0.18 + (illumination || 0) * 0.25}))`
                        : `drop-shadow(0 0 ${10 + (illumination || 0) * 20}px rgba(255, 255, 255, ${0.2 + (illumination || 0) * 0.35})) drop-shadow(0 0 35px rgba(200, 220, 255, ${0.1 + (illumination || 0) * 0.2}))`,
                    transform: isSouthern ? 'scaleX(-1)' : 'none',
                    transition: 'filter 0.4s ease'
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#04070d',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.9), 0 0 8px rgba(255, 255, 255, 0.08)'
                }}>
                    <MoonPhaseSVG size={size} phase={phase} />
                    {/* Atmospheric limb darkening and spherical rim lighting */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
                        pointerEvents: 'none',
                        zIndex: 3
                    }}></div>
                </div>

                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className="moon-tooltip"
                            initial={{ opacity: 0, scale: 0.94, x: 8 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.94, x: 6 }}
                            transition={{ type: "spring", stiffness: 350, damping: 26 }}
                            style={{
                                position: 'absolute',
                                background: 'linear-gradient(135deg, rgba(16, 22, 36, 0.88), rgba(10, 14, 26, 0.94))',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(var(--accent-rgb), 0.28)',
                                color: 'var(--text-primary)',
                                pointerEvents: 'none',
                                textAlign: 'left',
                                boxShadow: '0 25px 50px -15px rgba(0, 0, 0, 0.85), 0 0 25px rgba(var(--accent-rgb), 0.15)',
                                zIndex: 110,
                                boxSizing: 'border-box',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Subtle Top Specular Edge Beam matching theme */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '10%',
                                right: '10%',
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.6), transparent)',
                                opacity: 0.85
                            }} />

                            {/* Header Status Row */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                                paddingBottom: '8px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: 'var(--accent-color)',
                                    fontSize: '0.66rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.9px',
                                    fontFamily: 'var(--font-mono, monospace)',
                                    textTransform: 'uppercase'
                                }}>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: 'var(--accent-color)',
                                        boxShadow: '0 0 8px var(--accent-color)',
                                        display: 'inline-block'
                                    }} />
                                    Lunar Telemetry
                                </div>
                                <span style={{
                                    fontSize: '0.66rem',
                                    color: 'var(--accent-color)',
                                    fontFamily: 'var(--font-mono, monospace)',
                                    background: 'rgba(var(--accent-rgb), 0.12)',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(var(--accent-rgb), 0.25)',
                                    fontWeight: '600'
                                }}>
                                    {isSouthern ? '🌏 South' : '🌍 North'}
                                </span>
                            </div>

                            {/* Phase Title & Icon */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>
                                    {allPhases.find(p => p.name === stage)?.icon || '🌕'}
                                </span>
                                <div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                        {stage}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono, monospace)' }}>
                                        Day {lunarAge} of 29.5
                                    </div>
                                </div>
                            </div>

                            {/* Subtle 8-Phase Orbit Timeline */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 6px',
                                marginBottom: '10px',
                                borderRadius: '8px',
                                background: 'rgba(0, 0, 0, 0.35)',
                                border: '1px solid rgba(255, 255, 255, 0.06)'
                            }}>
                                {allPhases.map((p, idx) => {
                                    const isCurrent = p.name === stage;
                                    return (
                                        <span
                                            key={idx}
                                            style={{
                                                fontSize: isCurrent ? '0.95rem' : '0.75rem',
                                                opacity: isCurrent ? 1 : 0.35,
                                                transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                                                filter: isCurrent ? 'drop-shadow(0 0 4px var(--accent-color))' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                            title={p.name}
                                        >
                                            {p.icon}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Illumination Progress Bar */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.74rem',
                                    marginBottom: '5px',
                                    fontFamily: 'var(--font-mono, monospace)'
                                }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Illumination</span>
                                    <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>
                                        {Math.round(illumination * 100)}%
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '5px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.round(illumination * 100)}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        style={{
                                            height: '100%',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(90deg, var(--accent-color), rgba(var(--accent-rgb), 0.8))',
                                            boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.6)'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Reflection Quote Pill */}
                            <div style={{
                                padding: '9px 12px',
                                borderRadius: '10px',
                                background: 'rgba(var(--accent-rgb), 0.06)',
                                border: '1px solid rgba(var(--accent-rgb), 0.18)',
                                borderLeft: '2.5px solid var(--accent-color)',
                                backdropFilter: 'blur(10px)',
                                fontStyle: 'italic',
                                color: 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                lineHeight: '1.4'
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
                        right: calc(100% + 18px);
                        transform: translateY(-50%);
                        width: 245px;
                        padding: 16px 18px;
                    }

                    .moon-tooltip::after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        right: -6px;
                        transform: translateY(-50%) rotate(45deg);
                        width: 10px;
                        height: 10px;
                        background: rgba(10, 14, 26, 0.94);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border-top: 1px solid rgba(var(--accent-rgb), 0.28);
                        border-right: 1px solid rgba(var(--accent-rgb), 0.28);
                    }

                    @keyframes lunarShimmer {
                        0% { transform: rotate(0deg) scale(1); opacity: 0.22; }
                        50% { transform: rotate(180deg) scale(1.04); opacity: 0.38; }
                        100% { transform: rotate(360deg) scale(1); opacity: 0.22; }
                    }

                    .lunar-shimmer-anim {
                        transform-origin: 50px 50px;
                        animation: lunarShimmer 24s ease-in-out infinite alternate;
                    }

                    @keyframes lunarGlowPulse {
                        0%, 100% { opacity: 0.3; }
                        50% { opacity: 0.55; }
                    }

                    .lunar-glow-pulse {
                        animation: lunarGlowPulse 6s ease-in-out infinite;
                    }

                    @media (max-width: 768px) {
                        .moon-container {
                            width: 60px !important;
                            height: 60px !important;
                            top: calc(110px + env(safe-area-inset-top)) !important;
                            right: 24px !important;
                        }
                        .moon-tooltip {
                            top: calc(100% + 12px) !important;
                            right: -10px !important;
                            transform: none !important;
                            width: 215px !important;
                            padding: 12px 14px !important;
                        }
                        .moon-tooltip::after {
                            top: -6px !important;
                            right: 28px !important;
                            transform: rotate(-45deg) !important;
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
                            width: 200px !important;
                            padding: 10px 12px !important;
                            font-size: 0.75rem !important;
                        }
                    }
                `}
            </style>
        </>
    );
};

const LunarSurfaceContent = () => (
    <>
        {/* Base Lunar Surface Gradient */}
        <circle cx="50" cy="50" r="50" fill="url(#lunar-surface-grad)" />

        {/* Lunar Maria (Dark Basaltic Plains - "The Man in the Moon" Features) */}
        <g opacity="0.48">
            {/* Oceanus Procellarum */}
            <path
                d="M 22 28 Q 18 45 28 62 Q 38 68 32 48 Q 28 32 22 28 Z"
                fill="#64748b"
                filter="url(#crater-soft-blur)"
            />
            {/* Mare Imbrium */}
            <ellipse
                cx="37"
                cy="32"
                rx="13"
                ry="11"
                fill="#475569"
                filter="url(#crater-soft-blur)"
            />
            {/* Mare Serenitatis */}
            <ellipse
                cx="60"
                cy="34"
                rx="9"
                ry="8"
                fill="#475569"
                filter="url(#crater-soft-blur)"
            />
            {/* Mare Tranquillitatis */}
            <ellipse
                cx="65"
                cy="49"
                rx="11"
                ry="9"
                fill="#475569"
                filter="url(#crater-soft-blur)"
            />
            {/* Mare Fecunditatis */}
            <ellipse
                cx="74"
                cy="62"
                rx="8"
                ry="7"
                fill="#475569"
                filter="url(#crater-soft-blur)"
            />
            {/* Mare Crisium */}
            <ellipse
                cx="78"
                cy="37"
                rx="6"
                ry="5"
                fill="#334155"
                filter="url(#crater-soft-blur)"
            />
            {/* Mare Nubium */}
            <ellipse
                cx="38"
                cy="68"
                rx="10"
                ry="7"
                fill="#475569"
                filter="url(#crater-soft-blur)"
            />
            {/* Mare Humorum */}
            <ellipse
                cx="24"
                cy="62"
                rx="6"
                ry="5"
                fill="#475569"
                filter="url(#crater-soft-blur)"
            />
        </g>

        {/* Detailed Impact Craters with 3D Depth (Shadow + Highlight Rims) */}
        {/* Tycho Crater and Ray System at South */}
        <g opacity="0.7">
            {/* Tycho Ejecta Rays */}
            <path
                d="M 48 83 L 30 50 M 48 83 L 65 60 M 48 83 L 42 35 M 48 83 L 70 75 M 48 83 L 25 78"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="0.8"
                strokeDasharray="1.5 1.5"
                filter="url(#crater-soft-blur)"
            />
            {/* Tycho Crater Rim */}
            <circle cx="48" cy="83" r="3.2" fill="#334155" />
            <circle cx="48" cy="83" r="3.2" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.7" />
            <circle cx="48.5" cy="83.5" r="1.4" fill="#1e293b" />
        </g>

        {/* Copernicus Crater */}
        <g opacity="0.85">
            <circle cx="34" cy="48" r="4.2" fill="#334155" />
            <circle cx="33.8" cy="47.8" r="4" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.8" />
            <circle cx="34.5" cy="48.5" r="2.2" fill="#0f172a" />
            <circle cx="34.2" cy="48.2" r="0.8" fill="rgba(255,255,255,0.7)" />
        </g>

        {/* Kepler Crater */}
        <g opacity="0.75">
            <circle cx="21" cy="46" r="2.4" fill="#334155" />
            <circle cx="20.8" cy="45.8" r="2.2" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
            <circle cx="21.3" cy="46.3" r="1.1" fill="#0f172a" />
        </g>

        {/* Aristarchus (Bright Plateau Crater) */}
        <g opacity="0.9">
            <circle cx="22" cy="30" r="2.5" fill="#f8fafc" />
            <circle cx="22.4" cy="30.4" r="1.4" fill="#475569" />
        </g>

        {/* Plato (Dark Flat-Floored Crater) */}
        <g opacity="0.75">
            <ellipse cx="40" cy="18" rx="3.5" ry="2" fill="#1e293b" stroke="rgba(255,255,255,0.75)" strokeWidth="0.6" />
        </g>

        {/* Clavius (Large Southern Crater) */}
        <g opacity="0.7">
            <ellipse cx="44" cy="91" rx="5.5" ry="3.5" fill="#334155" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
            <circle cx="43" cy="91" r="1" fill="#1e293b" />
            <circle cx="45" cy="91.5" r="0.8" fill="#1e293b" />
        </g>

        {/* Micro Craters Scatter for Texture Depth */}
        <g fill="#475569" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" opacity="0.65">
            <circle cx="56" cy="22" r="1.5" />
            <circle cx="68" cy="26" r="1.2" />
            <circle cx="82" cy="52" r="1.8" />
            <circle cx="58" cy="65" r="1.4" />
            <circle cx="70" cy="76" r="1.6" />
            <circle cx="28" cy="77" r="1.3" />
            <circle cx="15" cy="40" r="1.4" />
            <circle cx="52" cy="44" r="1.2" />
        </g>

        {/* Regolith Grain Texture Overlay */}
        <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="#ffffff"
            filter="url(#lunar-noise-filter)"
            opacity="0.22"
            style={{ mixBlendMode: 'overlay' }}
        />

        {/* Animated Cosmic Surface Shimmer Overlay */}
        <g className="lunar-shimmer-anim" opacity="0.32" style={{ mixBlendMode: 'soft-light' }}>
            <circle cx="50" cy="50" r="48" fill="url(#lunar-shimmer-grad)" />
        </g>
    </>
);

const MoonPhaseSVG = ({ size, phase }) => {
    const p = phase;
    let d = "";

    if (p <= 0.5) {
        // Waxing (Light grows from RIGHT)
        const rx = 50 * (1 - 4 * p);
        d = `M 50 0 A 50 50 0 0 1 50 100 A ${Math.abs(rx)} 50 0 0 ${p < 0.25 ? 0 : 1} 50 0`;
    } else {
        // Waning (Light shrinks to LEFT)
        const rx = 50 * (3 - 4 * p);
        d = `M 50 100 A 50 50 0 0 1 50 0 A ${Math.abs(rx)} 50 0 0 ${p < 0.75 ? 1 : 0} 50 100`;
    }

    return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
                {/* 1. Realistic Lit Surface 3D Gradient */}
                <radialGradient id="lunar-surface-grad" cx="38%" cy="38%" r="62%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="45%" stopColor="#f1f5f9" />
                    <stop offset="75%" stopColor="#e2e8f0" />
                    <stop offset="92%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#94a3b8" />
                </radialGradient>

                {/* 2. Earthshine Gradient for Unlit Side */}
                <radialGradient id="earthshine-grad" cx="42%" cy="42%" r="58%">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#0f172a" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#04070d" stopOpacity="0.95" />
                </radialGradient>

                {/* 3. Soft Blur for Natural Geological Maria */}
                <filter id="crater-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.8" />
                </filter>

                {/* 4. Procedural Regolith Noise Texture Filter */}
                <filter id="lunar-noise-filter" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="3" result="noise" />
                    <feColorMatrix
                        type="matrix"
                        values="0.33 0.33 0.33 0 0
                                0.33 0.33 0.33 0 0
                                0.33 0.33 0.33 0 0
                                0 0 0 0.8 0"
                    />
                </filter>

                {/* 5. Animated Shimmer Wave Gradient */}
                <radialGradient id="lunar-shimmer-grad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="35%" stopColor="#93c5fd" stopOpacity="0.4" />
                    <stop offset="70%" stopColor="#64748b" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>

                {/* 6. Dynamic Lunar Phase Mask */}
                <mask id="moon-phase-mask">
                    <rect x="0" y="0" width="100" height="100" fill="#000000" />
                    <path d={d} fill="#ffffff" />
                </mask>
            </defs>

            {/* Dark Hemisphere (Earthshine with subtle crater silhouettes) */}
            <g opacity="0.22">
                <LunarSurfaceContent />
                <circle cx="50" cy="50" r="50" fill="url(#earthshine-grad)" />
            </g>

            {/* Lit Hemisphere with Rich Animated Texture (Masked by Phase) */}
            <g mask="url(#moon-phase-mask)">
                <LunarSurfaceContent />
            </g>
        </svg>
    );
};

export default Moon;

