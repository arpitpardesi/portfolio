import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FaSave, FaCog, FaGlobe, FaLink, FaServer, FaHome, FaUser, FaInstagram } from 'react-icons/fa';
import './Admin.css';

const SettingsManager = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('content');

    // Default settings state
    const [settings, setSettings] = useState({
        // General
        siteTitle: 'Arpit Pardesi | Portfolio',
        logoText: 'ARPIT',
        contactEmail: 'arpit.pardesi6@gmail.com',
        footerText: '© 2026 Arpit Pardesi. All rights reserved.',

        // Social / Links
        resumeUrl: '',
        githubUrl: 'https://github.com/arpitpardesi',
        linkedinUrl: 'https://www.linkedin.com/in/arpitpardesi/',
        twitterUrl: 'https://x.com/arpit_pardesi',
        instagramUrl: 'https://www.instagram.com/arpitpardesi',

        // System / Features
        maintenanceMode: false,
        enableVisitorTracking: true,
        enableAnimations: true,
        enablePlayground: true,
        enableMoon: true,
        enableThemeSwitcher: true,
        enableCustomCursor: true,
        enableBackground: true,
        debugMode: false,

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

        // Theme defaults
        defaultTheme: 'dark',
        accentColor: '#6366f1'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'settings', 'global');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSettings(prev => ({ ...prev, ...docSnap.data() }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({ text: 'Failed to load settings.', type: 'error' });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const docRef = doc(db, 'settings', 'global');
            await setDoc(docRef, {
                ...settings,
                updatedAt: serverTimestamp()
            }, { merge: true });

            setMessage({ text: 'Settings saved successfully!', type: 'success' });

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ text: 'Failed to save settings. Please try again.', type: 'error' });
        }
        setSaving(false);
    };

    if (loading) {
        return <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>Loading Settings...</div>;
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h2 className="settings-title">
                    <FaCog style={{ marginRight: '0.75rem', color: 'var(--accent-color)' }} />
                    Global Settings
                </h2>
                <p className="settings-subtitle">Manage global configuration for your portfolio application.</p>
            </div>

            {/* Tabs Navigation */}
            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('content')}
                >
                    <FaHome className="settings-tab-icon" /> Page Content
                </button>
                <button
                    className={`settings-tab ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveTab('social')}
                >
                    <FaLink className="settings-tab-icon" /> Social Media
                </button>
                <button
                    className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    <FaServer className="settings-tab-icon" /> System Config
                </button>
            </div>

            {message.text && (
                <div className={`save-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="settings-sections">

                    {/* Page Content Tab */}
                    <div className={`settings-section ${activeTab === 'content' ? '' : 'hidden'}`}>
                        <div className="settings-section-header">
                            <div className="settings-section-icon"><FaGlobe /></div>
                            <h3 className="settings-section-title">Page Content</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Customize the text and content across your portfolio's main sections.
                        </p>

                        {/* Header Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Header</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="settings-label">Site Title (Browser Tab)</label>
                                    <input
                                        type="text"
                                        name="siteTitle"
                                        value={settings.siteTitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Logo Text</label>
                                    <input
                                        type="text"
                                        name="logoText"
                                        value={settings.logoText}
                                        onChange={handleChange}
                                        className="settings-input"
                                        placeholder="ARPIT"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hero Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Hero Section</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="settings-label">Intro Text</label>
                                    <input
                                        type="text"
                                        name="heroIntro"
                                        value={settings.heroIntro}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Name</label>
                                    <input
                                        type="text"
                                        name="heroName"
                                        value={settings.heroName}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Subtitle</label>
                                    <input
                                        type="text"
                                        name="heroSubtitle"
                                        value={settings.heroSubtitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Description</label>
                                    <textarea
                                        name="heroDescription"
                                        value={settings.heroDescription}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">CTA Text</label>
                                    <input
                                        type="text"
                                        name="heroCtaText"
                                        value={settings.heroCtaText}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">CTA Link</label>
                                    <input
                                        type="text"
                                        name="heroCtaLink"
                                        value={settings.heroCtaLink}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* About Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>About Section</h4>
                            <div className="settings-fields">
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Section Title</label>
                                    <input
                                        type="text"
                                        name="aboutTitle"
                                        value={settings.aboutTitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio Paragraph 1</label>
                                    <textarea
                                        name="aboutText1"
                                        value={settings.aboutText1}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio Paragraph 2</label>
                                    <textarea
                                        name="aboutText2"
                                        value={settings.aboutText2}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio Paragraph 3</label>
                                    <textarea
                                        name="aboutText3"
                                        value={settings.aboutText3}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Bio Paragraph 4</label>
                                    <textarea
                                        name="aboutText4"
                                        value={settings.aboutText4}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Closing Line</label>
                                    <input
                                        type="text"
                                        name="aboutFooter"
                                        value={settings.aboutFooter}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Profile Image URL</label>
                                    <input
                                        type="url"
                                        name="profileImage"
                                        value={settings.profileImage}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Contact Section</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="settings-label">Subtitle (Small)</label>
                                    <input
                                        type="text"
                                        name="contactSubtitle"
                                        value={settings.contactSubtitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Main Title</label>
                                    <input
                                        type="text"
                                        name="contactTitle"
                                        value={settings.contactTitle}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Description Text</label>
                                    <textarea
                                        name="contactText"
                                        value={settings.contactText}
                                        onChange={handleChange}
                                        className="settings-textarea settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">CTA Button Text</label>
                                    <input
                                        type="text"
                                        name="contactCta"
                                        value={settings.contactCta}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Contact Email</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={settings.contactEmail}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Subsection */}
                        <div>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Footer</h4>
                            <div className="settings-fields">
                                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="settings-label">Footer Copyright Text</label>
                                    <input
                                        type="text"
                                        name="footerText"
                                        value={settings.footerText}
                                        onChange={handleChange}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social & Links */}
                    <div className={`settings-section ${activeTab === 'social' ? '' : 'hidden'}`}>
                        <div className="settings-section-header">
                            <div className="settings-section-icon"><FaLink /></div>
                            <h3 className="settings-section-title">Social Media & Links</h3>
                        </div>
                        <div className="settings-fields">
                            <div className="settings-field">
                                <label className="settings-label">Resume / CV URL</label>
                                <input
                                    type="url"
                                    name="resumeUrl"
                                    value={settings.resumeUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="settings-field">
                                <label className="settings-label">GitHub URL</label>
                                <input
                                    type="url"
                                    name="githubUrl"
                                    value={settings.githubUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <div className="settings-field">
                                <label className="settings-label">LinkedIn URL</label>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    value={settings.linkedinUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div className="settings-field">
                                <label className="settings-label">Twitter / X URL</label>
                                <input
                                    type="url"
                                    name="twitterUrl"
                                    value={settings.twitterUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                            <div className="settings-field">
                                <label className="settings-label">Instagram URL</label>
                                <input
                                    type="url"
                                    name="instagramUrl"
                                    value={settings.instagramUrl}
                                    onChange={handleChange}
                                    className="settings-input"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Configuration */}
                    <div className={`settings-section ${activeTab === 'system' ? '' : 'hidden'}`}>
                        <div className="settings-section-header">
                            <div className="settings-section-icon"><FaServer /></div>
                            <h3 className="settings-section-title">System Configuration</h3>
                        </div>

                        {/* Appearance Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Appearance</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="settings-label">Default Accent Color</label>
                                    <input
                                        type="color"
                                        name="accentColor"
                                        value={settings.accentColor}
                                        onChange={handleChange}
                                        className="color-input"
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Show Moon Icon</span>
                                        <input
                                            type="checkbox"
                                            name="enableMoon"
                                            checked={settings.enableMoon}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Show Theme Switcher</span>
                                        <input
                                            type="checkbox"
                                            name="enableThemeSwitcher"
                                            checked={settings.enableThemeSwitcher}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Show Playground</span>
                                        <input
                                            type="checkbox"
                                            name="enablePlayground"
                                            checked={settings.enablePlayground}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Performance & Visuals Subsection */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Performance & Visuals</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable Detailed Background</span>
                                        <input
                                            type="checkbox"
                                            name="enableBackground"
                                            checked={settings.enableBackground}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                    <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Disabling this removes the particle background to save resources.
                                    </small>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable UI Animations</span>
                                        <input
                                            type="checkbox"
                                            name="enableAnimations"
                                            checked={settings.enableAnimations}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                    <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Smooth transitions and motion effects. Disable for better performance on low-end devices.
                                    </small>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable Custom Cursor</span>
                                        <input
                                            type="checkbox"
                                            name="enableCustomCursor"
                                            checked={settings.enableCustomCursor}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* System & Admin Subsection */}
                        <div>
                            <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>System & Admin</h4>
                            <div className="settings-fields">
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Maintenance Mode</span>
                                        <input
                                            type="checkbox"
                                            name="maintenanceMode"
                                            checked={settings.maintenanceMode}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                    <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        If enabled, non-admin users will see a maintenance page.
                                    </small>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Enable Visitor Tracking</span>
                                        <input
                                            type="checkbox"
                                            name="enableVisitorTracking"
                                            checked={settings.enableVisitorTracking}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                                <div className="settings-field">
                                    <label className="toggle-btn" style={{ justifyContent: 'space-between' }}>
                                        <span>Debug Mode</span>
                                        <input
                                            type="checkbox"
                                            name="debugMode"
                                            checked={settings.debugMode}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="settings-footer">
                    <button
                        type="submit"
                        className="btn btn-primary btn-large"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="admin-spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FaSave /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsManager;
