import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorVariant, setCursorVariant] = useState("default");

    useEffect(() => {
        const mouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        const handleMouseOver = (e) => {
            const tagName = e.target.tagName;
            if (tagName === 'A' || tagName === 'BUTTON' ||
                tagName === 'INPUT' || tagName === 'TEXTAREA' ||
                e.target.closest('a') || e.target.closest('button')) {
                setCursorVariant("text");
            } else {
                setCursorVariant("default");
            }
        };

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    const variants = {
        default: {
            x: mousePosition.x - 20,
            y: mousePosition.y - 20,
            height: 40,
            width: 40,
            backgroundColor: "rgba(var(--accent-rgb), 0.1)",
            border: "1px solid rgba(var(--accent-rgb), 0.8)",
            boxShadow: "0 0 15px rgba(var(--accent-rgb), 0.5)", // Glow
            scale: 1,
        },
        text: {
            x: mousePosition.x - 30,
            y: mousePosition.y - 30,
            height: 60,
            width: 60,
            backgroundColor: "rgba(var(--accent-rgb), 0.2)",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 0 20px rgba(var(--accent-rgb), 0.8)", // Intentser glow
            scale: 1.1,
            mixBlendMode: "difference"
        }
    };

    // Core pointer (the accurate click point)
    const dotVariants = {
        default: {
            x: mousePosition.x - 3,
            y: mousePosition.y - 3,
            width: 6,
            height: 6,
            backgroundColor: "#ffffff",
            boxShadow: "0 0 10px #ffffff",
        },
        text: {
            x: mousePosition.x - 3,
            y: mousePosition.y - 3,
            backgroundColor: "transparent",
            boxShadow: "none"
        }
    }

    const glowVariants = {
        default: {
            x: mousePosition.x - 200,
            y: mousePosition.y - 200,
            scale: 1,
            opacity: 1
        },
        text: {
            x: mousePosition.x - 200,
            y: mousePosition.y - 200,
            scale: 1.5,
            opacity: 0.8
        }
    };

    return (
        <>
            {/* Glow Effect */}
            <motion.div
                variants={glowVariants}
                animate={cursorVariant}
                transition={{
                    type: "tween",
                    ease: "linear",
                    duration: 0.1
                }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    zIndex: 99999998,
                    pointerEvents: "none",
                    background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, rgba(var(--accent-rgb), 0) 60%)"
                }}
            />
            {/* Outer Ring - trails slightly */}
            <motion.div
                variants={variants}
                animate={cursorVariant}
                transition={{
                    type: "spring",
                    stiffness: 150, // Looser spring for "drift" logic
                    damping: 15,
                    mass: 0.8
                }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    borderRadius: "50%",
                    pointerEvents: "none",
                    zIndex: 99999999,
                }}
            />
            {/* Center Pointer - follows instantly */}
            <motion.div
                variants={dotVariants}
                animate={cursorVariant}
                transition={{
                    type: "tween",
                    duration: 0
                }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    borderRadius: "50%",
                    pointerEvents: "none",
                    zIndex: 99999999,
                }}
            />
            <style>
                {`
                    body {
                        cursor: none; /* Hide default cursor */
                    }
                    a, button, input, textarea, label {
                        cursor: none; /* Ensure interactive elements don't show default cursor */
                    }
                    @media (hover: none) and (pointer: coarse) {
                        .cursor-follower { display: none; }
                        body, a, button, input, textarea, label { cursor: auto; }
                    }
                `}
            </style>
        </>
    );
};

export default CustomCursor;
