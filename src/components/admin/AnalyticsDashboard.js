import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaUsers, FaFolder, FaCamera, FaChartLine, FaEye, FaGlobeAmericas } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Admin.css';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalVisitors: 0,
        uniqueVisitors: 0,
        projects: 0,
        hobbies: 0,
        photography: 0,
        iot: 0,
        ai: 0,
        rpi: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch visitor stats
            const visitorRef = doc(db, 'stats', 'visitors');
            const visitorSnap = await getDoc(visitorRef);
            const visitorData = visitorSnap.exists() ? visitorSnap.data() : {};

            // Fetch collection counts
            const collections = ['projects', 'hobbies', 'photography', 'iot', 'ai', 'rpi'];
            const counts = {};

            for (const collectionName of collections) {
                const snapshot = await getDocs(collection(db, collectionName));
                counts[collectionName] = snapshot.size;
            }

            setStats({
                totalVisitors: visitorData.count || 0,
                uniqueVisitors: visitorData.unique || 0,
                ...counts
            });
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
        setLoading(false);
    };

    const statCards = [
        {
            title: 'Total Visitors',
            value: stats.totalVisitors,
            icon: <FaEye />,
            color: '#6366f1',
            description: 'Total page views'
        },
        {
            title: 'Unique Visitors',
            value: stats.uniqueVisitors,
            icon: <FaUsers />,
            color: '#0ea5e9',
            description: 'Unique sessions'
        },
        {
            title: 'Projects',
            value: stats.projects,
            icon: <FaFolder />,
            color: '#10b981',
            description: 'Total projects'
        },
        {
            title: 'Hub Cards',
            value: stats.hobbies,
            icon: <FaGlobeAmericas />,
            color: '#f59e0b',
            description: 'Beyond Work items'
        },
        {
            title: 'Photography',
            value: stats.photography,
            icon: <FaCamera />,
            color: '#f43f5e',
            description: 'Photo gallery items'
        },
        {
            title: 'IOT + AI + RPi',
            value: stats.iot + stats.ai + stats.rpi,
            icon: <FaChartLine />,
            color: '#8b5cf6',
            description: 'Tech projects'
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <div className="loading-spinner">Loading Analytics...</div>
            </div>
        );
    }

    return (
        <div className="analytics-dashboard">
            <div className="analytics-header">
                <h2 className="analytics-title">
                    <FaChartLine style={{ marginRight: '0.75rem' }} />
                    Analytics Dashboard
                </h2>
                <p className="analytics-subtitle">
                    Overview of your portfolio's performance and content
                </p>
            </div>

            <div className="analytics-grid">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="stat-card"
                        style={{ borderTop: `3px solid ${card.color}` }}
                    >
                        <div className="stat-card-header">
                            <div className="stat-icon" style={{ color: card.color }}>
                                {card.icon}
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">{card.title}</div>
                                <div className="stat-value" style={{ color: card.color }}>
                                    {card.value.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="stat-description">{card.description}</div>
                    </motion.div>
                ))}
            </div>

            <div className="analytics-footer">
                <motion.button
                    onClick={fetchAnalytics}
                    className="btn btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Refresh Data
                </motion.button>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
