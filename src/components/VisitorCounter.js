import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment, setDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const VisitorCounter = () => {
    const [count, setCount] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const statsRef = doc(db, 'stats', 'visitors');

        const updateCounter = async () => {
            try {
                // Increment only once per session
                if (!sessionStorage.getItem('nebula_visited')) {
                    await updateDoc(statsRef, { count: increment(1) }).catch(async (err) => {
                        // If doc doesn't exist, create it
                        if (err.code === 'not-found') {
                            await setDoc(statsRef, { count: 1 });
                        } else {
                            throw err;
                        }
                    });
                    sessionStorage.setItem('nebula_visited', 'true');
                }
            } catch (err) {
                console.error("Firebase Connection Error:", err.message);
                if (err.message.includes("Authorized Domains") || err.message.includes("permission-denied")) {
                    setError(true);
                }
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

    // We always return the container so the star pulses while loading
    // but the text only shows when data arrives.
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
                marginTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ color: 'var(--accent-color)', fontSize: '1rem' }}
                >
                    <FaStar />
                </motion.div>
                <span>
                    You are the <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>{count}th</span> star
                </span>
            </div>
            <div style={{ opacity: 0.6, fontSize: '0.75rem', fontStyle: 'italic' }}>
                to drift through this digital nebula
            </div>
        </motion.div>
    );
};

export default VisitorCounter;
