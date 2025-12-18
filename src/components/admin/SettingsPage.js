import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FaCog, FaPalette, FaEye, FaGlobe, FaEnvelope, FaSave, FaToggleOn, FaToggleOff, FaRocket, FaUser, FaCode } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Admin.css';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        // Header
        headerName: 'ARPIT',
        headerNavItems: 'About, Projects, Contact',
        headerBeyondWorkLink: 'Beyond Work',

        // Hero Section
        heroIntro: 'Hi, my name is',
        heroName: 'Arpit Pardesi.',
        heroSubtitle: 'I turn curiosity into creation.',
        heroDescription: 'I weave together data, design, and code to build experiences that feel intuitive and alive. As a Software Developer, I explore the space where logic meets imagination — architecting solutions, solving puzzles, and shaping ideas into something you can see, feel, and use.',
        heroCTAText: 'Check out my work',

        // About Section
        aboutTitle: 'About Me',
        aboutIntro: "Hello! I'm Arpit — a builder at heart, a learner by nature, and a firm believer that technology is just another form of storytelling.",
        aboutParagraph1: "My journey began with small sparks of curiosity: Why does this work? What happens if I change that? Can I build something new? Those questions carried me into the world of software, where creativity and precision dance together.",
        aboutParagraph2: "Today, I craft data-driven solutions, develop applications, and design meaningful digital experiences. I love blending structure with art — from orchestrating raw ideas and data into solutions to writing code that feels elegant and alive.",
        aboutParagraph3: "When I'm not engineering solutions, you'll find me experimenting: building IoT gadgets, teaching machines to see and talk, or creating playful interfaces powered by AI.",
        aboutClosing: "Every project is a chance to explore, to improve, to understand a little more.",
        aboutSkillsLabel: "Here are a few technologies I've been working with recently:",
        aboutSkills: 'Python, FastAPI, LLM, SQL, Git, Github, Linux, Docker, React, Machine Learning',
        aboutImageUrl: 'https://github.com/arpitpardesi.png',
        aboutImageAlt: 'Arpit Pardesi',
        aboutLinkedinUrl: 'https://www.linkedin.com/in/arpitpardesi/',

        // Contact Section
        contactLabel: "What's Next?",
        contactTitle: 'Get In Touch',
        contactDescription: "Although I'm not currently looking for any new opportunities, my inbox is always open. Whether you have a question or just want to say hi, I'll try my best to get back to you!",
        contactEmail: 'arpit.pardesi6@gmail.com',
        contactButtonText: 'Say Hello',

        // Footer
        footerDesigner: 'Designed & Developed by Arpit Pardesi',
        footerCopyright: 'All rights reserved.',

        // Social Links (used in both Header and Footer)
        githubUrl: 'https://github.com/arpitpardesi',
        linkedinUrl: 'https://www.linkedin.com/in/arpitpardesi/',
        twitterUrl: 'https://x.com/arpit_pardesi',
        instagramUrl: 'https://www.instagram.com/arpitpardesi',

        // Features Toggle
        enableVisitorCounter: true,
        enableThemeSwitcher: true,
        enableCustomCursor: true,
        enableStarfield: true,
        enableMoon: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const settingsRef = doc(db, 'settings', 'siteConfig');
            const settingsSnap = await getDoc(settingsRef);

            if (settingsSnap.exists()) {
                setSettings(prev => ({ ...prev, ...settingsSnap.data() }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage('');

        try {
            const settingsRef = doc(db, 'settings', 'siteConfig');
            await setDoc(settingsRef, {
                ...settings,
                lastUpdated: new Date()
            });

            setSaveMessage('Settings saved successfully! ✓ Refresh the page to see changes.');
            setTimeout(() => setSaveMessage(''), 5000);
        } catch (error) {
            console.error("Error saving settings:", error);
            setSaveMessage('Error saving settings ✗');
        }

        setSaving(false);
    };

    const handleInputChange = (field, value) => {
        setSettings({ ...settings, [field]: value });
    };

    const handleToggle = (field) => {
        setSettings({ ...settings, [field]: !settings[field] });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <div className="loading-spinner">Loading Settings...</div>
            </div>
        );
    }

    const settingsSections = [
        {
            title: 'Header',
            icon: <FaCog />,
            fields: [
                { label: 'Header Name/Logo', field: 'headerName', type: 'text', placeholder: 'ARPIT', help: 'Letters displayed in header logo' },
                { label: 'Navigation Items', field: 'headerNavItems', type: 'text', placeholder: 'About, Projects, Contact', help: 'Comma-separated list' },
                { label: 'Beyond Work Link Text', field: 'headerBeyondWorkLink', type: 'text', placeholder: 'Beyond Work' }
            ]
        },
        {
            title: 'Hero Section',
            icon: <FaRocket />,
            fields: [
                { label: 'Intro Text', field: 'heroIntro', type: 'text', placeholder: 'Hi, my name is' },
                { label: 'Your Name', field: 'heroName', type: 'text', placeholder: 'Arpit Pardesi.' },
                { label: 'Subtitle/Tagline', field: 'heroSubtitle', type: 'text', placeholder: 'I turn curiosity into creation.' },
                { label: 'Description', field: 'heroDescription', type: 'textarea', placeholder: 'I weave together data, design, and code...' },
                { label: 'CTA Button Text', field: 'heroCTAText', type: 'text', placeholder: 'Check out my work' }
            ]
        },
        {
            title: 'About Section',
            icon: <FaUser />,
            fields: [
                { label: 'Section Title', field: 'aboutTitle', type: 'text', placeholder: 'About Me' },
                { label: 'Opening Statement', field: 'aboutIntro', type: 'textarea', placeholder: 'Hello! I\'m Arpit...' },
                { label: 'Paragraph 1', field: 'aboutParagraph1', type: 'textarea', placeholder: 'My journey began...' },
                { label: 'Paragraph 2', field: 'aboutParagraph2', type: 'textarea', placeholder: 'Today, I craft...' },
                { label: 'Paragraph 3', field: 'aboutParagraph3', type: 'textarea', placeholder: 'When I\'m not engineering...' },
                { label: 'Closing Statement', field: 'aboutClosing', type: 'textarea', placeholder: 'Every project is a chance...' },
                { label: 'Skills Label', field: 'aboutSkillsLabel', type: 'text', placeholder: 'Here are a few technologies...' },
                { label: 'Skills List', field: 'aboutSkills', type: 'text', placeholder: 'Python, React, Node.js...', help: 'Comma-separated list of skills' },
                { label: 'Profile Image URL', field: 'aboutImageUrl', type: 'text', placeholder: 'https://github.com/arpitpardesi.png' },
                { label: 'Image Alt Text', field: 'aboutImageAlt', type: 'text', placeholder: 'Arpit Pardesi' },
                { label: 'LinkedIn Profile URL', field: 'aboutLinkedinUrl', type: 'text', placeholder: 'https://linkedin.com/in/...' }
            ]
        },
        {
            title: 'Contact Section',
            icon: <FaEnvelope />,
            fields: [
                { label: 'Label Text', field: 'contactLabel', type: 'text', placeholder: 'What\'s Next?' },
                { label: 'Title', field: 'contactTitle', type: 'text', placeholder: 'Get In Touch' },
                { label: 'Description', field: 'contactDescription', type: 'textarea', placeholder: 'Although I\'m not currently looking...' },
                { label: 'Email Address', field: 'contactEmail', type: 'email', placeholder: 'your@email.com' },
                { label: 'Button Text', field: 'contactButtonText', type: 'text', placeholder: 'Say Hello' }
            ]
        },
        {
            title: 'Footer',
            icon: <FaCode />,
            fields: [
                { label: 'Designer/Developer Text', field: 'footerDesigner', type: 'text', placeholder: 'Designed & Developed by...' },
                { label: 'Copyright Text', field: 'footerCopyright', type: 'text', placeholder: 'All rights reserved.' }
            ]
        },
        {
            title: 'Social Links',
            icon: <FaGlobe />,
            description: 'URLs used in header and footer',
            fields: [
                { label: 'GitHub URL', field: 'githubUrl', type: 'text', placeholder: 'https://github.com/username' },
                { label: 'LinkedIn URL', field: 'linkedinUrl', type: 'text', placeholder: 'https://linkedin.com/in/username' },
                { label: 'Twitter/X URL', field: 'twitterUrl', type: 'text', placeholder: 'https://x.com/username' },
                { label: 'Instagram URL', field: 'instagramUrl', type: 'text', placeholder: 'https://instagram.com/username' }
            ]
        },
        {
            title: 'Feature Toggles',
            icon: <FaEye />,
            description: 'Enable/disable portfolio features',
            fields: [
                { label: 'Visitor Counter', field: 'enableVisitorCounter', type: 'toggle' },
                { label: 'Theme Switcher', field: 'enableThemeSwitcher', type: 'toggle' },
                { label: 'Custom Cursor', field: 'enableCustomCursor', type: 'toggle' },
                { label: 'Starfield Background', field: 'enableStarfield', type: 'toggle' },
                { label: 'Moon Animation', field: 'enableMoon', type: 'toggle' }
            ]
        }
    ];

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h2 className="settings-title">
                    <FaPalette style={{ marginRight: '0.75rem' }} />
                    Portfolio Settings
                </h2>
                <p className="settings-subtitle">
                    Customize all text content and features across your portfolio
                </p>
            </div>

            {saveMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`save-message ${saveMessage.includes('✓') ? 'success' : 'error'}`}
                >
                    {saveMessage}
                </motion.div>
            )}

            <div className="settings-sections">
                {settingsSections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="settings-section"
                    >
                        <div className="settings-section-header">
                            <div className="settings-section-icon">{section.icon}</div>
                            <div>
                                <h3 className="settings-section-title">{section.title}</h3>
                                {section.description && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                        {section.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="settings-fields">
                            {section.fields.map((field) => (
                                <div key={field.field} className="settings-field">
                                    <label className="settings-label">
                                        {field.label}
                                        {field.help && <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '0.5rem' }}>({field.help})</span>}
                                    </label>

                                    {field.type === 'toggle' ? (
                                        <button
                                            onClick={() => handleToggle(field.field)}
                                            className={`toggle-btn ${settings[field.field] ? 'active' : ''}`}
                                        >
                                            {settings[field.field] ? (
                                                <>
                                                    <FaToggleOn /> Enabled
                                                </>
                                            ) : (
                                                <>
                                                    <FaToggleOff /> Disabled
                                                </>
                                            )}
                                        </button>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            value={settings[field.field]}
                                            onChange={(e) => handleInputChange(field.field, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="settings-input settings-textarea"
                                            rows={3}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={settings[field.field]}
                                            onChange={(e) => handleInputChange(field.field, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="settings-input"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="settings-footer">
                <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary btn-large"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaSave style={{ marginRight: '0.5rem' }} />
                    {saving ? 'Saving...' : 'Save All Settings'}
                </motion.button>
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    💡 Tip: Changes will take effect after saving and refreshing the portfolio page
                </p>
            </div>
        </div>
    );
};

export default SettingsPage;
