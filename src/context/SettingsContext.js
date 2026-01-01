import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

const defaultSettings = {
    profile: {
        name: "Arpit Pardesi.",
        subtitle: "I turn curiosity into creation.",
        description: "I weave together data, design, and code to build experiences that feel intuitive and alive. As a Software Developer, I explore the space where logic meets imagination — architecting solutions, solving puzzles, and shaping ideas into something you can see, feel, and use.",
        resumeLink: "#"
    },
    contact: {
        email: "arpit.pardesi6@gmail.com",
        phone: ""
    },
    social: {
        github: "https://github.com/arpitpardesi",
        linkedin: "https://www.linkedin.com/in/arpitpardesi/",
        twitter: "https://x.com/arpit_pardesi",
        instagram: "https://www.instagram.com/arpitpardesi"
    },
    features: {
        // Global
        maintenanceMode: false,
        showMoon: true,
        showCursor: true,
        showBackground: true,
        showThemeSwitcher: true,
        showParticles: true,

        // Home Sections
        showHero: true,
        showAbout: true,
        showHomeProjects: true,
        showHomeContact: true,

        // Pages
        showDetailedAbout: true,
        showAllProjects: true,
        showBeyondWork: true,
        showPlayground: true,
        showPhotography: true
    },
    home: {
        about: {
            title: "About Me",
            text1: "Hello! I’m Arpit — a builder at heart, a learner by nature, and a firm believer that technology is just another form of storytelling.",
            text2: "My journey began with small sparks of curiosity: Why does this work? What happens if I change that? Can I build something new? Those questions carried me into the world of software, where creativity and precision dance together.",
            text3: "Today, I craft data-driven solutions, develop applications, and design meaningful digital experiences. I love blending structure with art — from orchestrating raw ideas and data into solutions to writing code that feels elegant and alive.",
            techIntro: "Here are a few technologies I've been working with recently:",
            image: "https://github.com/arpitpardesi.png"
        },
        projects: {
            title: "Some Things I've Built",
            subtitle: "Explorer. Engineer. Creator.",
            viewAllText: "View All Projects"
        },
        contact: {
            title: "Get In Touch",
            subtitle: "What's Next?",
            text: "I'm currently looking for new opportunities, and my inbox is always open. Whether you have a question, a project idea, or just want to say hi, I'll try my best to get back to you!",
            buttonText: "Say Hello"
        }
    },
    pages: {
        detailedAbout: {
            heroTitle: "About Me",
            heroSubtitle: "Explorer. Engineer. Creator. \nTurning coffee into code and ideas into reality.",
            originTitle: "The Origin Story",
            originText1: "I'm a developer who loves building things that matter. Whether it's crafting seamless web experiences, architecting scalable backends, or experimenting with AI and machine learning, I'm driven by the joy of creating solutions that make a difference.",
            originText2: "Currently pursuing B.Tech in Computer Science at MPSTME, Mumbai, I combine academic knowledge with hands-on experience in full-stack development, machine learning, and cloud technologies.",
            originText3: "When I'm not coding, you'll find me tinkering with IoT devices, exploring photography, or diving deep into the latest AI research. Every project is an opportunity to learn, grow, and push the boundaries of what's possible.",
            journeyTitle: "Professional Journey",
            educationTitle: "Education",
            skillsTitle: "Technical Arsenal",
            beyondTitle: "Beyond Code",
            beyondText: "When I step away from the terminal, you'll find me exploring the intersection of technology and creativity — from capturing moments through photography to building smart IoT devices and experimenting with AI."
        }
    }
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
            if (doc.exists()) {
                setSettings({ ...defaultSettings, ...doc.data() });
            } else {
                console.log("No global settings found, using defaults");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching settings:", error);
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
