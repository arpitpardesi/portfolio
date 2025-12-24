import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, increment, setDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

import StarFieldOverlay from './StarFieldOverlay';

const VisitorCounter = () => {
    const [count, setCount] = useState(null);
    const [error, setError] = useState(false);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    useEffect(() => {
        const statsRef = doc(db, 'stats', 'visitors');

        const updateCounter = async () => {
            try {
                // Increment only once per session
                if (!sessionStorage.getItem('nebula_visited')) {
                    // Fetch location data
                    let locationData = null;
                    try {
                        const response = await fetch('https://ipapi.co/json/');
                        if (response.ok) {
                            const data = await response.json();
                            locationData = {
                                country: data.country_name || 'Unknown',
                                countryCode: data.country_code || 'XX',
                                city: data.city || 'Unknown',
                                region: data.region || 'Unknown',
                                ip: data.ip || 'Unknown',
                                timestamp: new Date()
                            };
                        }
                    } catch (err) {
                        console.error("Location fetch error:", err);
                    }

                    // Update visitor count
                    await updateDoc(statsRef, { count: increment(1) }).catch(async (err) => {
                        // If doc doesn't exist, create it
                        if (err.code === 'not-found') {
                            await setDoc(statsRef, { count: 1 });
                        } else {
                            throw err;
                        }
                    });

                    // Store location data in visitor_logs collection
                    if (locationData) {
                        try {
                            await addDoc(collection(db, 'visitor_logs'), locationData);
                        } catch (err) {
                            console.error("Error storing location:", err);
                        }
                    }

                    sessionStorage.setItem('nebula_visited', 'true');
                }
            } catch (err) {
                console.error("Firebase Connection Error:", err.message);
                setError(true);
            }
        };

        updateCounter();

        // Real-time listener
        const unsubscribe = onSnapshot(statsRef, (doc) => {
            if (doc.exists()) {
                setCount(doc.data().count);
            }
        }, (err) => {
            console.error("Firestore Listen Error:", err.code);
            setError(true);
        });

        return () => unsubscribe();
    }, []);

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    if (error || count === null) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <motion.div
                    onClick={() => setIsOverlayOpen(true)}
                    whileHover={{
                        scale: 1.05,
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '6px 16px',
                        background: 'rgba(255, 255, 255, 0.01)',
                        backdropFilter: 'blur(5px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease, border-color 0.3s ease'
                    }}
                >
                    <motion.div
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ color: 'var(--accent-color)', display: 'flex' }}
                    >
                        <FaStar size={10} />
                    </motion.div>
                    <span>
                        You are the <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{count}</span>
                        <sup style={{ fontSize: '0.55rem', opacity: 0.8, marginLeft: '1px' }}>
                            {getOrdinal(count)}
                        </sup> star to drift through this digital nebula
                        {/* star in this nebula */}
                    </span>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isOverlayOpen && (
                    <StarFieldOverlay
                        count={count}
                        onClose={() => setIsOverlayOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default VisitorCounter;
