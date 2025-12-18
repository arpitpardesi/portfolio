import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import HobbyPage from './HobbyPage';
import { FaCamera } from 'react-icons/fa';

// Placeholder images for now - using generic nature/space/abstract themes

const initialImages = [];

// const initialImages = [
//     { id: 1, src: 'https://picsum.photos/id/1015/800/600', title: 'Mountain River' },
//     { id: 2, src: 'https://picsum.photos/id/1036/800/1200', title: 'Snowy Peak' },
//     { id: 3, src: 'https://picsum.photos/id/1022/800/500', title: 'Deep Forest' },
//     { id: 4, src: 'https://picsum.photos/id/1041/800/800', title: 'Ocean Waves' },
//     { id: 5, src: 'https://picsum.photos/id/1050/800/600', title: 'Urban Life' },
//     { id: 6, src: 'https://picsum.photos/id/1002/800/500', title: 'NASA Space' },
//     { id: 7, src: 'https://picsum.photos/id/1016/800/1000', title: 'Canyon' },
//     { id: 8, src: 'https://picsum.photos/id/1018/800/600', title: 'Nature' },
// ];

const Photography = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [images, setImages] = useState(initialImages);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'photography'));
                if (!querySnapshot.empty) {
                    const items = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        src: doc.data().image, // Map 'image' field to 'src'
                        title: doc.data().title
                    }));
                    setImages(items);
                }
            } catch (error) {
                console.error("Error fetching photos:", error);
            }
        };
        fetchImages();
    }, []);

    const selectedImage = images.find(img => img.id === selectedId);

    return (
        <HobbyPage
            title="Photography"
            icon={<FaCamera />}
            color="var(--accent-color)"
            description="Capturing moments in time, from the vastness of landscapes to the intricate details of life."
        >

            <h3 style={{fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>Will be added soon</h3>
            <div className="photo-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
                padding: '1rem'
            }}>
                {images.map(image => (
                    <motion.div
                        key={image.id}
                        layoutId={image.id}
                        onClick={() => setSelectedId(image.id)}
                        whileHover={{ y: -10, transition: { duration: 0.3 } }}
                        style={{
                            overflow: 'hidden',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            aspectRatio: '4/5',
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <img
                            src={image.src}
                            alt={image.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '1.5rem',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease'
                        }} className="photo-info">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{image.title}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedId && selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedId(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            layoutId={selectedId}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '90%',
                                maxHeight: '90%',
                                position: 'relative'
                            }}
                        >
                            <img
                                src={selectedImage.src}
                                alt={selectedImage.title}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    borderRadius: '10px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                                }}
                            />
                            <h3 style={{
                                position: 'absolute',
                                bottom: '-3rem',
                                left: 0,
                                right: 0,
                                textAlign: 'center',
                                color: 'white',
                                fontSize: '1.5rem'
                            }}>
                                {selectedImage.title}
                            </h3>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>
                {`
                    .photo-grid div:hover .photo-info {
                        opacity: 1 !important;
                    }
                    .photo-grid div:hover img {
                        transform: scale(1.1);
                    }
                `}
            </style>
        </HobbyPage>
    );
};

export default Photography;
