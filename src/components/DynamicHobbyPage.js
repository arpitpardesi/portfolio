import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import HobbyPage from './HobbyPage';
import ProjectModal from './ProjectModal';
import { FaShapes } from 'react-icons/fa';

const DynamicHobbyPage = () => {
    const { slug } = useParams();
    const [hobbyData, setHobbyData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const hobbiesRef = collection(db, 'hobbies');
                const qHobby = query(hobbiesRef, where("category", "==", slug));
                const hobbySnap = await getDocs(qHobby);

                let myHobby = null;

                if (!hobbySnap.empty) {
                    myHobby = hobbySnap.docs[0].data();
                } else {
                    const qLink = query(hobbiesRef, where("link", "==", slug));
                    const linkSnap = await getDocs(qLink);
                    if (!linkSnap.empty) myHobby = linkSnap.docs[0].data();
                }

                if (myHobby) {
                    setHobbyData(myHobby);
                } else {
                    setHobbyData({
                        title: slug.charAt(0).toUpperCase() + slug.slice(1),
                        description: "A custom hobby section.",
                        color: "#ffffff"
                    });
                }

                const projectsRef = collection(db, 'projects');
                const qProjects = query(projectsRef, where("category", "==", slug));
                const projectSnap = await getDocs(qProjects);

                const loadedProjects = projectSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProjects(loadedProjects);

            } catch (error) {
                console.error("Error loading dynamic page:", error);
            }
            setLoading(false);
        };

        if (slug) fetchData();
    }, [slug]);

    if (loading) return <div style={{ color: 'white', padding: 'calc(100px + env(safe-area-inset-top)) 100px 100px', textAlign: 'center' }}>Loading...</div>;

    return (
        <HobbyPage
            title={hobbyData?.title || 'Unknown Hobby'}
            icon={<FaShapes />}
            color={hobbyData?.color || '#ffffff'}
            description={hobbyData?.description}
        >
            <div className="hobby-content" style={{ display: 'grid', gap: '4rem' }}>
                {hobbyData?.fullDesc && (
                    <div className="story-section">
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>About</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                            {hobbyData.fullDesc}
                        </p>
                    </div>
                )}

                <div className="project-showcase" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {projects.length > 0 ? projects.map(project => (
                        <motion.div
                            key={project.id}
                            whileHover={{ y: -5, cursor: 'pointer' }}
                            onClick={() => setSelectedProject(project)}
                            style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = project.color || hobbyData?.color}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <h3 style={{ color: project.color || hobbyData?.color, marginBottom: '0.5rem' }}>{project.title}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                                Click for details &rarr;
                            </div>
                        </motion.div>
                    )) : (
                        <div style={{ color: '#888', fontStyle: 'italic' }}>No projects added for this category yet.</div>
                    )}
                </div>
            </div>

            {selectedProject && (
                <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
            )}
        </HobbyPage>
    );
};

export default DynamicHobbyPage;
