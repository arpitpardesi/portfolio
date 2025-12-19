import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaUsers, FaFolder, FaCamera, FaChartLine, FaEye, FaGlobeAmericas, FaSync, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
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
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [countdown, setCountdown] = useState(30);

    const fetchAnalytics = useCallback(async () => {
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
        setCountdown(30); // Reset countdown
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchAnalytics();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [autoRefresh, fetchAnalytics]);

    // Generate sample trend data (last 7 days)
    const generateTrendData = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const baseVisitors = stats.uniqueVisitors || 100;

        return days.map((day, index) => ({
            day,
            visitors: Math.floor(baseVisitors * 0.8 + Math.random() * (baseVisitors * 0.4)),
            views: Math.floor((baseVisitors * 0.8 + Math.random() * (baseVisitors * 0.4)) * 1.5)
        }));
    };

    // Content distribution data
    const contentDistribution = [
        { name: 'Projects', value: stats.projects, color: '#10b981' },
        { name: 'Photography', value: stats.photography, color: '#f43f5e' },
        { name: 'IOT', value: stats.iot, color: '#0ea5e9' },
        { name: 'AI', value: stats.ai, color: '#8b5cf6' },
        { name: 'Raspberry Pi', value: stats.rpi, color: '#d946ef' }
    ].filter(item => item.value > 0);

    const statCards = [
        {
            title: 'Total Visitors',
            value: stats.totalVisitors,
            icon: <FaEye />,
            color: '#6366f1',
            description: 'Total page views',
            trend: '+12%'
        },
        {
            title: 'Unique Visitors',
            value: stats.uniqueVisitors,
            icon: <FaUsers />,
            color: '#0ea5e9',
            description: 'Unique sessions',
            trend: '+8%'
        },
        {
            title: 'Total Projects',
            value: stats.projects,
            icon: <FaFolder />,
            color: '#10b981',
            description: 'Published projects',
            trend: `${stats.projects} items`
        },
        {
            title: 'Beyond Work',
            value: stats.hobbies,
            icon: <FaGlobeAmericas />,
            color: '#f59e0b',
            description: 'Hub cards',
            trend: `${stats.hobbies} sections`
        },
        {
            title: 'Photography',
            value: stats.photography,
            icon: <FaCamera />,
            color: '#f43f5e',
            description: 'Photo items',
            trend: `${stats.photography} photos`
        },
        {
            title: 'Tech Projects',
            value: stats.iot + stats.ai + stats.rpi,
            icon: <FaChartLine />,
            color: '#8b5cf6',
            description: 'IOT + AI + RPi',
            trend: `${stats.iot + stats.ai + stats.rpi} total`
        }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(10, 18, 36, 0.95)',
                    border: '1px solid rgba(100, 255, 218, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    <p style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                        {payload[0].payload.day}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.9rem' }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: '2rem', color: 'var(--accent-color)' }}
                >
                    <FaSync />
                </motion.div>
                <div style={{ marginTop: '1rem' }}>Loading Analytics...</div>
            </div>
        );
    }

    return (
        <div className="analytics-dashboard">
            {/* Header */}
            <div className="analytics-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 className="analytics-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <FaChartLine style={{ color: 'var(--accent-color)' }} />
                        Analytics Dashboard
                    </h2>
                    <p className="analytics-subtitle" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Overview of your portfolio's performance and content
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Auto-refresh toggle */}
                    <motion.button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`btn ${autoRefresh ? 'btn-primary' : 'btn-outline'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaClock />
                        {autoRefresh ? `Auto (${countdown}s)` : 'Manual'}
                    </motion.button>

                    {/* Manual refresh */}
                    <motion.button
                        onClick={fetchAnalytics}
                        className="btn btn-outline"
                        whileHover={{ scale: 1.05, rotate: 180 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaSync />
                        Refresh
                    </motion.button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="analytics-grid" style={{ marginBottom: '2rem' }}>
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, boxShadow: `0 8px 30px ${card.color}30` }}
                        className="stat-card"
                        style={{
                            borderTop: `3px solid ${card.color}`,
                            background: 'rgba(255, 255, 255, 0.02)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div className="stat-card-header">
                            <div className="stat-icon" style={{
                                color: card.color,
                                background: `${card.color}15`,
                                padding: '0.75rem',
                                borderRadius: '12px',
                                fontSize: '1.5rem'
                            }}>
                                {card.icon}
                            </div>
                            <div className="stat-info" style={{ flex: 1 }}>
                                <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                    {card.title}
                                </div>
                                <div className="stat-value" style={{
                                    color: card.color,
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    lineHeight: '1'
                                }}>
                                    {card.value.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <div className="stat-description" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {card.description}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: card.color,
                                background: `${card.color}15`,
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontWeight: '600'
                            }}>
                                {card.trend}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Visitor Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaChartLine style={{ color: '#6366f1' }} />
                        Visitor Trends (Last 7 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={generateTrendData()}>
                            <defs>
                                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                            <XAxis dataKey="day" stroke="var(--text-secondary)" style={{ fontSize: '0.85rem' }} />
                            <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.85rem' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
                            <Area type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" name="Visitors" />
                            <Area type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" name="Page Views" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Content Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaFolder style={{ color: '#10b981' }} />
                        Content Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={contentDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {contentDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Summary Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.05) 0%, rgba(var(--accent-rgb), 0.02) 100%)',
                    border: '1px solid rgba(var(--accent-rgb), 0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    textAlign: 'center'
                }}
            >
                <FaUsers style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                    Portfolio Engagement
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                    {stats.totalVisitors > 0
                        ? `You've had ${stats.totalVisitors.toLocaleString()} total views from ${stats.uniqueVisitors.toLocaleString()} unique visitors!`
                        : 'Your analytics journey is just beginning! 🚀'}
                </p>
            </motion.div>

            <style>{`
                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }

                .stat-card-header {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }

                @media (max-width: 768px) {
                    .analytics-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .analytics-header > div:last-child {
                        width: 100%;
                        justify-content: center;
                    }

                    .analytics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AnalyticsDashboard;
