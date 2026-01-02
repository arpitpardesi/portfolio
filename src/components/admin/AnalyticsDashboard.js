import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaUsers, FaFolder, FaChartLine, FaEye, FaGlobeAmericas, FaSync, FaClock, FaMapMarkedAlt, FaFire, FaTrophy, FaMobileAlt, FaDesktop, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
    AreaChart, Area, Legend
} from 'recharts';
import './Admin.css';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalVisitors: 0,
        projects: 0,
        hobbies: 0,
        photography: 0,
        iot: 0,
        ai: 0,
        rpi: 0
    });
    const [visitorLocations, setVisitorLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [countdown, setCountdown] = useState(30);
    const [dateRange, setDateRange] = useState(30); // Days to show

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

            // Fetch visitor location data
            const locationSnapshot = await getDocs(collection(db, 'visitor_logs'));
            const locations = locationSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVisitorLocations(locations);

            setStats({
                totalVisitors: visitorData.count || 0,
                ...counts
            });
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
        setLoading(false);
        setCountdown(30);
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

    // Calculate geographic distribution
    const getGeographicDistribution = () => {
        const countryCount = {};
        visitorLocations.forEach(loc => {
            const country = loc.country || 'Unknown';
            countryCount[country] = (countryCount[country] || 0) + 1;
        });

        const colors = ['#10b981', '#0ea5e9', '#f43f5e', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];

        return Object.entries(countryCount)
            .map(([name, value], index) => ({
                name,
                value,
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    };

    // Get top cities
    const getTopCities = () => {
        const cityCount = {};
        visitorLocations.forEach(loc => {
            const key = `${loc.city}, ${loc.countryCode}`;
            cityCount[key] = (cityCount[key] || 0) + 1;
        });

        return Object.entries(cityCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    };

    // Get visitor trends
    const getVisitorTrends = () => {
        const trends = {};
        const now = new Date();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - dateRange);

        // Initialize all dates in range with 0
        for (let d = new Date(cutoff); d <= now; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            trends[dateStr] = 0;
        }

        visitorLocations.forEach(loc => {
            if (loc.timestamp) {
                const date = loc.timestamp.toDate ? loc.timestamp.toDate() : new Date(loc.timestamp);
                if (date >= cutoff) {
                    const dateStr = date.toISOString().split('T')[0];
                    if (trends[dateStr] !== undefined) {
                        trends[dateStr]++;
                    }
                }
            }
        });

        return Object.entries(trends).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            visitors: count
        }));
    };

    // Get device stats
    const getDeviceStats = () => {
        const stats = { Desktop: 0, Mobile: 0, Tablet: 0, Unknown: 0 };
        visitorLocations.forEach(loc => {
            const type = loc.deviceType || 'Desktop'; // Default to Desktop for old data
            stats[type] = (stats[type] || 0) + 1;
        });

        return Object.entries(stats)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    };

    // Get browser stats
    const getBrowserStats = () => {
        const stats = {};
        visitorLocations.forEach(loc => {
            const browser = loc.browser || 'Unknown';
            stats[browser] = (stats[browser] || 0) + 1;
        });

        return Object.entries(stats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    };

    // Get recently active visitors (keep existing functionality)
    const getRecentActivity = () => {
        return visitorLocations
            .filter(loc => loc.timestamp)
            .sort((a, b) => {
                const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(0);
                const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(0);
                return timeB - timeA;
            })
            .slice(0, 5);
    };

    // Get Peak Activity (Hourly)
    const getPeakActivity = () => {
        const hours = Array(24).fill(0).map((_, i) => ({
            hour: i,
            label: i === 0 ? '12am' : i === 12 ? '12pm' : i > 12 ? `${i - 12}pm` : `${i}am`,
            visitors: 0
        }));

        visitorLocations.forEach(loc => {
            if (loc.timestamp) {
                const date = loc.timestamp.toDate ? loc.timestamp.toDate() : new Date(loc.timestamp);
                const hour = date.getHours();
                hours[hour].visitors++;
            }
        });

        return hours;
    };

    const deviceColors = { Desktop: '#6366f1', Mobile: '#10b981', Tablet: '#f59e0b', Unknown: '#94a3b8' };
    const browserColors = ['#0ea5e9', '#f43f5e', '#8b5cf6', '#f59e0b', '#10b981'];

    const geoDistribution = getGeographicDistribution();
    const topCities = getTopCities();
    const recentActivity = getRecentActivity();
    const uniqueCountries = new Set(visitorLocations.map(l => l.country)).size;
    const uniqueCities = new Set(visitorLocations.map(l => l.city)).size;

    const enhancedStatCards = [
        {
            title: 'Total Visitors',
            value: stats.totalVisitors,
            icon: <FaEye />,
            color: '#6366f1',
            subtitle: `${visitorLocations.length} sessions tracked`,
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        },
        {
            title: 'Countries Reached',
            value: uniqueCountries,
            icon: <FaGlobeAmericas />,
            color: '#10b981',
            subtitle: `From ${uniqueCities} cities`,
            gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
        },
        {
            title: 'Total Content',
            value: stats.projects + stats.hobbies + stats.photography + stats.iot + stats.ai + stats.rpi,
            icon: <FaFolder />,
            color: '#f59e0b',
            subtitle: 'Across all sections',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
        },
        {
            title: 'Engagement Score',
            value: Math.min(100, Math.floor((visitorLocations.length / Math.max(stats.totalVisitors, 1)) * 100)),
            icon: <FaFire />,
            color: '#ef4444',
            subtitle: 'Session quality',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
            suffix: '%'
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
                        {payload[0].payload.name}
                    </p>
                    <p style={{ color: payload[0].color, margin: 0, fontSize: '0.9rem' }}>
                        Visitors: {payload[0].value}
                    </p>
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
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '700' }}>
                        <FaChartLine style={{ color: 'var(--accent-color)' }} />
                        Analytics Dashboard
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
                        Real-time insights into your portfolio's performance
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 0.5rem' }}>
                        <FaCalendarAlt style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }} />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(Number(e.target.value))}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                padding: '0.5rem',
                                outline: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                            <option value={90}>Last 90 Days</option>
                        </select>
                    </div>

                    <motion.button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`btn ${autoRefresh ? 'btn-primary' : 'btn-outline'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaClock />
                        {autoRefresh ? `${countdown}s` : 'Manual'}
                    </motion.button>

                    <motion.button
                        onClick={fetchAnalytics}
                        className="btn btn-outline"
                        whileHover={{ scale: 1.05, rotate: 180 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                    >
                        <FaSync />
                        Refresh
                    </motion.button>
                </div>
            </div>

            {/* Enhanced Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {enhancedStatCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        style={{
                            background: card.gradient,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.1, color: '#fff' }}>
                            {card.icon}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                {card.title}
                            </div>
                            <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                {card.value.toLocaleString()}{card.suffix || ''}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                                {card.subtitle}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Visitor Trends Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '2rem'
                }}
            >
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                    <FaChartLine style={{ color: '#0ea5e9' }} />
                    Visitor Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getVisitorTrends()}>
                        <defs>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                        <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                        <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="visitors" stroke="#6366f1" fillOpacity={1} fill="url(#colorVisitors)" />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Device & Browser Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Device Stats */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                        <FaMobileAlt style={{ color: '#f59e0b' }} />
                        Device Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={getDeviceStats()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {getDeviceStats().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={deviceColors[entry.name] || '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Browser Stats */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
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
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                        <FaDesktop style={{ color: '#8b5cf6' }} />
                        Browser Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={getBrowserStats()}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {getBrowserStats().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={browserColors[index % browserColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Geographic Distribution & Top Cities */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Geographic Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                        <FaMapMarkedAlt style={{ color: '#10b981' }} />
                        Geographic Distribution
                    </h3>
                    {geoDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={geoDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {geoDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No geographic data available
                        </div>
                    )}
                </motion.div>

                {/* Top Cities */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
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
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                        <FaTrophy style={{ color: '#f59e0b' }} />
                        Top Cities
                    </h3>
                    {topCities.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topCities} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                <XAxis type="number" stroke="var(--text-secondary)" style={{ fontSize: '0.85rem' }} />
                                <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: '0.85rem' }} width={100} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No city data available
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '2.5rem'
                }}
            >
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                    <FaClock style={{ color: '#6366f1' }} />
                    Recent Activity
                </h3>

                {recentActivity.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentActivity.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ background: 'rgba(255, 255, 255, 0.02)', scale: 1.01 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} 0%, ${['#8b5cf6', '#14b8a6', '#f97316', '#f43f5e', '#c084fc'][index % 5]} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: '700',
                                        fontSize: '0.9rem'
                                    }}>
                                        {activity.countryCode}
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '0.25rem' }}>
                                            {activity.city}, {activity.country}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {activity.region}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                                    {activity.timestamp?.toDate ?
                                        new Date(activity.timestamp.toDate()).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'N/A'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No recent activity
                    </div>
                )}
            </motion.div>

            {/* Peak Activity (Hourly) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '2.5rem'
                }}
            >
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                    <FaClock style={{ color: '#ec4899' }} />
                    Peak Activity (Hourly)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getPeakActivity()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                        <XAxis dataKey="label" stroke="var(--text-secondary)" style={{ fontSize: '0.7rem' }} interval={2} />
                        <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                        <Tooltip
                            contentStyle={{ background: 'rgba(10, 18, 36, 0.95)', border: '1px solid rgba(100, 255, 218, 0.2)' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="visitors" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Portfolio Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.1) 0%, rgba(var(--accent-rgb), 0.05) 100%)',
                    border: '1px solid rgba(var(--accent-rgb), 0.2)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center'
                }}
            >
                <FaUsers style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '1rem' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: '0.5rem 0', fontSize: '1.5rem' }}>
                    Portfolio Impact
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                    {stats.totalVisitors > 0
                        ? `Your portfolio has reached ${uniqueCountries.toLocaleString()} ${uniqueCountries === 1 ? 'country' : 'countries'} with ${stats.totalVisitors.toLocaleString()} total visitors. Keep up the great work! 🚀`
                        : 'Your analytics journey is just beginning! 🚀'}
                </p>
            </motion.div>

            <style>{`
                .analytics-dashboard {
                    animation: fadeIn 0.5s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @media (max-width: 768px) {
                    .analytics-dashboard > div:first-child {
                        flex-direction: column;
                        align-items: flex-start !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AnalyticsDashboard;
