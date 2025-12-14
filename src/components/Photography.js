import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder images for now - using generic nature/space/abstract themes
const images = [
    { id: 1, src: 'https://picsum.photos/id/1015/800/600', title: 'Mountain River' },
    { id: 2, src: 'https://picsum.photos/id/1036/800/1200', title: 'Snowy Peak' },
    { id: 3, src: 'https://picsum.photos/id/1022/800/500', title: 'Deep Forest' },
    { id: 4, src: 'https://picsum.photos/id/1041/800/800', title: 'Ocean Waves' },
    { id: 5, src: 'https://picsum.photos/id/1050/800/600', title: 'Urban Life' },
    { id: 6, src: 'https://picsum.photos/id/1002/800/500', title: 'NASA Space' },
    { id: 7, src: 'https://picsum.photos/id/1016/800/1000', title: 'Canyon' },
    { id: 8, src: 'https://picsum.photos/id/1018/800/600', title: 'Nature' },
];

const Photography = () => {
    const [selectedId, setSelectedId] = useState(null);

    return (
        <section className="photography-section" style={{
            padding: '120px 20px 50px',
            minHeight: '100vh',
            color: 'var(--text-primary)',
            position: 'relative',
            zIndex: 1
        }}>
            <motion.div
                className="container"
                style={{ maxWidth: '1200px', margin: '0 auto' }}
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '60px' }}
                    className="photography-header"
                >
                    <h2 className="section-title">Through My Lens</h2>
                    <p className="photography-subtitle" style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.8 }}>
                        Capturing moments in time, from the vastness of landscapes to the intricate details of life.
                    </p>
                </motion.div>

                <div className="photo-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    {images.map((img) => (
                        <motion.div
                            layoutId={`img-container-${img.id}`}
                            key={img.id}
                            onClick={() => setSelectedId(img.id)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.03, zIndex: 10 }}
                            className="photo-card"
                            style={{
                                cursor: 'pointer',
                                borderRadius: '15px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                aspectRatio: '4/3' // Default aspect, though images vary
                            }}
                        >
                            <motion.img
                                src={img.src}
                                alt={img.title}
                                layoutId={`img-${img.id}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <motion.div
                                style={{
                                    position: 'absolute', bottom: 0, left: 0, width: '100%',
                                    padding: '20px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                    opacity: 0
                                }}
                                whileHover={{ opacity: 1 }}
                            >
                                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{img.title}</h3>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedId && (
                        <motion.div
                            layoutId={`img-container-${selectedId}`} // Match container layoutId? Actually better to use fixed overlay
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="lightbox-overlay"
                            style={{
                                position: 'fixed',
                                top: 0, left: 0,
                                width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.9)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                backdropFilter: 'blur(10px)',
                                padding: '20px'
                            }}
                        >
                            <motion.div
                                className="lightbox-content"
                                style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}
                                onClick={(e) => e.stopPropagation()} // Click image shouldn't close? usually overlay closes
                            >
                                <motion.img
                                    layoutId={`img-${selectedId}`}
                                    src={images.find(i => i.id === selectedId).src}
                                    className="lightbox-image"
                                    style={{
                                        width: 'auto', height: 'auto',
                                        maxWidth: '100%', maxHeight: '80vh',
                                        borderRadius: '10px',
                                        boxShadow: '0 0 50px rgba(var(--accent-rgb), 0.3)'
                                    }}
                                />
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setSelectedId(null)}
                                    className="lightbox-close"
                                    style={{
                                        position: 'absolute', top: '-40px', right: 0,
                                        background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer'
                                    }}
                                >
                                    &times;
                                </motion.button>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ textAlign: 'center', marginTop: '10px', color: '#ccc' }}
                                >
                                    <h2>{images.find(i => i.id === selectedId).title}</h2>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <style>{`
                .section-title {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    background: linear-gradient(to right, #ffffff, var(--accent-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                @media (max-width: 768px) {
                    .photography-section {
                        padding: 100px 20px 40px !important;
                    }
                    .photography-header {
                        margin-bottom: 40px !important;
                    }
                    .section-title {
                        font-size: 2rem !important;
                    }
                    .photography-subtitle {
                        font-size: 0.95rem !important;
                    }
                    .photo-grid {
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
                        gap: 15px !important;
                    }
                    .photo-card {
                        border-radius: 10px !important;
                    }
                    .lightbox-close {
                        top: -30px !important;
                        font-size: 1.5rem !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .photography-section {
                        padding: 90px 15px 30px !important;
                    }
                    .photography-header {
                        margin-bottom: 30px !important;
                    }
                    .section-title {
                        font-size: 1.75rem !important;
                    }
                    .photography-subtitle {
                        font-size: 0.9rem !important;
                    }
                    .photo-grid {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                    }
                    .lightbox-overlay {
                        padding: 10px !important;
                    }
                    .lightbox-image {
                        max-height: 70vh !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default Photography;

