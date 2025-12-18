
import React, { useState, useEffect } from 'react';
import { FaRaspberryPi } from 'react-icons/fa';
import HobbyPage from './HobbyPage';
import ProjectModal from './ProjectModal';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Fallback data
const initialProjects = [
    {
        id: 1,
        title: "Pi-hole Cluster",
        description: "Network-wide ad blocking and DNS resolution for maximum privacy.",
        fullDesc: "To ensure 100% uptime for DNS resolution, I set up high-availability Pi-hole / AdGuard Home instances running on a cluster of Raspberry Pi Zeros. Gravity Sync keeps their blocklists synchronized.",
        tags: ["Networking", "Linux", "DNS", "Privacy"],
        color: "#d946ef",
        github: "https://github.com/arpitpardesi"
    },
    {
        id: 2,
        title: "Retro Gaming Console",
        description: "A custom-built emulation station running RetroPie inside a vintage case.",
        fullDesc: "Nostalgia meets modern hardware. I gutted an old broken NES case and retrofitted a Raspberry Pi 4 inside. It runs RetroPie with a custom theme and uses original controllers adapted via USB.",
        tags: ["RetroPie", "Emulation", "Hardware Modding", "Linux"],
        color: "#d946ef"
    }
];

const RaspberryPi = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState(initialProjects);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'rpi'));
                if (!querySnapshot.empty) {
                    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setProjects(items);
                }
            } catch (error) {
                console.error("Error fetching RPi projects:", error);
            }
        };
        fetchProjects();
    }, []);

    return (
        <HobbyPage
            title="Raspberry Pi"
            icon={<FaRaspberryPi />}
            color="var(--accent-color)"
            description="Tiny computer, big ideas. Using single-board computers to power automation and servers."
        >
            <div className="hobby-content" style={{ display: 'grid', gap: '4rem' }}>
                <div className="story-section">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>The Pocket Server</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                        The Raspberry Pi revolutionized how I think about computing. It's not just a toy; it's a capable server, a media center, and a gateway to hardware hacking.
                        I maintain a cluster of Pis for self-hosting services and running experimental workloads.
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

export default RaspberryPi;

