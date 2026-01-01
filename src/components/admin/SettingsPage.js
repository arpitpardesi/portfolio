import React from 'react';
import './Admin.css';

const SettingsPage = () => {
    return (
        <div className="settings-page" style={{ color: 'var(--text-primary)' }}>
            <h2 className="collection-title">Settings</h2>
            <div className="settings-content" style={{ padding: '1rem' }}>
                <p>System settings configuration will appear here.</p>
                {/* Future settings can be added here */}
            </div>
        </div>
    );
};

export default SettingsPage;
