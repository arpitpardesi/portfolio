import React, { useState } from 'react';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import './Admin.css';

const ImageUpload = ({ onUpload, currentImage }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage || '');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // Create a unique filename
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `uploads/${fileName}`);

            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            setPreview(url);
            onUpload(url);
        } catch (error) {
            console.error("Error uploading image: ", error);
            alert("Upload failed!");
        }
        setUploading(false);
    };

    return (
        <div className="form-group">
            <label className="form-label">Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className="image-upload-label">
                    {uploading ? <FaSpinner className="spin" /> : <FaCloudUploadAlt />}
                    {uploading ? 'Uploading...' : 'Choose File'}
                    <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                </label>

                {preview && (
                    <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ImageUpload;
