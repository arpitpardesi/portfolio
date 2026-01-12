import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
    // Determine text to show (should match logic in Header roughly, or just hardcode 'ARPIT' if that's the brand)
    // Header uses settings.logoText || 'ARPIT'
    const text = 'ARPIT';
    const letters = text.split('');

    useEffect(() => {
        // Sequence:
        // 0s-0.2s: Delay
        // 0.2s-1.4s: Text Reveal (1.2s duration)
        // 1.4s-2.0s: Pause (0.6s)
        // 2.0s: Complete -> Trigger Shutter
        const totalDuration = 2000;

        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, totalDuration);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="loading-screen"
            style={{
                position: 'fixed',
                inset: 0,
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
                    zIndex: 0
                }}
            />

            {/* Content Container */}
            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* 
                   layoutId wrapper:
                   This needs to match the Header's motion.div structure for the morph to work.
                */}
                <motion.div
                    layoutId="logo-text"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden', // Necessary for potential effects
                        color: '#fff',
                        mixBlendMode: 'difference'
                    }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                >
                    {/* Text Reveal Animation Group */}
                    <motion.div
                        initial={{ clipPath: 'inset(0 100% 0 0)' }}
                        animate={{ clipPath: 'inset(0 0% 0 0)' }}
                        transition={{
                            duration: 1.2,
                            ease: "easeInOut",
                            delay: 0.2
                        }}
                        style={{
                            display: 'flex', // Maintain flex layout for letters
                            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                            fontWeight: '700',
                            letterSpacing: '1px',
                        }}
                    >
                        {letters.map((letter, index) => (
                            <span key={index}>{letter}</span>
                        ))}
                    </motion.div>

                    {/* The Dot - Needs to reside outside the clipPath if we want it to be separate or just part of it? 
                        In LoadingScreen, let's keep it simple. If we want it to morph to the dot in Header, 
                        we should ideally have it here too. 
                    */}
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
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
