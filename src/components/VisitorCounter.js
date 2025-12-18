import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment, setDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const VisitorCounter = () => {
    const [count, setCount] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const statsRef = doc(db, 'stats', 'visitors');

        const updateCounter = async () => {
            try {
                const docSnap = await getDoc(statsRef);

                // Increment only once per session
                if (!sessionStorage.getItem('nebula_visited')) {
                    if (docSnap.exists()) {
                        await updateDoc(statsRef, { count: increment(1) });
                    } else {
                        await setDoc(statsRef, { count: 1 });
                    }
                    sessionStorage.setItem('nebula_visited', 'true');
                }
            } catch (error) {
                console.error("Error updating star count:", error);
            }
        };

        updateCounter();

        // Real-time listener for the count
        const unsubscribe = onSnapshot(statsRef, (doc) => {
            if (doc.exists()) {
                setCount(doc.data().count);
                setIsVisible(true);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!isVisible || count === null) return null;

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
