import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Admin.css';

const TimelineManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');

    const [formData, setFormData] = useState({
        dateFrom: '',
        dateTo: '',
        isPresent: false,
        title: '',
        subtitle: '',
        location: '',
        description: '',
        category: 'experience'
    });

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'timeline'));
            const itemsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => {
                // Sort by dateFrom descending (most recent first)
                const dateA = new Date(a.dateFrom || '1900-01-01');
                const dateB = new Date(b.dateFrom || '1900-01-01');
                return dateB - dateA;
            });
            setItems(itemsList);
        } catch (error) {
            console.error("Error fetching timeline items: ", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const [itemToDelete, setItemToDelete] = useState(null);

    const handleEdit = (item) => {
        setCurrentItem(item);

        setFormData({
            dateFrom: item.dateFrom || '',
            dateTo: item.dateTo || '',
            isPresent: item.isPresent || false,
            title: item.title || '',
            subtitle: item.subtitle || '',
            location: item.location || '',
            description: item.description || '',
            category: item.category || 'experience'
        });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormData({
            dateFrom: '',
            dateTo: '',
            isPresent: false,
            title: '',
            subtitle: '',
            location: '',
            description: '',
            category: 'experience'
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Format dates for display in Indian format (DD MMM YYYY)
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const day = date.getDate();
            const month = date.toLocaleDateString('en-IN', { month: 'short' });
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        };

        // Construct dateRange from dateFrom, dateTo, and isPresent
        const dateRange = formData.isPresent
            ? `${formatDate(formData.dateFrom)} - Present`
            : `${formatDate(formData.dateFrom)} - ${formatDate(formData.dateTo)}`;

        const dataToSave = {
            dateRange,
            dateFrom: formData.dateFrom,  // Store raw date for sorting
            dateTo: formData.isPresent ? null : formData.dateTo,
            isPresent: formData.isPresent,
            title: formData.title,
            subtitle: formData.subtitle,
            location: formData.location,
            description: formData.description,
            category: formData.category,
            updatedAt: new Date()
        };

        try {
            if (currentItem) {
                await updateDoc(doc(db, 'timeline', currentItem.id), dataToSave);
            } else {
                await addDoc(collection(db, 'timeline'), {
                    ...dataToSave,
                    createdAt: new Date()
                });
            }
            setIsEditing(false);
            fetchItems();
        } catch (error) {
            console.error("Error saving timeline item: ", error);
            alert("Error saving item");
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteDoc(doc(db, 'timeline', itemToDelete));
            fetchItems();
            setItemToDelete(null);
        } catch (error) {
            console.error("Error deleting item: ", error);
            alert("Error deleting item");
        }
    };

    const filteredItems = filterCategory === 'all'
        ? items
        : items.filter(item => item.category === filterCategory);

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            <div className="collection-header">
                <div className="collection-header-top">
                    <h2 className="collection-title">Timeline Management</h2>
                    <div className="collection-actions">
                        <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
                            <button
                                onClick={() => setFilterCategory('all')}
                                className={`btn ${filterCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '0.85rem' }}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterCategory('experience')}
                                className={`btn ${filterCategory === 'experience' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '0.85rem' }}
                            >
                                Experience
                            </button>
                            <button
                                onClick={() => setFilterCategory('education')}
                                className={`btn ${filterCategory === 'education' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '0.85rem' }}
                            >
                                Education
                            </button>
                        </div>
                        <button onClick={handleAddNew} className="btn btn-primary">
                            <FaPlus /> Add New
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Loading timeline...
                </div>
            ) : (
                <div className="collection-grid">
                    {filteredItems.map(item => (
                        <div key={item.id} className="collection-item">
                            <div className="item-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                                    <div style={{ fontSize: '1.5rem', color: 'var(--accent-color)', paddingTop: '0.25rem', flexShrink: 0 }}>
                                        {item.category === 'experience' ? <FaBriefcase /> : <FaGraduationCap />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 className="item-title" style={{ margin: 0, marginBottom: '0.25rem' }}>
                                            {item.title}
                                        </h3>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>
                                            {item.dateRange}
                                        </div>
                                    </div>
                                </div>
                                <div className="item-actions" style={{ flexShrink: 0, marginLeft: '1rem' }}>
                                    <button onClick={() => handleEdit(item)} className="icon-btn edit">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => setItemToDelete(item.id)} className="icon-btn delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <div style={{ paddingLeft: '2rem', paddingRight: '0', paddingBottom: '0' }}>
                                {item.subtitle && (
                                    <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        {item.subtitle}
                                    </div>
                                )}
                                {item.location && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                                        📍 {item.location}
                                    </div>
                                )}
                                {item.description && (
                                    <p className="item-desc" style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>{item.description}</p>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.6rem',
                                        background: item.category === 'experience' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                                        borderRadius: '12px',
                                        color: item.category === 'experience' ? '#60a5fa' : '#c084fc',
                                        fontWeight: 500,
                                        textTransform: 'capitalize'
                                    }}>
                                        {item.category}
                                    </span>
                                    {item.isPresent && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.6rem',
                                            background: 'rgba(34, 197, 94, 0.2)',
                                            borderRadius: '12px',
                                            color: '#4ade80',
                                            fontWeight: 500
                                        }}>
                                            📍 Current
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation */}
            <AnimatePresence>
                {itemToDelete && (
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
                                Are you sure you want to delete this timeline entry?
                                <br />This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button onClick={() => setItemToDelete(null)} className="btn btn-outline">
                                    Cancel
                                </button>
                                <button onClick={handleDelete} className="btn btn-danger-solid">
                                    Delete
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
                            <button onClick={() => setIsEditing(false)} className="close-modal-btn">
                                <FaTimes />
                            </button>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                                {currentItem ? 'Edit Timeline Entry' : 'Add New Timeline Entry'}
                            </h3>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="form-input"
                                        required
                                    >
                                        <option value="experience">Professional Experience</option>
                                        <option value="education">Education</option>
                                    </select>
                                </div>

                                {/* Enhanced Date Fields */}
                                <div className="form-row-responsive">
                                    <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                        <label className="form-label">From *</label>
                                        <input
                                            type="date"
                                            value={formData.dateFrom}
                                            onChange={e => setFormData({ ...formData, dateFrom: e.target.value })}
                                            className="form-input date-input"
                                            required
                                            style={{
                                                colorScheme: 'dark',
                                                position: 'relative'
                                            }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0, flex: 1 }}>
                                        <label className="form-label">To {!formData.isPresent && '*'}</label>
                                        <input
                                            type="date"
                                            value={formData.dateTo}
                                            onChange={e => setFormData({ ...formData, dateTo: e.target.value })}
                                            className="form-input date-input"
                                            disabled={formData.isPresent}
                                            required={!formData.isPresent}
                                            style={{
                                                colorScheme: 'dark',
                                                opacity: formData.isPresent ? 0.5 : 1,
                                                cursor: formData.isPresent ? 'not-allowed' : 'text'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isPresent}
                                            onChange={e => setFormData({
                                                ...formData,
                                                isPresent: e.target.checked,
                                                dateTo: e.target.checked ? '' : formData.dateTo
                                            })}
                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>📍 Currently ongoing (Present)</span>
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {formData.category === 'experience' ? 'Job Title / Role' : 'Degree / Course'} *
                                    </label>
                                    <input
                                        placeholder={formData.category === 'experience' ? 'e.g., Software Engineer' : 'e.g., Bachelor of Computer Science'}
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {formData.category === 'experience' ? 'Company / Organization' : 'University / Institution'} *
                                    </label>
                                    <input
                                        placeholder={formData.category === 'experience' ? 'e.g., Accenture' : 'e.g., University of Mumbai'}
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {formData.category === 'experience' ? 'Work Location' : 'Campus Location'}
                                    </label>
                                    <input
                                        placeholder={formData.category === 'experience' ? 'e.g., Mumbai, India or Remote' : 'e.g., Mumbai, India'}
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {formData.category === 'experience' ? 'Responsibilities & Achievements' : 'Key Subjects & Activities'}
                                    </label>
                                    <textarea
                                        placeholder={formData.category === 'experience'
                                            ? 'Describe your role, key projects, technologies used, and achievements...'
                                            : 'Describe key subjects, projects, extracurricular activities, and achievements...'}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="form-textarea"
                                        style={{ minHeight: '100px' }}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '14px' }}>
                                    Save Timeline Entry
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimelineManager;
