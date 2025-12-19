import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const StarFieldOverlay = ({ count, onClose }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set canvas size
        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setSize();
        window.addEventListener('resize', setSize);

        // Limit the number of stars rendered to avoid melting the GPU
        // But keep it high enough to feel like a "constellation"
        const MAX_STARS = 2000;
        const starCount = Math.min(count, MAX_STARS);

        const stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.15,
            speedY: (Math.random() - 0.5) * 0.15,
            baseOpacity: Math.random() * 0.4 + 0.3,
            twinkleSpeed: Math.random() * 0.02 + 0.01,
            phase: Math.random() * Math.PI * 2,
            twinkleAmplitude: Math.random() * 0.3 + 0.2
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Get accent color from CSS variables
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

            stars.forEach(star => {
                // Sine-wave twinkle logic
                star.phase += star.twinkleSpeed;
                const currentOpacity = star.baseOpacity + Math.sin(star.phase) * star.twinkleAmplitude;
                const opacity = Math.max(0.2, Math.min(1, currentOpacity));

                // Draw subtle glow for larger stars
                if (star.size > 2.5 && opacity > 0.7) {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = accentColor || '#ffffff';
                    ctx.globalAlpha = opacity * 0.15;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

                ctx.fillStyle = opacity > 0.85 ? '#ffffff' : accentColor || '#ffffff';
                ctx.globalAlpha = opacity;
                ctx.fill();

                // Drift
                star.x += star.speedX;
                star.y += star.speedY;

                // Wrap around
                if (star.x < 0) star.x = canvas.width;
                if (star.x > canvas.width) star.x = 0;
                if (star.y < 0) star.y = canvas.height;
                if (star.y > canvas.height) star.y = 0;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [count]);

    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(5, 5, 5, 0.95)',
                backdropFilter: 'blur(10px)',
                zIndex: 100000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', pointerEvents: 'none' }}>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        fontFamily: 'var(--font-main)',
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        fontWeight: '700',
                        color: '#ffffff',
                        marginBottom: '1rem',
                        textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
                    }}
                >
                    The Constellation of Souls
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-mono)',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}
                >
                    Every point of light represents a traveler who drifted through this digital nebula before you.
                </motion.p>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{
                        marginTop: '2rem',
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: 'var(--accent-color)',
                        textShadow: '0 0 30px var(--accent-glow)'
                    }}
                >
                    {count}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1 }}
                    style={{
                        marginTop: '0.5rem',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '4px'
                    }}
                >
                    Unique Presence
                </motion.div>
            </div>

            <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'absolute',
                    top: '40px',
                    right: '40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    cursor: 'none',
                    zIndex: 2,
                    backdropFilter: 'blur(5px)'
                }}
            >
                <FaTimes />
            </motion.button>

            {/* Hint to close */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 2 }}
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    color: 'white',
                    fontSize: '0.8rem',
                    letterSpacing: '2px',
                    fontFamily: 'var(--font-mono)'
                }}
            >
                PRESS ESC TO RETURN TO ORBIT
            </motion.div>
        </motion.div>
    );
};

export default StarFieldOverlay;
