import React, { useState, useEffect } from 'react';
import { FaMicrochip } from 'react-icons/fa';
import HobbyPage from './HobbyPage';
import ProjectModal from './ProjectModal';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Fallback data
const initialProjects = [
    {
        id: 1,
        title: "Smart Home Hub",
        description: "A custom ESP32-based controller for automating lighting and environment sensing.",
        fullDesc: "This project serves as the central brain for my home automation. ",
        tags: ["ESP32", "C++", "MQTT", "React", "WebSockets"],
        color: "#0ea5e9",
        github: "https://github.com/arpitpardesi"
    }
];

const IOT = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState(initialProjects);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'iot'));
                if (!querySnapshot.empty) {
                    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setProjects(items);
                }
            } catch (error) {
                console.error("Error fetching IOT projects:", error);
            }
        };
        fetchProjects();
    }, []);

    return (
        <HobbyPage
            title="Internet of Things"
            icon={<FaMicrochip />}
            color="var(--accent-color)"
            description="Connecting the physical world to the digital realm. I build smart devices that sense, analyze, and act."
        >
            <div className="hobby-content" style={{ display: 'grid', gap: '4rem' }}>
                <div className="story-section">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Bridging Worlds</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                        My fascination with IoT started when I realized that code didn't have to stay trapped inside a screen.
                        It could turn on a light, water a plant, or track satellites. I love the challenge of constrained environments—optimizing for power, memory, and bandwidth while delivering reliable performance.
                    </p>
                </div>

                <div className="project-showcase" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {projects.map(project => (
                        <motion.div
                            key={project.id}
                            whileHover={{ y: -5, cursor: 'pointer' }}
                            onClick={() => setSelectedProject(project)}
                            style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>{project.title}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                                Click for details &rarr;
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {selectedProject && (
                <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
            )}
        </HobbyPage>
    );
};

export default IOT;
