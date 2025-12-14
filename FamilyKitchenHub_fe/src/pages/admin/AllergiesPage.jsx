import React, { useState, useEffect } from 'react';
import { getAllAllergies, createAllergy, updateAllergy, deleteAllergy } from '../../service/allergyService';
import { toast } from 'react-toastify';
import './AllergiesPage.css';

export default function AllergiesPage() {
    const [allergies, setAllergies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: ''
    });
    const [newAllergy, setNewAllergy] = useState({
        name: ''
    });
    const [showAddRow, setShowAddRow] = useState(false);

    useEffect(() => {
        fetchAllergies();
    }, []);

    const fetchAllergies = async () => {
        try {
            setLoading(true);
            const data = await getAllAllergies();
            console.log('Fetched allergies:', data);
            setAllergies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching allergies:', error);
            toast.error('Failed to load allergies');
            setAllergies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (allergy) => {
        setEditingId(allergy.id);
        setEditForm({
            name: allergy.name || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({
            name: ''
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            await updateAllergy(id, editForm);
            toast.success('Allergy updated successfully!');
            setEditingId(null);
            fetchAllergies();
        } catch (error) {
            console.error('Error updating allergy:', error);
            toast.error('Failed to update allergy');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this allergy?')) {
            try {
                await deleteAllergy(id);
                toast.success('Allergy deleted successfully!');
                fetchAllergies();
            } catch (error) {
                console.error('Error deleting allergy:', error);
                toast.error('Failed to delete allergy');
            }
        }
    };

    const handleAddNew = () => {
        setShowAddRow(true);
        setNewAllergy({
            name: ''
        });
    };

    const handleCancelAdd = () => {
        setShowAddRow(false);
        setNewAllergy({
            name: ''
        });
    };

    const handleSaveNew = async () => {
        try {
            await createAllergy(newAllergy);
            toast.success('Allergy created successfully!');
            setShowAddRow(false);
            setNewAllergy({
                name: ''
            });
            fetchAllergies();
        } catch (error) {
            console.error('Error creating allergy:', error);
            toast.error('Failed to create allergy');
        }
    };

    if (loading) {
        return (
            <div className="allergies-page">
                <div className="loading">Loading allergies...</div>
            </div>
        );
    }

    return (
        <div className="allergies-page">
            <div className="page-header">
                <h2>Allergies Management</h2>
                <button className="btn-primary" onClick={handleAddNew}>
                    + Add New Allergy
                </button>
            </div>

            <div className="allergies-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Add New Row */}
                        {showAddRow && (
                            <tr className="editing-row">
                                <td>-</td>
                                <td>
                                    <input
                                        type="text"
                                        className="inline-input"
                                        value={newAllergy.name}
                                        onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })}
                                        placeholder="Allergy name"
                                        autoFocus
                                    />
                                </td>
                                <td>
                                    <button className="btn-save" onClick={handleSaveNew}>
                                        ✓ Save
                                    </button>
                                    <button className="btn-cancel" onClick={handleCancelAdd}>
                                        ✕ Cancel
                                    </button>
                                </td>
                            </tr>
                        )}

                        {/* Existing Allergies */}
                        {allergies.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-data">No allergies found</td>
                            </tr>
                        ) : (
                            allergies.map(allergy => (
                                editingId === allergy.id ? (
                                    // Editing Row
                                    <tr key={allergy.id} className="editing-row">
                                        <td>{allergy.id}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                autoFocus
                                            />
                                        </td>
                                        <td>
                                            <button className="btn-save" onClick={() => handleSaveEdit(allergy.id)}>
                                                ✓ Save
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                                ✕ Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    // Display Row
                                    <tr key={allergy.id}>
                                        <td>{allergy.id}</td>
                                        <td>{allergy.name}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => handleEdit(allergy)}>
                                                ✏️ Edit
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(allergy.id)}>
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
