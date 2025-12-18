import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import ImageUpload from './ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

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
        image: ''
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
            image: item.image || ''
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
            image: ''
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2>{title} Manager</h2>
                    {selectedItems.length > 0 && (
                        <button
                            onClick={confirmBulkDelete}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(255, 107, 107, 0.2)',
                                color: '#ff6b6b',
                                border: '1px solid #ff6b6b',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Delete Selected ({selectedItems.length})
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {collectionName === 'hobbies' && (
                        <button
                            onClick={() => setShowSeedConfirm(true)}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--border-color)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            + Load Defaults
                        </button>
                    )}
                    <button
                        onClick={handleAddNew}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--accent-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaPlus /> Add New
                    </button>
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {items.map(item => (
                        <div key={item.id} style={{
                            background: selectedItems.includes(item.id) ? 'rgba(99, 102, 241, 0.1)' : '#1a1a1a',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: selectedItems.includes(item.id) ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                        }}>
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleSelection(item.id)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    left: '1rem',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    accentColor: 'var(--accent-color)',
                                    zIndex: 10
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', paddingLeft: '2rem' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: item.color }}>{item.title}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer' }}><FaEdit /></button>
                                    <button onClick={() => confirmDelete(item.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}><FaTrash /></button>
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', paddingLeft: '2rem' }}>{item.description}</p>
                            {item.image && <div style={{ paddingLeft: '2rem' }}>
                                <img src={item.image} alt={item.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                            </div>}
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {itemsToDelete.length > 0 && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.8)', zIndex: 1100,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: '#222', padding: '2rem', borderRadius: '8px',
                                width: '100%', maxWidth: '400px', textAlign: 'center',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <h3 style={{ marginBottom: '1rem' }}>Confirm Delete</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Are you sure you want to delete {itemsToDelete.length} item{itemsToDelete.length > 1 ? 's' : ''}?
                                <br />This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setItemsToDelete([])}
                                    style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDelete}
                                    style={{ padding: '10px 20px', background: '#ff6b6b', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
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
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.8)', zIndex: 1100,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: '#222', padding: '2rem', borderRadius: '8px',
                                width: '100%', maxWidth: '400px', textAlign: 'center',
                                border: '1px solid var(--border-color)'
                            }}
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
                                    style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSeedDefaults}
                                    style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
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
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            style={{
                                background: '#222', padding: '2rem', borderRadius: '8px',
                                width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setIsEditing(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
                            >
                                <FaTimes />
                            </button>
                            <h3 style={{ marginBottom: '1.5rem' }}>{currentItem ? 'Edit Item' : 'Add New Item'}</h3>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    placeholder="Title"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                                <ImageUpload
                                    currentImage={formData.image}
                                    onUpload={(url) => setFormData({ ...formData, image: url })}
                                />
                                <textarea
                                    placeholder="Short Description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '80px' }}
                                    required
                                />
                                <textarea
                                    placeholder="Full Description (Markdown supported)"
                                    value={formData.fullDesc}
                                    onChange={e => setFormData({ ...formData, fullDesc: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '150px' }}
                                />
                                <input
                                    placeholder="Tags (comma separated)"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    style={inputStyle}
                                />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        style={{ height: '45px', width: '60px', padding: '0', border: 'none', cursor: 'pointer' }}
                                    />
                                    <input
                                        placeholder="GitHub URL"
                                        value={formData.github}
                                        onChange={e => setFormData({ ...formData, github: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="External Link"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <input
                                    placeholder="Category / Slug (e.g. 'gardening' - required for new hobbies)"
                                    value={formData.category || ''}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    style={inputStyle}
                                />
                                <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                                    Tip: For Hobbies, use this as the URL ID. For Projects, match this to the Hobby ID.
                                </div>
                                <button type="submit" style={{
                                    marginTop: '1rem', padding: '12px', background: 'var(--accent-color)',
                                    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                }}>
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

const inputStyle = {
    width: '100%',
    padding: '10px',
    background: '#333',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#fff',
    fontFamily: 'inherit'
};

export default CollectionManager;
