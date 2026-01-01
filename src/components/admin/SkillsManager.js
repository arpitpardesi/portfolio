import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, writeBatch } from 'firebase/firestore';
import './Admin.css';

const SkillsManager = () => {
    const [skills, setSkills] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSkill, setCurrentSkill] = useState({
        id: null,
        name: '',
        category: 'Tech Stack',
        proficiency: 100,
        displayOrder: 0
    });
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [itemsToDelete, setItemsToDelete] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const skillsCollectionRef = collection(db, 'skills');

    useEffect(() => {
        const fetchSkills = async () => {
            const skillsRef = collection(db, 'skills');
            try {
                const data = await getDocs(skillsRef);
                const firestoreSkills = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

                if (firestoreSkills.length === 0) {
                    // MIGRATION: Check for local storage data
                    const storedSkills = localStorage.getItem('admin_skills');
                    if (storedSkills) {
                        const localSkills = JSON.parse(storedSkills);

                        // Batch write local skills to Firestore
                        const batch = writeBatch(db);
                        const newSkillsList = [];

                        localSkills.forEach(skill => {
                            // Create a new doc ref for each skill
                            const docRef = doc(skillsRef);
                            // Ensure numeric ID is removed or handled if needed, but Firestore generates IDs
                            const { id, ...skillData } = skill;
                            batch.set(docRef, skillData);
                            newSkillsList.push({ ...skillData, id: docRef.id });
                        });

                        await batch.commit();
                        setSkills(newSkillsList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
                        console.log("Migrated local skills to Firestore");
                        localStorage.removeItem('admin_skills'); // Clean up local storage after migration
                    } else {
                        // Set defaults if absolutely nothing exists
                        const defaultSkills = [
                            { name: 'React', category: 'Tech Stack', proficiency: 100, displayOrder: 1 },
                            { name: 'Node.js', category: 'Tech Stack', proficiency: 100, displayOrder: 2 },
                            { name: 'Python', category: 'Tech Stack', proficiency: 100, displayOrder: 3 },
                        ];
                        // Optional: Could write these defaults to Firestore here too
                        // For now, just set them to state with temporary IDs if no Firestore or LocalStorage data
                        setSkills(defaultSkills.map((s, i) => ({ ...s, id: `temp-${i}` })));
                    }
                } else {
                    setSkills(firestoreSkills.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
                }
            } catch (error) {
                console.error("Error fetching skills:", error);
            }
        };

        fetchSkills();
    }, []);

    // saveSkills is no longer needed as operations directly update Firestore and then state
    // const saveSkills = (updatedSkills) => {
    //     // Sort before saving to state and localStorage for consistency
    //     const sorted = [...updatedSkills].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    //     setSkills(sorted);
    //     localStorage.setItem('admin_skills', JSON.stringify(sorted));
    // };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentSkill({
            ...currentSkill,
            [name]: name === 'displayOrder' ? (value === '' ? '' : parseInt(value)) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const targetOrder = currentSkill.displayOrder === '' ? 0 : parseInt(currentSkill.displayOrder);
        // Logic for checking collisions needs live data, assuming 'skills' state is up to date
        // Note: For perfect consistency in a multi-user app, this should be a transaction. 
        // For a portfolio admin, state check is acceptable.

        let skillsAfterRemoval = [...skills];
        if (isEditing) {
            skillsAfterRemoval = skillsAfterRemoval.filter(s => s.id !== currentSkill.id);
        }

        const isOrderTaken = skillsAfterRemoval.some(s => s.displayOrder === targetOrder);
        const batch = writeBatch(db);

        // If shifting is needed
        if (isOrderTaken) {
            skills.forEach(s => { // Iterate over original skills to define shifts
                if (s.displayOrder >= targetOrder) {
                    const skillRef = doc(db, 'skills', s.id);
                    batch.update(skillRef, { displayOrder: s.displayOrder + 1 });
                }
            });
        }

        try {
            if (isEditing) {
                const skillDocRef = doc(db, 'skills', currentSkill.id);
                const { id, ...dataToUpdate } = currentSkill;
                dataToUpdate.displayOrder = targetOrder; // Ensure target is set

                batch.update(skillDocRef, dataToUpdate);
                await batch.commit();

                // Update local state after successful Firestore update
                setSkills(prev => {
                    const updated = prev.map(s => {
                        if (s.id === currentSkill.id) {
                            return { ...currentSkill, displayOrder: targetOrder };
                        }
                        // Apply shifts that were batched
                        if (isOrderTaken && s.displayOrder >= targetOrder && s.id !== currentSkill.id) {
                            return { ...s, displayOrder: s.displayOrder + 1 };
                        }
                        return s;
                    });
                    return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                });

            } else {
                // Creating new
                await batch.commit(); // Commit shifts first, if any

                const { id, ...newSkillData } = currentSkill; // 'id' will be null here
                newSkillData.displayOrder = targetOrder;
                const docRef = await addDoc(skillsCollectionRef, newSkillData);

                // Update local state with the new skill and its Firestore-generated ID
                setSkills(prev => {
                    const updated = [...prev];
                    // Apply shifts that were batched
                    if (isOrderTaken) {
                        updated.forEach(s => {
                            if (s.displayOrder >= targetOrder) {
                                s.displayOrder += 1;
                            }
                        });
                    }
                    updated.push({ ...newSkillData, id: docRef.id });
                    return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                });
            }

            // Re-fetch to ensure perfect sync with DB auto-IDs and shifts
            // This is a robust way to ensure state matches DB, especially after complex batch operations.
            const data = await getDocs(skillsCollectionRef);
            setSkills(data.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));

        } catch (error) {
            console.error("Error saving skill:", error);
        }

        resetForm();
    };

    const handleEdit = (skill) => {
        setCurrentSkill({
            ...skill,
            displayOrder: skill.displayOrder || 0
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const confirmDelete = (id) => {
        setItemsToDelete([id]);
    };

    const confirmBulkDelete = () => {
        if (selectedSkills.length > 0) {
            setItemsToDelete([...selectedSkills]);
        }
    };

    const executeDelete = async () => {
        const batch = writeBatch(db);
        itemsToDelete.forEach(id => {
            const skillDoc = doc(db, 'skills', id);
            batch.delete(skillDoc);
        });

        try {
            await batch.commit();
            setSkills(prev => prev.filter(skill => !itemsToDelete.includes(skill.id)));
            setSelectedSkills(prev => prev.filter(id => !itemsToDelete.includes(id)));
            setItemsToDelete([]);
        } catch (error) {
            console.error("Error deleting skills:", error);
        }
    };

    const toggleSelectSkill = (id) => {
        setSelectedSkills(prev =>
            prev.includes(id) ? prev.filter(skillId => skillId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (skills.length === 0) return; // Prevent selecting all if no skills
        if (selectedSkills.length === skills.length) {
            setSelectedSkills([]);
        } else {
            setSelectedSkills(skills.map(skill => skill.id));
        }
    };

    const resetForm = () => {
        const maxOrder = Math.max(0, ...skills.map(s => s.displayOrder || 0));
        setCurrentSkill({
            id: null,
            name: '',
            category: 'Tech Stack',
            proficiency: 100,
            displayOrder: maxOrder + 1
        });
        setIsEditing(false);
        setShowForm(false);
    };

    // getIconComponent is no longer used as icons are removed from the form and state.
    // The skill-card structure has been updated to remove the icon display.

    return (
        <div className="skills-manager">
            <div className="manager-header">
                <h2>Skills Management</h2>
                <div className="header-actions">
                    <label className="select-all-label">
                        <input
                            type="checkbox"
                            checked={skills.length > 0 && selectedSkills.length === skills.length}
                            onChange={handleSelectAll}
                            disabled={skills.length === 0}
                        />
                        Select All
                    </label>
                    {selectedSkills.length > 0 && (
                        <button className="bulk-delete-btn" onClick={confirmBulkDelete}>
                            <FaTrash /> Delete ({selectedSkills.length})
                        </button>
                    )}
                    <button className="add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
                        <FaPlus /> Add New Skill
                    </button>
                </div>
            </div>

            <div className="skills-list-container">
                {/* Bulk actions bar removed, moved to header */}
                <div className="category-section">
                    <div className="skills-grid">
                        {skills.map(skill => (
                            <div key={skill.id} className={`skill-card ${selectedSkills.includes(skill.id) ? 'selected' : ''}`}>
                                <div className="skill-select">
                                    <input
                                        type="checkbox"
                                        checked={selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSelectSkill(skill.id)}
                                    />
                                </div>
                                <div className="skill-info">
                                    <h4>{skill.name}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Order: {skill.displayOrder || 0}</span>
                                </div>
                                <div className="skill-actions">
                                    <button onClick={() => handleEdit(skill)} className="edit-btn-icon">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => confirmDelete(skill.id)} className="delete-btn-icon">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit/Add Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ maxWidth: '400px' }}
                        >
                            <button
                                onClick={resetForm}
                                className="close-modal-btn"
                            >
                                <FaTimes />
                            </button>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                                {isEditing ? 'Edit Skill' : 'Add New Skill'}
                            </h3>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Skill Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentSkill.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. React"
                                        className="form-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Display Order</label>
                                    <input
                                        type="number"
                                        name="displayOrder"
                                        value={currentSkill.displayOrder}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        min="0"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '12px' }}>
                                    <FaSave /> {isEditing ? 'Update Skill' : 'Save Skill'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                Are you sure you want to delete {itemsToDelete.length} skill{itemsToDelete.length > 1 ? 's' : ''}?
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

            <style>{`
                .skills-manager {
                    color: var(--text-color);
                }
                .manager-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .header-actions {
                    display: flex;
                    gap: 1rem;
                }
                .bulk-delete-btn {
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .bulk-delete-btn:hover {
                    background: #cc0000;
                    transform: translateY(-2px);
                }
                .bulk-actions-bar {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255,255,255,0.03);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .select-all-label {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    cursor: pointer;
                    font-weight: 500;
                    user-select: none;
                }
                .selection-count {
                    color: rgba(255,255,255,0.5);
                    font-size: 0.9rem;
                }
                .skill-select {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .skill-select input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }
                .skill-card.selected {
                    background: rgba(var(--accent-rgb), 0.15);
                    border-color: var(--accent-color);
                }
                .add-btn {
                    background: var(--accent-color);
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(var(--accent-rgb), 0.3);
                }
                .edit-form-card {
                    background: rgba(255,255,255,0.05);
                    padding: 2rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .skills-form {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-group input, .form-group select {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.8rem;
                    border-radius: 6px;
                    color: white;
                    width: 100%;
                }
                .form-actions {
                    grid-column: 1 / -1;
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                }
                .save-btn, .cancel-btn {
                    padding: 0.8rem 2rem;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                }
                .save-btn {
                    background: var(--accent-color);
                    color: white;
                }
                .cancel-btn {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }
                .category-section {
                    margin-bottom: 2.5rem;
                }
                .category-title {
                    margin-bottom: 1rem;
                    color: var(--accent-color);
                    font-size: 1.2rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 0.5rem;
                    display: inline-block;
                }
                .skills-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                .skill-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 1.5rem;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s ease;
                }
                .skill-card:hover {
                    background: rgba(255,255,255,0.08);
                    transform: translateY(-2px);
                }
                .skill-icon {
                    font-size: 1.5rem;
                    color: var(--accent-color);
                    background: rgba(var(--accent-rgb), 0.1);
                    padding: 10px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .skill-info {
                    flex: 1;
                }
                .skill-info h4 {
                    margin: 0;
                    font-size: 1rem;
                }
                .skill-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .edit-btn-icon, .delete-btn-icon {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    transition: color 0.2s;
                    padding: 5px;
                }
                .edit-btn-icon:hover { color: var(--accent-color); }
                .delete-btn-icon:hover { color: #ff4444; }
            `}</style>
        </div>
    );
};

export default SkillsManager;
