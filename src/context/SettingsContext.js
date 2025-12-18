import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        // Hero Section
        heroIntro: 'Hi, my name is',
        heroName: 'Arpit Pardesi.',
        heroSubtitle: 'I turn curiosity into creation.',
        heroDescription: 'I weave together data, design, and code to build experiences that feel intuitive and alive. As a Software Developer, I explore the space where logic meets imagination — architecting solutions, solving puzzles, and shaping ideas into something you can see, feel, and use.',
        heroCTAText: 'Check out my work',

        // About Section
        aboutIntro: "Hello! I'm Arpit — a builder at heart, a learner by nature, and a firm believer that technology is just another form of storytelling.",
        aboutParagraph1: "My journey began with small sparks of curiosity: Why does this work? What happens if I change that? Can I build something new? Those questions carried me into the world of software, where creativity and precision dance together.",
        aboutParagraph2: "Today, I craft data-driven solutions, develop applications, and design meaningful digital experiences. I love blending structure with art — from orchestrating raw ideas and data into solutions to writing code that feels elegant and alive.",
        aboutParagraph3: "When I'm not engineering solutions, you'll find me experimenting: building IoT gadgets, teaching machines to see and talk, or creating playful interfaces powered by AI.",
        aboutParagraph4: "Every project is a chance to explore, to improve, to understand a little more.",

        // Contact Section
        contactLabel: "What's Next?",
        contactTitle: 'Get In Touch',
        contactDescription: "Although I'm not currently looking for any new opportunities, my inbox is always open. Whether you have a question or just want to say hi, I'll try my best to get back to you!",
        contactEmail: 'arpit.pardesi6@gmail.com',
        contactButtonText: 'Say Hello',

        // Footer
        footerDesigner: 'Designed & Developed by Arpit Pardesi',

        // Social Links (Footer)
        githubUrl: 'https://github.com/arpitpardesi',
        linkedinUrl: 'https://www.linkedin.com/in/arpitpardesi/',
        twitterUrl: 'https://twitter.com',
        instagramUrl: 'https://instagram.com',

        // About Profile
        aboutLinkedinUrl: 'https://www.linkedin.com/in/arpitpardesi/',
        aboutImageUrl: 'https://github.com/arpitpardesi.png',

        // Features Toggle
        enableVisitorCounter: true,
        enableThemeSwitcher: true,
        enableCustomCursor: true,
        enableStarfield: true,
        enableMoon: true,

        // Last updated
        lastUpdated: null
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const settingsRef = doc(db, 'settings', 'siteConfig');
            const settingsSnap = await getDoc(settingsRef);

            if (settingsSnap.exists()) {
                setSettings(prev => ({ ...prev, ...settingsSnap.data() }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const value = {
        settings,
        updateSettings,
        loading,
        refreshSettings: fetchSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
