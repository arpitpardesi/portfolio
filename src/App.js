
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Background from './components/Background';
import CustomCursor from './components/CustomCursor';
import DetailedAbout from './components/DetailedAbout';
import ThemeSwitcher from './components/ThemeSwitcher';
import Moon from './components/Moon';
import Photography from './components/Photography';
import PhysicsPlayground from './components/PhysicsPlayground';
import BeyondWork from './components/BeyondWork';
import IOT from './components/IOT';
import AI from './components/AI';
import RaspberryPi from './components/RaspberryPi';
import DynamicHobbyPage from './components/DynamicHobbyPage';
import AllProjectsPage from './components/AllProjectsPage';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

import { MotionConfig } from 'framer-motion';

function AppContent() {
    const { settings } = useSettings();

    return (
        <MotionConfig transition={settings.enableAnimations ? undefined : { duration: 0 }}>
            <Router>
                <div className="App">
                    {settings.enableCustomCursor && <CustomCursor />}
                    {settings.enableBackground && <Background />}
                    {settings.enableMoon && <Moon />}
                    {settings.enableThemeSwitcher && <ThemeSwitcher />}
                    <Header />
                    <Routes>
                        <Route path="/" element={
                            <>
                                <Hero />
                                <About />
                                <Projects />
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
                        <Route path="/photography" element={<Photography />} />
                        <Route path="/playground" element={<PhysicsPlayground />} />
                        <Route path="/about" element={<DetailedAbout />} />

                        <Route path="/login" element={<Login />} />
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
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
