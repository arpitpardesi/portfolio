import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const SplashScreen = ({ onComplete }) => {
    const { settings } = useSettings();
    const text = settings.logoText || 'ARPIT';
    const letters = text.split('');
    const audioRef = useRef(null);

    useEffect(() => {
        console.log("Splash Screen Mounted");

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Play sound effect if motion is allowed
        if (!prefersReducedMotion) {
            try {
                const audio = new Audio(process.env.PUBLIC_URL + '/assets/splash-sound.mp3');
                audio.volume = 0.4; // Moderate volume
                audioRef.current = audio;

                // Attempt to play (may be blocked by browser autoplay policy)
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Autoplay was prevented - this is normal on first visit
                        console.log('Audio autoplay prevented:', error.message);
                    });
                }
            } catch (error) {
                // Audio file not found or other error - fail silently
                console.log('Audio playback error:', error.message);
            }
        }

        // Sequence:
        // 0s-0.2s: Delay
        // 0.2s-1.4s: Text Reveal (1.2s duration)
        // 1.4s-2.0s: Pause (0.6s)
        // 2.0s: Complete -> Trigger Shutter
        const totalDuration = 2000;

        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, totalDuration);

        return () => {
            clearTimeout(timer);
            // Clean up audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [onComplete]);

    return (
        <motion.div
            className="splash-screen"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%', // Use strictly 100% to fill fixed container
                minHeight: '100vh', // Ensure it covers at least the viewport
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Background Shutter */}
            <motion.div
                initial={{ height: '100%' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: '#000',
                    zIndex: 0,
                    marginBottom: '-100px' // Extend slightly to cover any bottom gaps
                }}
            />

            {/* Content Container */}
            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* 
                   layoutId wrapper:
                   Matches Header's motion.div structure for morphing effect.
                */}
                <motion.div
                    layoutId="logo-text"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        mixBlendMode: 'difference'
                    }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                >
                    {letters.map((letter, index) => (
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.2 + index * 0.1,
                                ease: "easeOut"
                            }}

                            style={{
                                display: 'inline-block',
                                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                                fontWeight: '700',
                                letterSpacing: '1px',
                            }}
                        >
                            {letter}
                        </motion.span>
                    ))}

                    <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4, duration: 0.2 }}
                        style={{
                            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                            fontWeight: '700',
                            color: 'var(--accent-color)'
                        }}
                    >
                        .
                    </motion.span>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
