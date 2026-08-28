import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import {
    FaUsers, FaFolder, FaChartLine, FaEye, FaGlobeAmericas, FaSync,
    FaClock, FaMapMarkedAlt, FaFire, FaTrophy, FaMobileAlt, FaDesktop,
    FaCalendarAlt, FaArrowUp, FaArrowDown, FaDownload, FaSearch,
    FaRoute, FaChartBar, FaChartArea, FaFilter, FaLaptop,
    FaTabletAlt, FaExclamationCircle
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    XAxis, YAxis, CartesianGrid, AreaChart, Area, Legend, ReferenceLine,
    LineChart, Line
} from 'recharts';
import './Admin.css';

// Safe timestamp parser supporting Firestore Timestamps, ISO strings, and Epoch numbers
const parseTimestamp = (timestamp) => {
    if (!timestamp) return null;
    try {
        if (typeof timestamp.toDate === 'function') {
            const d = timestamp.toDate();
            return isNaN(d.getTime()) ? null : d;
        }
        if (timestamp instanceof Date) {
            return isNaN(timestamp.getTime()) ? null : timestamp;
        }
        if (typeof timestamp === 'object') {
            if (typeof timestamp.seconds === 'number') {
                const d = new Date(timestamp.seconds * 1000);
                return isNaN(d.getTime()) ? null : d;
            }
            if (typeof timestamp._seconds === 'number') {
                const d = new Date(timestamp._seconds * 1000);
                return isNaN(d.getTime()) ? null : d;
            }
        }
        if (typeof timestamp === 'number') {
            const d = new Date(timestamp);
            return isNaN(d.getTime()) ? null : d;
        }
        if (typeof timestamp === 'string') {
            const d = new Date(timestamp);
            return isNaN(d.getTime()) ? null : d;
        }
    } catch (e) {
        return null;
    }
    return null;
};

// Formats a local date to YYYY-MM-DD string to avoid UTC timezone jumping
const getLocalDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalVisitors: 0,
        projects: 0,
        hobbies: 0,
        photography: 0,
        iot: 0,
        ai: 0,
        rpi: 0,
        blogs: 0
    });
    const [visitorLocations, setVisitorLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [countdown, setCountdown] = useState(30);

    // Trend Chart Controls
    const [dateRange, setDateRange] = useState('30'); // '1', '7', '14', '30', '90', '365', 'all'
    const [trendViewMode, setTrendViewMode] = useState('daily'); // 'daily', 'unique', 'cumulative'
    const [chartType, setChartType] = useState('area'); // 'area', 'bar', 'line'

    // Live Activity Logs Filter & Search
    const [logSearch, setLogSearch] = useState('');
    const [logDeviceFilter, setLogDeviceFilter] = useState('all');
    const [logsLimit, setLogsLimit] = useState(10);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch visitor count from stats
            const visitorRef = doc(db, 'stats', 'visitors');
            const visitorSnap = await getDoc(visitorRef);
            const visitorData = visitorSnap.exists() ? visitorSnap.data() : {};

            // Fetch collection counts
            const collections = ['projects', 'hobbies', 'photography', 'iot', 'ai', 'rpi', 'blogs'];
            const counts = {};

            for (const collectionName of collections) {
                try {
                    const snapshot = await getDocs(collection(db, collectionName));
                    counts[collectionName] = snapshot.size;
                } catch {
                    counts[collectionName] = 0;
                }
            }

            // Fetch visitor location data
            const locationSnapshot = await getDocs(collection(db, 'visitor_logs'));
            const locations = locationSnapshot.docs.map(doc => {
                const data = doc.data();
                const parsedDate = parseTimestamp(data.timestamp);
                return {
                    id: doc.id,
                    ...data,
                    parsedDate
                };
            });

            setVisitorLocations(locations);
            setStats({
                totalVisitors: visitorData.count || locations.length || 0,
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

    // Auto-refresh timer
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

    // Compute Visitor Trends with safe timezone and date aggregation
    const trendAnalysis = useMemo(() => {
        const now = new Date();
        const validLogs = visitorLocations.filter(loc => loc.parsedDate instanceof Date);

        if (dateRange === '1') {
            // Last 24 Hours / Today Hourly breakdown
            const hours = Array(24).fill(0).map((_, i) => {
                const hourDate = new Date(now);
                hourDate.setHours(i, 0, 0, 0);
                const label = i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`;
                return {
                    hour: i,
                    date: label,
                    rawDate: hourDate,
                    visitors: 0,
                    uniqueSet: new Set(),
                    uniqueVisitors: 0,
                    cumulative: 0
                };
            });

            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

            validLogs.forEach(loc => {
                if (loc.parsedDate >= startOfToday && loc.parsedDate <= now) {
                    const h = loc.parsedDate.getHours();
                    if (hours[h]) {
                        hours[h].visitors++;
                        const identifier = loc.ip || loc.id;
                        if (identifier) hours[h].uniqueSet.add(identifier);
                    }
                }
            });

            let runningSum = 0;
            const data = hours.map(h => {
                runningSum += h.visitors;
                return {
                    date: h.date,
                    visitors: h.visitors,
                    uniqueVisitors: h.uniqueSet.size,
                    cumulative: runningSum
                };
            });

            const total = data.reduce((acc, curr) => acc + curr.visitors, 0);
            const totalUnique = new Set(validLogs.filter(l => l.parsedDate >= startOfToday).map(l => l.ip || l.id)).size;
            const peak = [...data].sort((a, b) => b.visitors - a.visitors)[0] || { date: 'N/A', visitors: 0 };
            const activeHoursCount = Math.max(now.getHours() + 1, 1);
            const avg = (total / activeHoursCount).toFixed(1);

            return {
                chartData: data,
                total,
                unique: totalUnique,
                dailyAvg: avg,
                avgUnit: 'per hour',
                peakDate: peak.date,
                peakCount: peak.visitors,
                growth: null
            };
        }

        // Multi-day aggregation
        let daysCount = parseInt(dateRange, 10);
        if (dateRange === 'all') {
            if (validLogs.length > 0) {
                const earliest = validLogs.reduce((min, loc) => loc.parsedDate < min ? loc.parsedDate : min, validLogs[0].parsedDate);
                const diffTime = Math.abs(now - earliest);
                daysCount = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 7);
            } else {
                daysCount = 30;
            }
        }

        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysCount - 1), 0, 0, 0);
        const prevPeriodStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - daysCount, 0, 0, 0);

        // Build empty calendar map
        const dateBuckets = {};
        for (let i = 0; i < daysCount; i++) {
            const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
            const key = getLocalDateKey(d);
            const label = daysCount <= 30
                ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: daysCount > 90 ? '2-digit' : undefined });

            dateBuckets[key] = {
                key,
                date: label,
                rawDate: d,
                visitors: 0,
                uniqueSet: new Set(),
                uniqueVisitors: 0,
                cumulative: 0
            };
        }

        let prevPeriodTotal = 0;
        const currentPeriodUniqueSet = new Set();

        validLogs.forEach(loc => {
            const locDate = loc.parsedDate;
            const identifier = loc.ip || loc.id;

            if (locDate >= startDate && locDate <= now) {
                const key = getLocalDateKey(locDate);
                if (dateBuckets[key]) {
                    dateBuckets[key].visitors++;
                    if (identifier) {
                        dateBuckets[key].uniqueSet.add(identifier);
                        currentPeriodUniqueSet.add(identifier);
                    }
                }
            } else if (locDate >= prevPeriodStart && locDate < startDate) {
                prevPeriodTotal++;
            }
        });

        let runningSum = 0;
        const chartData = Object.values(dateBuckets).map(bucket => {
            runningSum += bucket.visitors;
            return {
                date: bucket.date,
                visitors: bucket.visitors,
                uniqueVisitors: bucket.uniqueSet.size,
                cumulative: runningSum
            };
        });

        const total = chartData.reduce((acc, curr) => acc + curr.visitors, 0);
        const unique = currentPeriodUniqueSet.size;
        const dailyAvg = (total / Math.max(daysCount, 1)).toFixed(1);
        const peak = [...chartData].sort((a, b) => b.visitors - a.visitors)[0] || { date: 'N/A', visitors: 0 };

        let growth = null;
        if (prevPeriodTotal > 0) {
            growth = Math.round(((total - prevPeriodTotal) / prevPeriodTotal) * 100);
        } else if (total > 0 && prevPeriodTotal === 0) {
            growth = 100;
        }

        return {
            chartData,
            total,
            unique,
            dailyAvg,
            avgUnit: 'per day',
            peakDate: peak.date,
            peakCount: peak.visitors,
            growth
        };
    }, [visitorLocations, dateRange]);

    // Device distribution
    const deviceStats = useMemo(() => {
        const counts = { Desktop: 0, Mobile: 0, Tablet: 0, Unknown: 0 };
        visitorLocations.forEach(loc => {
            const type = loc.deviceType || 'Desktop';
            counts[type] = (counts[type] || 0) + 1;
        });

        return Object.entries(counts)
            .filter(([, val]) => val > 0)
            .map(([name, value]) => ({ name, value }));
    }, [visitorLocations]);

    // Browser distribution
    const browserStats = useMemo(() => {
        const counts = {};
        visitorLocations.forEach(loc => {
            const browser = loc.browser || 'Unknown';
            counts[browser] = (counts[browser] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [visitorLocations]);

    // OS Distribution
    const osStats = useMemo(() => {
        const counts = {};
        visitorLocations.forEach(loc => {
            const os = loc.os || 'Unknown';
            counts[os] = (counts[os] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [visitorLocations]);

    // Geographic distribution
    const geoDistribution = useMemo(() => {
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
    }, [visitorLocations]);

    // Top Cities
    const topCities = useMemo(() => {
        const cityCount = {};
        visitorLocations.forEach(loc => {
            const city = loc.city || 'Unknown';
            const country = loc.countryCode || '';
            const key = country ? `${city}, ${country}` : city;
            cityCount[key] = (cityCount[key] || 0) + 1;
        });

        return Object.entries(cityCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [visitorLocations]);

    // Top Visited Routes / Sections
    const topSections = useMemo(() => {
        const sectionMap = {};
        visitorLocations.forEach(loc => {
            let path = loc.path || '/';
            if (path === '/' || path === '' || path === '#') path = 'Home Overview';
            else if (path.includes('projects')) path = 'Projects';
            else if (path.includes('timeline') || path.includes('experience')) path = 'Timeline & Journey';
            else if (path.includes('skill')) path = 'Skills & Arsenal';
            else if (path.includes('hobbies') || path.includes('beyond')) path = 'Beyond Work (Hub)';
            else if (path.includes('photo')) path = 'Photography';
            else if (path.includes('blog')) path = 'Blog Posts';
            else if (path.includes('iot')) path = 'IoT Section';
            else if (path.includes('ai')) path = 'AI Projects';
            else if (path.includes('rpi')) path = 'Raspberry Pi';

            sectionMap[path] = (sectionMap[path] || 0) + 1;
        });

        const total = visitorLocations.length || 1;
        return Object.entries(sectionMap)
            .map(([name, count]) => ({
                name,
                count,
                percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [visitorLocations]);

    // Peak Activity (Hourly breakdown overall)
    const peakHourlyActivity = useMemo(() => {
        const hours = Array(24).fill(0).map((_, i) => ({
            hour: i,
            label: i === 0 ? '12am' : i === 12 ? '12pm' : i > 12 ? `${i - 12}pm` : `${i}am`,
            visitors: 0
        }));

        visitorLocations.forEach(loc => {
            if (loc.parsedDate) {
                const hour = loc.parsedDate.getHours();
                if (hours[hour]) {
                    hours[hour].visitors++;
                }
            }
        });

        return hours;
    }, [visitorLocations]);

    // Filtered Recent Visitor Logs
    const filteredLogs = useMemo(() => {
        return visitorLocations
            .filter(loc => {
                if (logDeviceFilter !== 'all' && (loc.deviceType || 'Desktop').toLowerCase() !== logDeviceFilter.toLowerCase()) {
                    return false;
                }
                if (logSearch.trim()) {
                    const q = logSearch.toLowerCase();
                    const matchCity = loc.city?.toLowerCase().includes(q);
                    const matchCountry = loc.country?.toLowerCase().includes(q);
                    const matchIp = loc.ip?.toLowerCase().includes(q);
                    const matchBrowser = loc.browser?.toLowerCase().includes(q);
                    const matchOs = loc.os?.toLowerCase().includes(q);
                    const matchPath = loc.path?.toLowerCase().includes(q);
                    return matchCity || matchCountry || matchIp || matchBrowser || matchOs || matchPath;
                }
                return true;
            })
            .sort((a, b) => {
                const timeA = a.parsedDate ? a.parsedDate.getTime() : 0;
                const timeB = b.parsedDate ? b.parsedDate.getTime() : 0;
                return timeB - timeA;
            });
    }, [visitorLocations, logSearch, logDeviceFilter]);

    // Export Visitor Data to CSV
    const exportToCSV = () => {
        if (!visitorLocations.length) return;
        const headers = ['Timestamp (UTC)', 'Date (Local)', 'Time (Local)', 'IP', 'Country', 'Country Code', 'City', 'Region', 'Device', 'OS', 'Browser', 'Path'];
        const rows = visitorLocations.map(loc => {
            const d = loc.parsedDate;
            return [
                d ? d.toISOString() : 'N/A',
                d ? d.toLocaleDateString() : 'N/A',
                d ? d.toLocaleTimeString() : 'N/A',
                loc.ip || 'Unknown',
                `"${(loc.country || 'Unknown').replace(/"/g, '""')}"`,
                loc.countryCode || 'XX',
                `"${(loc.city || 'Unknown').replace(/"/g, '""')}"`,
                `"${(loc.region || 'Unknown').replace(/"/g, '""')}"`,
                loc.deviceType || 'Desktop',
                loc.os || 'Unknown',
                loc.browser || 'Unknown',
                `"${(loc.path || '/').replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `portfolio_visitors_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Universal Chart Tooltip
    const CustomChartTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload || {};
            const title = label || dataPoint.name || dataPoint.date || dataPoint.label || 'Visitors';
            return (
                <div style={{
                    background: 'rgba(10, 18, 36, 0.95)',
                    border: '1px solid rgba(100, 255, 218, 0.25)',
                    borderRadius: '10px',
                    padding: '0.85rem 1.1rem',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    minWidth: '160px'
                }}>
                    <div style={{
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingBottom: '0.35rem'
                    }}>
                        {title}
                    </div>
                    {payload.map((entry, idx) => {
                        const displayName = entry.name === 'visitors' ? 'Total Visits'
                            : entry.name === 'uniqueVisitors' ? 'Unique Visitors'
                            : entry.name === 'cumulative' ? 'Cumulative Visits'
                            : entry.name || 'Count';
                        const color = entry.color || entry.stroke || entry.fill || '#6366f1';
                        return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.3rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                                    {displayName}:
                                </span>
                                <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
                                    {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const deviceColors = { Desktop: '#6366f1', Mobile: '#10b981', Tablet: '#f59e0b', Unknown: '#94a3b8' };
    const browserColors = ['#0ea5e9', '#f43f5e', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
    const uniqueCountries = new Set(visitorLocations.map(l => l.country).filter(Boolean)).size;
    const uniqueCities = new Set(visitorLocations.map(l => l.city).filter(Boolean)).size;

    const totalContentItems = stats.projects + stats.hobbies + stats.photography + stats.iot + stats.ai + stats.rpi + stats.blogs;

    const enhancedStatCards = [
        {
            title: 'Total Visitors',
            value: stats.totalVisitors,
            icon: <FaEye />,
            color: '#6366f1',
            subtitle: `${visitorLocations.length} detailed logs tracked`,
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        },
        {
            title: 'Countries Reached',
            value: uniqueCountries,
            icon: <FaGlobeAmericas />,
            color: '#10b981',
            subtitle: `Across ${uniqueCities} global cities`,
            gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
        },
        {
            title: 'Total Portfolio Content',
            value: totalContentItems,
            icon: <FaFolder />,
            color: '#f59e0b',
            subtitle: 'Projects, blogs & showcases',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
        },
        {
            title: 'Active Engagement',
            value: Math.min(100, Math.floor((visitorLocations.length / Math.max(stats.totalVisitors, 1)) * 100)),
            icon: <FaFire />,
            color: '#ef4444',
            subtitle: 'Log tracking coverage',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
            suffix: '%'
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-secondary)' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: '2.5rem', color: 'var(--accent-color)' }}
                >
                    <FaSync />
                </motion.div>
                <div style={{ marginTop: '1.25rem', fontSize: '1.1rem', fontWeight: '500' }}>Synchronizing Portfolio Analytics...</div>
            </div>
        );
    }

    return (
        <div className="analytics-dashboard">
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '700' }}>
                        <FaChartLine style={{ color: 'var(--accent-color)' }} />
                        Analytics Dashboard
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                        Real-time visitor trends, traffic sources & audience engagement
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <motion.button
                        onClick={exportToCSV}
                        className="btn btn-outline"
                        title="Download raw visitor logs as CSV"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}
                    >
                        <FaDownload /> Export CSV
                    </motion.button>

                    <motion.button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`btn ${autoRefresh ? 'btn-primary' : 'btn-outline'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <FaClock />
                        {autoRefresh ? `Auto: ${countdown}s` : 'Auto: Off'}
                    </motion.button>

                    <motion.button
                        onClick={fetchAnalytics}
                        className="btn btn-outline"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}
                    >
                        <FaSync />
                        Refresh
                    </motion.button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {enhancedStatCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        style={{
                            background: card.gradient,
                            borderRadius: '16px',
                            padding: '1.4rem 1.5rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '4.5rem', opacity: 0.12, color: '#fff' }}>
                            {card.icon}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>
                                {card.title}
                            </div>
                            <div style={{ color: '#fff', fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                                {card.value.toLocaleString()}{card.suffix || ''}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.78rem' }}>
                                {card.subtitle}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* UPGRADED VISITOR TRENDS SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '18px',
                    padding: '1.75rem',
                    backdropFilter: 'blur(12px)',
                    marginBottom: '2.5rem',
                    position: 'relative'
                }}
            >
                {/* Header & Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingBottom: '1.25rem'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem', fontWeight: '600' }}>
                            <FaChartLine style={{ color: '#6366f1' }} />
                            Visitor Traffic Trends
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                            Interactive volume analytics over selected timeframe
                        </p>
                    </div>

                    {/* Toolbar Controls */}
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Time Range Selector */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '2px 8px'
                        }}>
                            <FaCalendarAlt style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginRight: '6px' }} />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    padding: '6px 4px',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}
                            >
                                <option value="1" style={{ background: '#0f172a' }}>Today (24h)</option>
                                <option value="7" style={{ background: '#0f172a' }}>Last 7 Days</option>
                                <option value="14" style={{ background: '#0f172a' }}>Last 14 Days</option>
                                <option value="30" style={{ background: '#0f172a' }}>Last 30 Days</option>
                                <option value="90" style={{ background: '#0f172a' }}>Last 90 Days</option>
                                <option value="365" style={{ background: '#0f172a' }}>Last 1 Year</option>
                                <option value="all" style={{ background: '#0f172a' }}>All Time</option>
                            </select>
                        </div>

                        {/* Metric View Mode */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '3px'
                        }}>
                            <button
                                onClick={() => setTrendViewMode('daily')}
                                style={{
                                    background: trendViewMode === 'daily' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                                    color: trendViewMode === 'daily' ? '#a5b4fc' : 'var(--text-secondary)',
                                    border: trendViewMode === 'daily' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                                    borderRadius: '7px',
                                    padding: '4px 10px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: trendViewMode === 'daily' ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {dateRange === '1' ? 'Hourly' : 'Daily'}
                            </button>
                            <button
                                onClick={() => setTrendViewMode('unique')}
                                style={{
                                    background: trendViewMode === 'unique' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                                    color: trendViewMode === 'unique' ? '#6ee7b7' : 'var(--text-secondary)',
                                    border: trendViewMode === 'unique' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                                    borderRadius: '7px',
                                    padding: '4px 10px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: trendViewMode === 'unique' ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Unique vs Total
                            </button>
                            <button
                                onClick={() => setTrendViewMode('cumulative')}
                                style={{
                                    background: trendViewMode === 'cumulative' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                                    color: trendViewMode === 'cumulative' ? '#fcd34d' : 'var(--text-secondary)',
                                    border: trendViewMode === 'cumulative' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                                    borderRadius: '7px',
                                    padding: '4px 10px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: trendViewMode === 'cumulative' ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cumulative Growth
                            </button>
                        </div>

                        {/* Chart Style Toggle */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '3px'
                        }}>
                            <button
                                onClick={() => setChartType('area')}
                                title="Area Curve Chart"
                                style={{
                                    background: chartType === 'area' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    color: chartType === 'area' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: '7px',
                                    padding: '6px 8px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FaChartArea />
                            </button>
                            <button
                                onClick={() => setChartType('bar')}
                                title="Bar Chart"
                                style={{
                                    background: chartType === 'bar' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    color: chartType === 'bar' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: '7px',
                                    padding: '6px 8px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FaChartBar />
                            </button>
                            <button
                                onClick={() => setChartType('line')}
                                title="Line Chart"
                                style={{
                                    background: chartType === 'line' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    color: chartType === 'line' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: '7px',
                                    padding: '6px 8px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FaChartLine />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trend KPI Snapshot Pills */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.75rem'
                }}>
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem'
                    }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.2rem' }}>Total in Period</div>
                        <div style={{ color: '#a5b4fc', fontSize: '1.4rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                            {trendAnalysis.total.toLocaleString()}
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem'
                    }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.2rem' }}>Unique Visitors</div>
                        <div style={{ color: '#6ee7b7', fontSize: '1.4rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                            {trendAnalysis.unique.toLocaleString()}
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem'
                    }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.2rem' }}>Average ({trendAnalysis.avgUnit})</div>
                        <div style={{ color: '#fcd34d', fontSize: '1.4rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                            {trendAnalysis.dailyAvg}
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(236, 72, 153, 0.08)',
                        border: '1px solid rgba(236, 72, 153, 0.2)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem'
                    }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.2rem' }}>Peak Traffic</div>
                        <div style={{ color: '#f472b6', fontSize: '1.2rem', fontWeight: '700' }}>
                            {trendAnalysis.peakCount} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({trendAnalysis.peakDate})</span>
                        </div>
                    </div>

                    {trendAnalysis.growth !== null && (
                        <div style={{
                            background: trendAnalysis.growth >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: `1px solid ${trendAnalysis.growth >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                            borderRadius: '12px',
                            padding: '0.85rem 1rem'
                        }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.2rem' }}>Period Growth</div>
                            <div style={{
                                color: trendAnalysis.growth >= 0 ? '#10b981' : '#ef4444',
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                {trendAnalysis.growth >= 0 ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                                {Math.abs(trendAnalysis.growth)}%
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Dynamic Chart */}
                {trendAnalysis.chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'bar' ? (
                                <BarChart data={trendAnalysis.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} tickMargin={8} />
                                    <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} allowDecimals={false} />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    {trendViewMode === 'unique' ? (
                                        <>
                                            <Bar dataKey="visitors" name="Total Visits" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="uniqueVisitors" name="Unique Visitors" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.85rem' }} />
                                        </>
                                    ) : trendViewMode === 'cumulative' ? (
                                        <Bar dataKey="cumulative" name="Cumulative Visits" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    ) : (
                                        <Bar dataKey="visitors" name="Visits" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    )}
                                    <ReferenceLine y={Number(trendAnalysis.dailyAvg) || 0} stroke="rgba(245, 158, 11, 0.6)" strokeDasharray="4 4" />
                                </BarChart>
                            ) : chartType === 'line' ? (
                                <LineChart data={trendAnalysis.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} tickMargin={8} />
                                    <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} allowDecimals={false} />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    {trendViewMode === 'unique' ? (
                                        <>
                                            <Line type="monotone" dataKey="visitors" name="Total Visits" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.85rem' }} />
                                        </>
                                    ) : trendViewMode === 'cumulative' ? (
                                        <Line type="monotone" dataKey="cumulative" name="Cumulative Visits" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                    ) : (
                                        <Line type="monotone" dataKey="visitors" name="Visits" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                    )}
                                    <ReferenceLine y={Number(trendAnalysis.dailyAvg) || 0} stroke="rgba(245, 158, 11, 0.6)" strokeDasharray="4 4" />
                                </LineChart>
                            ) : (
                                <AreaChart data={trendAnalysis.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradientVisitors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradientUnique" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradientCumulative" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} tickMargin={8} />
                                    <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} allowDecimals={false} />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    {trendViewMode === 'unique' ? (
                                        <>
                                            <Area type="monotone" dataKey="visitors" name="Total Visits" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientVisitors)" />
                                            <Area type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientUnique)" />
                                            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.85rem' }} />
                                        </>
                                    ) : trendViewMode === 'cumulative' ? (
                                        <Area type="monotone" dataKey="cumulative" name="Cumulative Visits" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientCumulative)" />
                                    ) : (
                                        <Area type="monotone" dataKey="visitors" name="Visits" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientVisitors)" />
                                    )}
                                    <ReferenceLine y={Number(trendAnalysis.dailyAvg) || 0} stroke="rgba(245, 158, 11, 0.6)" strokeDasharray="4 4" />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <FaExclamationCircle style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '0.75rem' }} />
                        <div>No traffic data recorded in this time range.</div>
                    </div>
                )}
            </motion.div>

            {/* Section Breakdown & Operating Systems */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Popular Sections / Landing Paths */}
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
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                        <FaRoute style={{ color: '#10b981' }} />
                        Most Visited Sections
                    </h3>
                    {topSections.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {topSections.map((sec, idx) => (
                                <div key={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{sec.name}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                            {sec.count} visits ({sec.percentage}%)
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${sec.percentage}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                                            style={{
                                                height: '100%',
                                                background: `linear-gradient(90deg, ${['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#f43f5e'][idx % 6]} 0%, #6366f1 100%)`,
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            No section path data recorded yet
                        </div>
                    )}
                </motion.div>

                {/* Operating Systems & Browsers */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                        <FaDesktop style={{ color: '#8b5cf6' }} />
                        Operating Systems & Platforms
                    </h3>
                    {osStats.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            {osStats.map((item, idx) => {
                                const total = visitorLocations.length || 1;
                                const pct = Math.round((item.value / total) * 100);
                                return (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.6rem 0.85rem',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.04)',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'][idx % 5]
                                            }} />
                                            <span style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.9rem' }}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ color: '#fff', fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                                                {item.value}
                                            </span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', minWidth: '35px', textAlign: 'right' }}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            No OS data available
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Device & Browser Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Device Distribution */}
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
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                        <FaMobileAlt style={{ color: '#f59e0b' }} />
                        Device Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={deviceStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {deviceStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={deviceColors[entry.name] || '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Browser Distribution */}
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
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                        <FaDesktop style={{ color: '#0ea5e9' }} />
                        Browser Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={browserStats}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {browserStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={browserColors[index % browserColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Geographic Distribution & Top Cities */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
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
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                        <FaMapMarkedAlt style={{ color: '#10b981' }} />
                        Geographic Distribution
                    </h3>
                    {geoDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={geoDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={95}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {geoDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomChartTooltip />} />
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
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                        <FaTrophy style={{ color: '#f59e0b' }} />
                        Top Origin Cities
                    </h3>
                    {topCities.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topCities} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                                <XAxis type="number" stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                                <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} width={120} />
                                <Tooltip content={<CustomChartTooltip />} />
                                <Bar dataKey="value" name="Visitors" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No city data available
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Peak Activity (Hourly 24h) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '2.5rem'
                }}
            >
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                    <FaClock style={{ color: '#ec4899' }} />
                    Peak Activity Heatmap (Overall Hourly Distribution)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={peakHourlyActivity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                        <XAxis dataKey="label" stroke="var(--text-secondary)" style={{ fontSize: '0.72rem' }} interval={1} />
                        <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} allowDecimals={false} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="visitors" name="Visitors" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* UPGRADED LIVE VISITOR LOGS EXPLORER */}
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
                {/* Explorer Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.25rem'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: '600' }}>
                            <FaClock style={{ color: '#6366f1' }} />
                            Live Visitor Logs & Activity Explorer
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.82rem' }}>
                            Showing {Math.min(logsLimit, filteredLogs.length)} of {filteredLogs.length} matching visits ({visitorLocations.length} total logged)
                        </p>
                    </div>

                    {/* Filter / Search Bar */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '4px 10px'
                        }}>
                            <FaSearch style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginRight: '6px' }} />
                            <input
                                type="text"
                                placeholder="Search city, IP, OS..."
                                value={logSearch}
                                onChange={(e) => setLogSearch(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    fontSize: '0.85rem',
                                    width: '150px'
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '2px 8px'
                        }}>
                            <FaFilter style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginRight: '6px' }} />
                            <select
                                value={logDeviceFilter}
                                onChange={(e) => setLogDeviceFilter(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    padding: '5px 2px',
                                    outline: 'none',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all" style={{ background: '#0f172a' }}>All Devices</option>
                                <option value="desktop" style={{ background: '#0f172a' }}>Desktop</option>
                                <option value="mobile" style={{ background: '#0f172a' }}>Mobile</option>
                                <option value="tablet" style={{ background: '#0f172a' }}>Tablet</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Logs List */}
                {filteredLogs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {filteredLogs.slice(0, logsLimit).map((activity, index) => {
                            const dateObj = activity.parsedDate;
                            const formattedDate = dateObj
                                ? dateObj.toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : 'N/A';

                            const isMobile = activity.deviceType === 'Mobile';
                            const isTablet = activity.deviceType === 'Tablet';

                            return (
                                <motion.div
                                    key={activity.id || index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ background: 'rgba(255, 255, 255, 0.03)', scale: 1.005 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.85rem 1.1rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.04)',
                                        background: 'rgba(255, 255, 255, 0.01)',
                                        flexWrap: 'wrap',
                                        gap: '0.75rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px' }}>
                                        <div style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} 0%, ${['#8b5cf6', '#14b8a6', '#f97316', '#f43f5e', '#c084fc'][index % 5]} 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            flexShrink: 0
                                        }}>
                                            {activity.countryCode || 'XX'}
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.92rem' }}>
                                                {activity.city || 'Unknown'}, {activity.country || 'Unknown'}
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{activity.region || 'Region'}</span>
                                                {activity.ip && (
                                                    <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
                                                        • {activity.ip}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Device & Browser Badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {isMobile ? <FaMobileAlt color="#10b981" /> : isTablet ? <FaTabletAlt color="#f59e0b" /> : <FaLaptop color="#6366f1" />}
                                            {activity.deviceType || 'Desktop'}
                                        </span>

                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {activity.browser || 'Browser'} {activity.os ? `(${activity.os})` : ''}
                                        </span>

                                        {activity.path && (
                                            <span style={{
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: '#a5b4fc',
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.75rem'
                                            }}>
                                                {activity.path}
                                            </span>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                                        {formattedDate}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Show More Button */}
                        {filteredLogs.length > logsLimit && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <motion.button
                                    onClick={() => setLogsLimit(prev => prev + 25)}
                                    className="btn btn-outline"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                                >
                                    Load More Visits (+25)
                                </motion.button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                        No logs match your filter criteria.
                    </div>
                )}
            </motion.div>

            {/* Portfolio Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.12) 0%, rgba(var(--accent-rgb), 0.04) 100%)',
                    border: '1px solid rgba(var(--accent-rgb), 0.25)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center'
                }}
            >
                <FaUsers style={{ fontSize: '2.5rem', color: 'var(--accent-color)', marginBottom: '0.75rem' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: '0.5rem 0', fontSize: '1.4rem' }}>
                    Portfolio Impact & Global Reach
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
                    {stats.totalVisitors > 0
                        ? `Your portfolio has inspired audiences across ${uniqueCountries.toLocaleString()} ${uniqueCountries === 1 ? 'country' : 'countries'} with ${stats.totalVisitors.toLocaleString()} total visits tracked in real time. Keep innovating! 🚀`
                        : 'Your analytics journey is just beginning! 🚀'}
                </p>
            </motion.div>

            <style>{`
                .analytics-dashboard {
                    animation: fadeIn 0.4s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
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
