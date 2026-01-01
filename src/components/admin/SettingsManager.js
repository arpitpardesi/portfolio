import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useSettings } from '../../context/SettingsContext';
import { FaUser, FaEnvelope, FaShareAlt, FaPalette, FaSave, FaHome, FaFileAlt } from 'react-icons/fa';

const SettingsManager = () => {
    const { settings, loading } = useSettings();
    const [formData, setFormData] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await setDoc(doc(db, 'settings', 'global'), formData, { merge: true });
            setMessage({ text: 'Settings saved successfully!', type: 'success' });
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ text: 'Error saving settings.', type: 'error' });
        }
        setSaving(false);
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Helper for nested updates (e.g. home.about.text1)
    const handleNestedChange = (section, subsection, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section]?.[subsection],
                    [field]: value
                }
            }
        }));
    };

    if (loading || !formData) return <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading settings...</div>;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <FaUser /> },
        { id: 'home_content', label: 'Home Content', icon: <FaHome /> },
        { id: 'pages_content', label: 'Pages Content', icon: <FaFileAlt /> },
        { id: 'contact', label: 'Contact Info', icon: <FaEnvelope /> },
        { id: 'social', label: 'Social Links', icon: <FaShareAlt /> },
        { id: 'theme', label: 'Theme & Features', icon: <FaPalette /> },
        { id: 'pages', label: 'Visibility', icon: <FaPalette /> },
    ];

    return (
        <div style={{ color: 'var(--text-primary)', maxWidth: '100%' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>Global Settings</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your portfolio's core content, text, and configuration.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: activeTab === tab.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Display Name</label>
                            <input
                                className="form-input"
                                value={formData.profile?.name || ''}
                                onChange={e => handleChange('profile', 'name', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Subtitle (Hero Section)</label>
                            <input
                                className="form-input"
                                value={formData.profile?.subtitle || ''}
                                onChange={e => handleChange('profile', 'subtitle', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Bio / Description (Hero Section)</label>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '120px' }}
                                value={formData.profile?.description || ''}
                                onChange={e => handleChange('profile', 'description', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Resume Link (URL)</label>
                            <input
                                className="form-input"
                                value={formData.profile?.resumeLink || ''}
                                onChange={e => handleChange('profile', 'resumeLink', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Home Content Tab */}
                {activeTab === 'home_content' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                        {/* About Section */}
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                            <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>About Section</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" value={formData.home?.about?.title || ''} onChange={e => handleNestedChange('home', 'about', 'title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Intro Text</label>
                                    <textarea className="form-textarea" value={formData.home?.about?.text1 || ''} onChange={e => handleNestedChange('home', 'about', 'text1', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Journey Text</label>
                                    <textarea className="form-textarea" value={formData.home?.about?.text2 || ''} onChange={e => handleNestedChange('home', 'about', 'text2', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Current Work Text</label>
                                    <textarea className="form-textarea" value={formData.home?.about?.text3 || ''} onChange={e => handleNestedChange('home', 'about', 'text3', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Profile Image URL</label>
                                    <input className="form-input" value={formData.home?.about?.image || ''} onChange={e => handleNestedChange('home', 'about', 'image', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Projects Section */}
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                            <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>Projects Section</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" value={formData.home?.projects?.title || ''} onChange={e => handleNestedChange('home', 'projects', 'title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subtitle (for SEO/Alt)</label>
                                    <input className="form-input" value={formData.home?.projects?.subtitle || ''} onChange={e => handleNestedChange('home', 'projects', 'subtitle', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div>
                            <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>Contact Section</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Section Title</label>
                                    <input className="form-input" value={formData.home?.contact?.title || ''} onChange={e => handleNestedChange('home', 'contact', 'title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subtitle / Label</label>
                                    <input className="form-input" value={formData.home?.contact?.subtitle || ''} onChange={e => handleNestedChange('home', 'contact', 'subtitle', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description Text</label>
                                    <textarea className="form-textarea" value={formData.home?.contact?.text || ''} onChange={e => handleNestedChange('home', 'contact', 'text', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Button Text</label>
                                    <input className="form-input" value={formData.home?.contact?.buttonText || ''} onChange={e => handleNestedChange('home', 'contact', 'buttonText', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pages Content Tab */}
                {activeTab === 'pages_content' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                        {/* Detailed About Page */}
                        <div>
                            <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>Detailed About Page</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Hero Title</label>
                                    <input className="form-input" value={formData.pages?.detailedAbout?.heroTitle || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'heroTitle', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hero Subtitle</label>
                                    <textarea className="form-textarea" value={formData.pages?.detailedAbout?.heroSubtitle || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'heroSubtitle', e.target.value)} />
                                </div>

                                <h4 style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Origin Story</h4>
                                <div className="form-group">
                                    <label className="form-label">Paragraph 1</label>
                                    <textarea className="form-textarea" value={formData.pages?.detailedAbout?.originText1 || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'originText1', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Paragraph 2</label>
                                    <textarea className="form-textarea" value={formData.pages?.detailedAbout?.originText2 || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'originText2', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Paragraph 3</label>
                                    <textarea className="form-textarea" value={formData.pages?.detailedAbout?.originText3 || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'originText3', e.target.value)} />
                                </div>

                                <h4 style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Section Titles</h4>
                                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Journey Title</label>
                                        <input className="form-input" value={formData.pages?.detailedAbout?.journeyTitle || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'journeyTitle', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Education Title</label>
                                        <input className="form-input" value={formData.pages?.detailedAbout?.educationTitle || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'educationTitle', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Skills Title</label>
                                        <input className="form-input" value={formData.pages?.detailedAbout?.skillsTitle || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'skillsTitle', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Beyond Code Title</label>
                                        <input className="form-input" value={formData.pages?.detailedAbout?.beyondTitle || ''} onChange={e => handleNestedChange('pages', 'detailedAbout', 'beyondTitle', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Info Tab */}
                {activeTab === 'contact' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Primary Email</label>
                            <input
                                className="form-input"
                                value={formData.contact?.email || ''}
                                onChange={e => handleChange('contact', 'email', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone (Optional)</label>
                            <input
                                className="form-input"
                                value={formData.contact?.phone || ''}
                                onChange={e => handleChange('contact', 'phone', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Social Tab */}
                {activeTab === 'social' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">GitHub URL</label>
                            <input
                                className="form-input"
                                value={formData.social?.github || ''}
                                onChange={e => handleChange('social', 'github', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">LinkedIn URL</label>
                            <input
                                className="form-input"
                                value={formData.social?.linkedin || ''}
                                onChange={e => handleChange('social', 'linkedin', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">X (Twitter) URL</label>
                            <input
                                className="form-input"
                                value={formData.social?.twitter || ''}
                                onChange={e => handleChange('social', 'twitter', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instagram URL</label>
                            <input
                                className="form-input"
                                value={formData.social?.instagram || ''}
                                onChange={e => handleChange('social', 'instagram', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Theme Tab */}
                {activeTab === 'theme' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enable or disable core features of the site.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.features?.showMoon ?? true}
                                    onChange={e => handleChange('features', 'showMoon', e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                />
                                Show Moon
                            </label>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.features?.showCursor ?? true}
                                    onChange={e => handleChange('features', 'showCursor', e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                />
                                Show Custom Cursor
                            </label>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.features?.showBackground ?? true}
                                    onChange={e => handleChange('features', 'showBackground', e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                />
                                Show Background
                            </label>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.features?.showThemeSwitcher ?? true}
                                    onChange={e => handleChange('features', 'showThemeSwitcher', e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                />
                                Show Theme Switcher
                            </label>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.features?.showParticles ?? true}
                                    onChange={e => handleChange('features', 'showParticles', e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                />
                                Show Particles
                            </label>
                        </div>

                        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ffbd2e' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.features?.maintenanceMode || false}
                                    onChange={e => handleChange('features', 'maintenanceMode', e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                />
                                Enable Maintenance Mode
                            </label>
                        </div>
                    </div>
                )}

                {/* Pages Visibility Tab */}
                {activeTab === 'pages' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Home Page Sections</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showHero ?? true}
                                        onChange={e => handleChange('features', 'showHero', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show Hero
                                </label>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showAbout ?? true}
                                        onChange={e => handleChange('features', 'showAbout', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show About Section
                                </label>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showHomeProjects ?? true}
                                        onChange={e => handleChange('features', 'showHomeProjects', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show Projects Section
                                </label>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showHomeContact ?? true}
                                        onChange={e => handleChange('features', 'showHomeContact', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show Contact Section
                                </label>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Standalone Pages</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showDetailedAbout ?? true}
                                        onChange={e => handleChange('features', 'showDetailedAbout', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show Full About Page
                                </label>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showAllProjects ?? true}
                                        onChange={e => handleChange('features', 'showAllProjects', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show All Projects Page
                                </label>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showBeyondWork ?? true}
                                        onChange={e => handleChange('features', 'showBeyondWork', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show Beyond Work (Hub)
                                </label>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showPlayground ?? true}
                                        onChange={e => handleChange('features', 'showPlayground', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show Physics Playground
                                </label>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.features?.showPhotography ?? true}
                                        onChange={e => handleChange('features', 'showPhotography', e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                    />
                                    Show Photography
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
                    </button>
                    {message.text && (
                        <span style={{ color: message.type === 'success' ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                            {message.text}
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SettingsManager;
