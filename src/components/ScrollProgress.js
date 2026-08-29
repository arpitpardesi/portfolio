import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const ScrollProgress = () => {
    const { settings } = useSettings();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 30,
        restDelta: 0.001
    });

    if (settings?.enableScrollProgress === false) {
        return null;
    }

    return (
        <motion.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--accent-color, #ef4444)',
                boxShadow: '0 0 10px var(--accent-color, #ef4444)',
                transformOrigin: '0%',
                scaleX,
                zIndex: 100001,
                pointerEvents: 'none'
            }}
        />
    );
};

export default ScrollProgress;
