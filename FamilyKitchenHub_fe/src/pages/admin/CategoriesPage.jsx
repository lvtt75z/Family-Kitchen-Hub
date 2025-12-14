import React, { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../service/categoryService';
import { toast } from 'react-toastify';
import './CategoriesPage.css';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: ''
    });
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: ''
    });
    const [showAddRow, setShowAddRow] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllCategories();
            console.log('Fetched categories:', data);
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setEditForm({
            name: category.name || '',
            description: category.description || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({
            name: '',
            description: ''
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            await updateCategory(id, editForm);
            toast.success('Category updated successfully!');
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id);
                toast.success('Category deleted successfully!');
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    const handleAddNew = () => {
        setShowAddRow(true);
        setNewCategory({
            name: '',
            description: ''
        });
    };

    const handleCancelAdd = () => {
        setShowAddRow(false);
        setNewCategory({
            name: '',
            description: ''
        });
    };

    const handleSaveNew = async () => {
        try {
            await createCategory(newCategory);
            toast.success('Category created successfully!');
            setShowAddRow(false);
            setNewCategory({
                name: '',
                description: ''
            });
            fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Failed to create category');
        }
    };

    if (loading) {
        return (
            <div className="categories-page">
                <div className="loading">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="categories-page">
            <div className="page-header">
                <h2>Categories Management</h2>
                <button className="btn-primary" onClick={handleAddNew}>
                    + Add New Category
                </button>
            </div>

            <div className="categories-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
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
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="Category name"
                                        autoFocus
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="inline-input"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                        placeholder="Description"
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

                        {/* Existing Categories */}
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="no-data">No categories found</td>
                            </tr>
                        ) : (
                            categories.map(category => (
                                editingId === category.id ? (
                                    // Editing Row
                                    <tr key={category.id} className="editing-row">
                                        <td>{category.id}</td>
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
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn-save" onClick={() => handleSaveEdit(category.id)}>
                                                ✓ Save
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                                ✕ Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    // Display Row
                                    <tr key={category.id}>
                                        <td>{category.id}</td>
                                        <td>{category.name}</td>
                                        <td>{category.description || '-'}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => handleEdit(category)}>
                                                ✏️ Edit
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(category.id)}>
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
