
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
import ThemeSwitcher from './components/ThemeSwitcher';
import Moon from './components/Moon';
import Photography from './components/Photography';
import PhysicsPlayground from './components/PhysicsPlayground';

function App() {
  return (
    <Router>
      <div className="App">
        <CustomCursor />
        <Background />
        <Moon />
        <ThemeSwitcher />
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
          <Route path="/photography" element={<Photography />} />
          <Route path="/playground" element={<PhysicsPlayground />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
