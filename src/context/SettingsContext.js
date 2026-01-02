import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        // General Defaults
        siteTitle: 'Arpit Pardesi | Portfolio',
        logoText: 'ARPIT',
        contactEmail: 'arpit.pardesi6@gmail.com',
        footerText: '© 2026 Arpit Pardesi. All rights reserved.',

        // Hero Defaults
        heroName: 'Arpit Pardesi.',
        heroIntro: 'Hi, my name is',
        heroSubtitle: 'I turn curiosity into creation.',
        heroDescription: 'I weave together data, design, and code to build experiences that feel intuitive and alive. As a Software Developer, I explore the space where logic meets imagination — architecting solutions, solving puzzles, and shaping ideas into something you can see, feel, and use.',
        heroCtaText: 'Check out my work',
        heroCtaLink: '#projects',

        // About Defaults
        aboutTitle: 'About Me',
        aboutText1: 'Hello! I’m Arpit — a builder at heart, a learner by nature, and a firm believer that technology is just another form of storytelling.',
        aboutText2: 'My journey began with small sparks of curiosity: Why does this work? What happens if I change that? Can I build something new? Those questions carried me into the world of software, where creativity and precision dance together.',
        aboutText3: 'Today, I craft data-driven solutions, develop applications, and design meaningful digital experiences. I love blending structure with art — from orchestrating raw ideas and data into solutions to writing code that feels elegant and alive.',
        aboutText4: 'When I’m not engineering solutions, you’ll find me experimenting: building IoT gadgets, teaching machines to see and talk, or creating playful interfaces powered by AI.',
        aboutFooter: 'Every project is a chance to explore, to improve, to understand a little more.',
        profileImage: 'https://github.com/arpitpardesi.png',

        // Contact Defaults
        contactSubtitle: "What's Next?",
        contactTitle: 'Get In Touch',
        contactText: "I'm currently looking for new opportunities, and my inbox is always open. Whether you have a question, a project idea, or just want to say hi, I'll try my best to get back to you!",
        contactCta: 'Say Hello',

        // Social Defaults
        resumeUrl: '',
        githubUrl: 'https://github.com/arpitpardesi',
        linkedinUrl: 'https://www.linkedin.com/in/arpitpardesi/',
        twitterUrl: 'https://x.com/arpit_pardesi',
        instagramUrl: 'https://www.instagram.com/arpitpardesi',

        // System Defaults
        maintenanceMode: false,
        enableVisitorTracking: true,
        enableAnimations: true,
        enablePlayground: false,
        enableMoon: true,
        enableThemeSwitcher: true,
        enableCustomCursor: true,
        enableBackground: true,
        debugMode: false,
        accentColor: '#6366f1'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for settings
        const docRef = doc(db, 'settings', 'global');
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setSettings(prev => ({ ...prev, ...doc.data() }));
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to settings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        settings,
        loading
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
