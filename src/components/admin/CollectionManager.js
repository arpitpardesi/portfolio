import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import MultiMediaUpload from './MultiMediaUpload';
import { motion, AnimatePresence } from 'framer-motion';
import './Admin.css';

const CollectionManager = ({ collectionName, title }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fullDesc: '',
        tags: '',
        color: '#6366f1',
        github: '',
        link: '',
        image: '',
        isPinned: false,
        mediaItems: []
    });

    const fetchItems = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const itemsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setItems(itemsList);
        } catch (error) {
            console.error("Error fetching items: ", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [collectionName]);

    const [selectedItems, setSelectedItems] = useState([]);
    const [itemsToDelete, setItemsToDelete] = useState([]); // Array of IDs to delete (single or bulk)

    const toggleSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const confirmDelete = (id) => {
        setItemsToDelete([id]);
    };

    const confirmBulkDelete = () => {
        setItemsToDelete([...selectedItems]);
    };

    const executeDelete = async () => {
        if (itemsToDelete.length === 0) return;
        try {
            await Promise.all(itemsToDelete.map(id => deleteDoc(doc(db, collectionName, id))));

            // Cleanup
            fetchItems();
            setItemsToDelete([]);
            setSelectedItems(prev => prev.filter(id => !itemsToDelete.includes(id)));
        } catch (error) {
            console.error("Error deleting document(s): ", error);
            alert("Error deleting item(s)");
        }
    };

    const [showSeedConfirm, setShowSeedConfirm] = useState(false);

    const handleSeedDefaults = async () => {
        const defaults = [
            { id: 'photography', title: 'Photography', description: 'Capturing moments in time.', color: '#f43f5e', category: 'photography', link: '/beyond-work/photography' },
            { id: 'iot', title: 'IOT & Smart Home', description: 'Connecting the physical world.', color: '#0ea5e9', category: 'iot', link: '/beyond-work/iot' },
            { id: 'ai', title: 'Artificial Intelligence', description: 'Teaching machines to think.', color: '#8b5cf6', category: 'ai', link: '/beyond-work/ai' },
            { id: 'rpi', title: 'Raspberry Pi', description: 'Tiny computer, big ideas.', color: '#d946ef', category: 'raspberry-pi', link: '/beyond-work/raspberry-pi' }
        ];
        try {
            // Use setDoc to overwrite/create with specific IDs
            const { setDoc } = await import('firebase/firestore');
            for (const h of defaults) {
                await setDoc(doc(db, 'hobbies', h.id), h);
            }
            alert("Defaults added successfully! 🎉");
            fetchItems();
            setShowSeedConfirm(false);
        } catch (e) {
            console.error(e);
            alert("Error seeding defaults");
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            fullDesc: item.fullDesc || '',
            tags: item.tags ? (Array.isArray(item.tags) ? item.tags.join(', ') : item.tags) : '',
            color: item.color || '#6366f1',
            github: item.github || '',
            link: item.link || '',
            image: item.image || '',
            isPinned: item.isPinned || false,
            mediaItems: item.mediaItems || []
        });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormData({
            title: '',
            description: '',
            fullDesc: '',
            tags: '',
            color: '#6366f1',
            github: '',
            link: '',
            image: '',
            isPinned: false,
            mediaItems: []
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            updatedAt: new Date()
        };

        try {
            if (currentItem) {
                // Update
                const docRef = doc(db, collectionName, currentItem.id);
                await updateDoc(docRef, dataToSave);
            } else {
                // Create
                await addDoc(collection(db, collectionName), {
                    ...dataToSave,
                    createdAt: new Date()
                });
            }
            setIsEditing(false);
            fetchItems();
        } catch (error) {
            console.error("Error saving document: ", error);
            alert("Error saving item");
        }
    };

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            <div className="collection-header">
                <div className="collection-header-top">
                    <div className="collection-title-group">
                        <h2 className="collection-title">{title}</h2>
                        {selectedItems.length > 0 && (
                            <button
                                onClick={confirmBulkDelete}
                                className="btn btn-danger"
                            >
                                Delete ({selectedItems.length})
                            </button>
                        )}
                    </div>
                    <div className="collection-actions">
                        {collectionName === 'hobbies' && (
                            <button
                                onClick={() => setShowSeedConfirm(true)}
                                className="btn btn-outline"
                            >
                                + Load Defaults
                            </button>
                        )}
                        <button
                            onClick={handleAddNew}
                            className="btn btn-primary"
                        >
                            <FaPlus /> Add New
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading Nebula Data...</div>
            ) : (
                <div className="collection-grid">
                    {items.map(item => (
                        <div key={item.id} className={`collection-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}>
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleSelection(item.id)}
                                className="item-checkbox"
                            />
                            <div className="item-header">
                                <h3 className="item-title" style={{ color: item.color }}>
                                    {item.isPinned && <span style={{ color: '#fbbf24', marginRight: '0.5rem' }}>⭐</span>}
                                    {item.title}
                                </h3>
                                <div className="item-actions">
                                    <button onClick={() => handleEdit(item)} className="icon-btn edit"><FaEdit /></button>
                                    <button onClick={() => confirmDelete(item.id)} className="icon-btn delete"><FaTrash /></button>
                                </div>
                            </div>
                            <p className="item-desc">{item.description}</p>
                            {/* Tags display (if available) - optional enhancement */}
                            {item.tags && item.tags.length > 0 && <div style={{ paddingLeft: '2rem', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                {Array.isArray(item.tags) ? item.tags.slice(0, 3).join(', ') : item.tags}
                                {Array.isArray(item.tags) && item.tags.length > 3 ? '...' : ''}
                            </div>}

                            {item.image && <div>
                                <img src={item.image} alt={item.title} className="item-image" />
                            </div>}
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {itemsToDelete.length > 0 && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            style={{ maxWidth: '400px', textAlign: 'center' }}
                        >
                            <h3 style={{ marginBottom: '1rem' }}>Confirm Delete</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Are you sure you want to delete {itemsToDelete.length} item{itemsToDelete.length > 1 ? 's' : ''}?
                                <br />This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setItemsToDelete([])}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="btn btn-danger-solid"
                                >
                                    Delete {itemsToDelete.length > 1 ? `(${itemsToDelete.length})` : ''}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Seed Confirmation Modal */}
            <AnimatePresence>
                {showSeedConfirm && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            style={{ maxWidth: '400px', textAlign: 'center' }}
                        >
                            <h3 style={{ marginBottom: '1rem' }}>Load Default Hobbies?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                This will add "Photography", "IOT", "AI", and "Raspberry Pi" to your database.
                                <br /><br />
                                <span style={{ fontSize: '0.9rem', color: '#888' }}>Note: If they already exist, they will be updated/reset to defaults.</span>
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setShowSeedConfirm(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSeedDefaults}
                                    className="btn btn-primary"
                                >
                                    Yes, Load Them
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit/Add Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="modal-content"
                        >
                            <button
                                onClick={() => setIsEditing(false)}
                                className="close-modal-btn"
                            >
                                <FaTimes />
                            </button>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{currentItem ? 'Edit Item' : 'Add New Item'}</h3>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isPinned}
                                            onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>⭐ Pin this project (featured)</span>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input
                                        placeholder="Title"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <MultiMediaUpload
                                    currentMediaItems={formData.mediaItems}
                                    onUpload={(mediaItems) => setFormData({ ...formData, mediaItems })}
                                />
                                <div className="form-group">
                                    <label className="form-label">Short Description</label>
                                    <textarea
                                        placeholder="Short Description"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="form-textarea"
                                        style={{ minHeight: '80px' }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Full Description (Markdown)</label>
                                    <textarea
                                        placeholder="# Full Description using Markdown..."
                                        value={formData.fullDesc}
                                        onChange={e => setFormData({ ...formData, fullDesc: e.target.value })}
                                        className="form-textarea"
                                        style={{ minHeight: '150px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tags (comma separated)</label>
                                    <input
                                        placeholder="e.g. react, space, photography"
                                        value={formData.tags}
                                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-row-responsive">
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Color</label>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                                            className="color-input"
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">GitHub URL</label>
                                        <input
                                            placeholder="https://github.com/..."
                                            value={formData.github}
                                            onChange={e => setFormData({ ...formData, github: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">External Link</label>
                                    <input
                                        placeholder="https://..."
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category / Slug (required for new hobbies)</label>
                                    <input
                                        placeholder="e.g. gardening"
                                        value={formData.category || ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="form-input"
                                    />
                                    <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', marginTop: '0.5rem' }}>
                                        Tip: For Hobbies, use this as the URL ID. For Projects, match this to the Hobby ID.
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '14px' }}>
                                    Save Item
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollectionManager;
