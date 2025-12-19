import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaSpinner, FaTimes, FaImage, FaVideo } from 'react-icons/fa';
import './Admin.css';

const CLOUDINARY_CLOUD_NAME = 'dcp4zb2gc';
const CLOUDINARY_UPLOAD_PRESET = 'portfolio_uploads';

const MultiMediaUpload = ({ onUpload, currentMediaItems = [] }) => {
    const [mediaItems, setMediaItems] = useState(currentMediaItems);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setMediaItems(currentMediaItems);
    }, [currentMediaItems]);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const newMediaItems = [];

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                const data = await response.json();
                const url = data.secure_url;
                const type = data.resource_type === 'video' ? 'video' : 'image';

                const mediaItem = {
                    url,
                    type,
                    order: mediaItems.length + newMediaItems.length
                };

                newMediaItems.push(mediaItem);
            } catch (error) {
                console.error("Error uploading file: ", error);
                alert(`Upload failed for ${file.name}! ${error.message}`);
            }
        }

        const updatedItems = [...mediaItems, ...newMediaItems];
        setMediaItems(updatedItems);
        onUpload(updatedItems);
        setUploading(false);
    };

    const handleRemove = (index) => {
        const updatedItems = mediaItems.filter((_, i) => i !== index);
        // Reorder remaining items
        const reorderedItems = updatedItems.map((item, i) => ({ ...item, order: i }));
        setMediaItems(reorderedItems);
        onUpload(reorderedItems);
    };

    const moveItem = (fromIndex, toIndex) => {
        const items = [...mediaItems];
        const [movedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, movedItem);
        // Update order
        const reorderedItems = items.map((item, i) => ({ ...item, order: i }));
        setMediaItems(reorderedItems);
        onUpload(reorderedItems);
    };

    return (
        <div className="form-group">
            <label className="form-label">Media (Images & Videos)</label>

            <label className="image-upload-label" style={{ marginBottom: '1rem' }}>
                {uploading ? <FaSpinner className="spin" /> : <FaCloudUploadAlt />}
                {uploading ? 'Uploading to Cloudinary...' : 'Upload Images/Videos'}
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*,video/*"
                    multiple
                    disabled={uploading}
                />
            </label>

            {mediaItems.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem'
                }}>
                    {mediaItems.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'relative',
                                width: '100%',
                                paddingTop: '100%',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '2px solid var(--border-color)',
                                background: '#1a1a2e'
                            }}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('index', index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const fromIndex = parseInt(e.dataTransfer.getData('index'));
                                moveItem(fromIndex, index);
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0
                            }}>
                                {item.type === 'image' ? (
                                    <img
                                        src={item.url}
                                        alt={`Media ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <video
                                        src={item.url}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        muted
                                    />
                                )}

                                {/* Type indicator */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    left: '4px',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    padding: '4px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {item.type === 'image' ? <FaImage /> : <FaVideo />}
                                    {index + 1}
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemove(index)}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: 'rgba(220, 38, 38, 0.9)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'white',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)'}
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{
                fontSize: '0.8rem',
                color: '#888',
                fontStyle: 'italic',
                marginTop: '0.75rem'
            }}>
                ✨ Powered by Cloudinary (Free Tier). Drag to reorder.
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default MultiMediaUpload;
