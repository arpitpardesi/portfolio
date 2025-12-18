import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaFolder, FaCamera, FaMicrochip, FaBrain, FaRaspberryPi, FaTimes } from 'react-icons/fa';
import CollectionManager from './admin/CollectionManager';

const AdminDashboard = () => {
    const [error, setError] = useState('');
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState('projects');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch {
            setError('Failed to log out');
        }
    };

    const renderContent = () => {
        switch (selectedSection) {
            case 'projects':
                return <CollectionManager collectionName="projects" title="Projects (Main & Dynamic)" />;
            case 'hobbies':
                return <CollectionManager collectionName="hobbies" title="Beyond Work Content (Hub Cards)" />;
            case 'photography':
                return <CollectionManager collectionName="photography" title="Photography" />;
            case 'iot':
                return <CollectionManager collectionName="iot" title="IOT Projects" />;
            case 'ai':
                return <CollectionManager collectionName="ai" title="AI Projects" />;
            case 'rpi':
                return <CollectionManager collectionName="rpi" title="Raspberry Pi Projects" />;
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            paddingTop: '80px',
            background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
            color: 'var(--text-primary)',
            position: 'relative'
        }}>
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 100,
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--accent-color)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(var(--accent-rgb), 0.4)',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                }}
                className="admin-mobile-toggle"
            >
                {isSidebarOpen ? <FaTimes /> : <FaFolder />}
            </button>

            {/* Sidebar */}
            <aside
                className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}
                style={{
                    width: '260px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '2rem',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: 'calc(100vh - 80px)',
                    left: 0,
                    top: 80,
                    backdropFilter: 'blur(10px)',
                    zIndex: 90,
                    transition: 'transform 0.3s ease'
                }}
            >
                <div style={{ marginBottom: '2rem', color: 'var(--text-secondary)', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Logged in as</div>
                    <div style={{ color: 'var(--accent-color)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <button onClick={() => { setSelectedSection('hobbies'); setIsSidebarOpen(false); }} style={navBtnStyle(selectedSection === 'hobbies')}><FaFolder /> Manage Hobbies (Hub)</button>
                    <button onClick={() => { setSelectedSection('projects'); setIsSidebarOpen(false); }} style={navBtnStyle(selectedSection === 'projects')}><FaFolder /> Projects</button>
                    <button onClick={() => { setSelectedSection('photography'); setIsSidebarOpen(false); }} style={navBtnStyle(selectedSection === 'photography')}><FaCamera /> Photography</button>
                    <button onClick={() => { setSelectedSection('iot'); setIsSidebarOpen(false); }} style={navBtnStyle(selectedSection === 'iot')}><FaMicrochip /> IOT</button>
                    <button onClick={() => { setSelectedSection('ai'); setIsSidebarOpen(false); }} style={navBtnStyle(selectedSection === 'ai')}><FaBrain /> AI</button>
                    <button onClick={() => { setSelectedSection('rpi'); setIsSidebarOpen(false); }} style={navBtnStyle(selectedSection === 'rpi')}><FaRaspberryPi /> Raspberry Pi</button>
                </nav>

                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: 'auto',
                        padding: '12px',
                        background: 'rgba(255,100,100,0.1)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(255,107,107,0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        fontWeight: '500'
                    }}
                >
                    <FaSignOutAlt /> Log Out
                </button>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                padding: '2rem',
                marginLeft: '260px',
                background: 'transparent',
                transition: 'margin-left 0.3s ease'
            }} className="admin-main">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '2rem',
                        backdropFilter: 'blur(20px)',
                        minHeight: '80vh'
                    }}>
                        {renderContent()}
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 1024px) {
                    .admin-sidebar {
                        transform: translateX(-100%);
                    }
                    .admin-sidebar.open {
                        transform: translateX(0);
                    }
                    .admin-main {
                        margin-left: 0 !important;
                        padding: 1rem !important;
                    }
                    .admin-mobile-toggle {
                        display: flex !important;
                    }
                }
                @media (max-width: 480px) {
                    .admin-sidebar {
                        width: 100% !important;
                        top: 0 !important;
                        height: 100vh !important;
                    }
                }
            `}</style>
        </div>
    );
};

const navBtnStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    background: isActive ? 'rgba(var(--accent-rgb), 0.15)' : 'transparent',
    color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
    border: isActive ? '1px solid rgba(var(--accent-rgb), 0.2)' : '1px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.2s ease',
    width: '100%'
});

export default AdminDashboard;
