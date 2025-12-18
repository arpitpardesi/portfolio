import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'radial-gradient(circle at center, #1a1b26 0%, #000000 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
            }}
        >
            {/* Orbital Ring Animation */}
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: '3px solid transparent',
                        borderTopColor: 'var(--accent-color)',
                        borderRadius: '50%',
                        boxShadow: '0 0 15px var(--accent-glow)'
                    }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        inset: '10px',
                        border: '3px solid transparent',
                        borderBottomColor: '#fff',
                        borderRadius: '50%',
                        opacity: 0.5
                    }}
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute',
                        inset: '25px',
                        background: 'var(--accent-color)',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px var(--accent-glow)'
                    }}
                />
            </div>

            <motion.h2
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: '300',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    margin: 0
                }}
            >
                Initializing
            </motion.h2>
        </motion.div>
    );
};

export default LoadingScreen;
