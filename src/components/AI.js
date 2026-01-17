import React, { useState, useEffect } from 'react';
import { FaBrain } from 'react-icons/fa';
import HobbyPage from './HobbyPage';
import ProjectModal from './ProjectModal';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Fallback data
const initialProjects = [
    {
        id: 1,
        title: "Object Detection",
        description: "Real-time YOLO implementation for tracking movement in video feeds.",
        fullDesc: "Using the YOLOv8 architecture, I built a system to detect and track specific objects in real-time video streams. It was optimized to run on edge devices like the Jetson Nano, balancing accuracy with framerate.",
        tags: ["Python", "PyTorch", "OpenCV", "YOLO"],
        color: "#8b5cf6",
        github: "https://github.com/arpitpardesi"
    }
];

const AI = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState(initialProjects);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'ai'));
                if (!querySnapshot.empty) {
                    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setProjects(items);
                }
            } catch (error) {
                console.error("Error fetching AI projects:", error);
            }
        };
        fetchProjects();
    }, []);

    return (
        <HobbyPage
            title="Artificial Intelligence"
            icon={<FaBrain />}
            color="var(--accent-color)"
            description="Exploring the frontiers of machine cognition. From computer vision to large language models."
        >
            <div className="hobby-content" style={{ display: 'grid', gap: '4rem' }}>
                <div className="story-section">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Teaching Machines</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                        AI is more than just algorithms; it's about teaching computers to understand our world.
                        I experiment with neural networks to solve real-world visual problems and explore how LLMs can enhance developer productivity and creativity.
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

export default AI;
