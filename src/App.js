
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

const Content = () => {
    const { settings, loading } = useSettings();
    if (loading) return null; // or a loading spinner

    const features = settings?.features || {};

    return (
        <Router>
            <div className="App">
                {(features.showCursor ?? true) && <CustomCursor />}
                {(features.showBackground ?? true) && <Background />}
                {(features.showMoon ?? true) && <Moon />}
                {(features.showThemeSwitcher ?? true) && <ThemeSwitcher />}
                <Header />
                <Routes>
                    <Route path="/" element={
                        <>
                            {(features.showHero ?? true) && <Hero />}
                            {(features.showAbout ?? true) && <About />}
                            {(features.showHomeProjects ?? true) && <Projects />}
                            {(features.showHomeContact ?? true) && <Contact />}
                        </>
                    } />

                    {(features.showBeyondWork ?? true) && <Route path="/beyond-work" element={<BeyondWork />} />}
                    {(features.showBeyondWork ?? true) && <Route path="/beyond-work/photography" element={<Photography />} />}
                    {(features.showBeyondWork ?? true) && <Route path="/beyond-work/iot" element={<IOT />} />}
                    {(features.showBeyondWork ?? true) && <Route path="/beyond-work/ai" element={<AI />} />}
                    {(features.showBeyondWork ?? true) && <Route path="/beyond-work/raspberry-pi" element={<RaspberryPi />} />}

                    {/* Dynamic Hobbies Route */}
                    {(features.showBeyondWork ?? true) && <Route path="/beyond-work/:slug" element={<DynamicHobbyPage />} />}

                    {(features.showAllProjects ?? true) && <Route path="/projects" element={<AllProjectsPage />} />}
                    {(features.showPhotography ?? true) && <Route path="/photography" element={<Photography />} />}
                    {(features.showPlayground ?? true) && <Route path="/playground" element={<PhysicsPlayground />} />}
                    {(features.showDetailedAbout ?? true) && <Route path="/about" element={<DetailedAbout />} />}

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
    );
};

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <Content />
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;
