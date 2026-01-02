import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaFolder, FaCamera, FaMicrochip, FaBrain, FaRaspberryPi, FaChartLine, FaTimes, FaClock, FaCode, FaCog } from 'react-icons/fa';
import CollectionManager from './admin/CollectionManager';
import TimelineManager from './admin/TimelineManager';
import SkillsManager from './admin/SkillsManager';
import AnalyticsDashboard from './admin/AnalyticsDashboard';
import SettingsManager from './admin/SettingsManager';
import './admin/Admin.css';

const AdminDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState('analytics');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch {
            console.error('Failed to log out');
        }
    };

    const renderContent = () => {
        switch (selectedSection) {
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'projects':
                return <CollectionManager key="projects" collectionName="projects" title="Projects (Main & Dynamic)" />;
            case 'hobbies':
                return <CollectionManager key="hobbies" collectionName="hobbies" title="Beyond Work Content (Hub Cards)" />;
            case 'photography':
                return <CollectionManager key="photography" collectionName="photography" title="Photography" />;
            case 'iot':
                return <CollectionManager key="iot" collectionName="iot" title="IOT Projects" />;
            case 'ai':
                return <CollectionManager key="ai" collectionName="ai" title="AI Projects" />;
            case 'rpi':
                return <CollectionManager key="rpi" collectionName="rpi" title="Raspberry Pi Projects" />;
            case 'timeline':
                return <TimelineManager />;
            case 'skills':
                return <SkillsManager />;
            case 'settings':
                return <SettingsManager />;
            default:
                return <div>Select a section</div>;
        }
    };

    const navItems = [
        { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
        { id: 'timeline', label: 'Timeline', icon: <FaClock /> },
        { id: 'skills', label: 'Skills', icon: <FaCode /> },
        { id: 'hobbies', label: 'Manage Hobbies (Hub)', icon: <FaFolder /> },
        { id: 'projects', label: 'Projects', icon: <FaFolder /> },
        { id: 'photography', label: 'Photography', icon: <FaCamera /> },
        { id: 'iot', label: 'IOT', icon: <FaMicrochip /> },
        { id: 'ai', label: 'AI', icon: <FaBrain /> },
        { id: 'rpi', label: 'Raspberry Pi', icon: <FaRaspberryPi /> },
        { id: 'settings', label: 'Settings', icon: <FaCog /> },
    ];

    return (
        <div className="admin-container">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`admin-mobile-toggle ${isSidebarOpen ? 'open' : ''}`}
            >
                {isSidebarOpen ? <FaTimes /> : <FaFolder />}
            </button>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-user-info">
                    <span className="admin-label">Logged in as</span>
                    <div className="admin-email" title={currentUser?.email}>{currentUser?.email}</div>
                </div>

                <nav className="admin-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setSelectedSection(item.id); setIsSidebarOpen(false); }}
                            className={`nav-btn ${selectedSection === item.id ? 'active' : ''}`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}

                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt /> Log Out
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                <div className="admin-content-card">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
