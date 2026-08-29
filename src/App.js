
import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import HomeBlog from './components/HomeBlog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Background from './components/Background';
import CustomCursor from './components/CustomCursor';
import ThemeSwitcher from './components/ThemeSwitcher';
import Moon from './components/Moon';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import ScrollProgress from './components/ScrollProgress';
import CommandPalette from './components/CommandPalette';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { MotionConfig, AnimatePresence } from 'framer-motion';

// Code-split non-critical route components
const DetailedAbout = lazy(() => import('./components/DetailedAbout'));
const Resume = lazy(() => import('./components/Resume'));
const Photography = lazy(() => import('./components/Photography'));
const PhysicsPlayground = lazy(() => import('./components/PhysicsPlayground'));
const BeyondWork = lazy(() => import('./components/BeyondWork'));
const IOT = lazy(() => import('./components/IOT'));
const AI = lazy(() => import('./components/AI'));
const RaspberryPi = lazy(() => import('./components/RaspberryPi'));
const DynamicHobbyPage = lazy(() => import('./components/DynamicHobbyPage'));
const AllProjectsPage = lazy(() => import('./components/AllProjectsPage'));
const Blog = lazy(() => import('./components/Blog'));
const BlogPostDetail = lazy(() => import('./components/BlogPostDetail'));
const Login = lazy(() => import('./components/Login'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

const RouteLoader = () => (
    <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-color)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.9rem',
        letterSpacing: '1px'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--accent-color)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <span>Loading experience...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

const ScrollToTop = () => {
    const { pathname } = useLocation();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

function AppContent() {
    const { settings } = useSettings();
    const [splashComplete, setSplashComplete] = React.useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (settings.enableCommandPalette !== false && (e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [settings.enableCommandPalette]);

    return (
        <MotionConfig transition={settings.enableAnimations ? undefined : { duration: 0 }}>
            <Router>
                <ScrollToTop />
                <ScrollProgress />
                {settings.enableCommandPalette !== false && (
                    <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
                )}
                <AnimatePresence mode="wait">
                    {!splashComplete && (
                        <SplashScreen onComplete={() => setSplashComplete(true)} />
                    )}
                </AnimatePresence>

                <div className="App">
                    {settings.enableCustomCursor && <CustomCursor />}
                    {settings.enableBackground && <Background />}
                    {settings.enableMoon && <Moon />}
                    {settings.enableThemeSwitcher && <ThemeSwitcher />}
                    <Header showLogo={splashComplete} onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
                    <Suspense fallback={<RouteLoader />}>
                        <Routes>
                            <Route path="/" element={
                                <>
                                    <Hero startAnimation={splashComplete} />
                                    <About />
                                    <Projects />
                                    <HomeBlog />
                                    <Contact />
                                </>
                            } />
                            <Route path="/beyond-work" element={<BeyondWork />} />
                            <Route path="/beyond-work/photography" element={<Photography />} />
                            <Route path="/beyond-work/iot" element={<IOT />} />
                            <Route path="/beyond-work/ai" element={<AI />} />
                            <Route path="/beyond-work/raspberry-pi" element={<RaspberryPi />} />
                            {/* Dynamic Hobbies Route */}
                            <Route path="/beyond-work/:slug" element={<DynamicHobbyPage />} />
                            <Route path="/projects" element={<AllProjectsPage />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:id" element={<BlogPostDetail />} />
                            <Route path="/photography" element={<Photography />} />
                            <Route path="/playground" element={<PhysicsPlayground />} />
                            <Route path="/about" element={<DetailedAbout />} />
                            <Route path="/resume" element={<Resume />} />

                            <Route path="/login" element={<Login />} />
                            <Route path="/admin" element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </Suspense>
                    <Footer />
                </div>
            </Router>
        </MotionConfig>
    );
}

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <AppContent />
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;

