import React, { useState, useEffect } from 'react';
import { getAllIngredients, createIngredient, updateIngredient, deleteIngredient, getIngredientTags, addTagsToIngredient, removeTagFromIngredient } from '../../service/ingredientService';
import { getAllTags } from '../../service/tagService';
import { toast } from 'react-toastify';
import './IngredientsPage.css';

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        unit: '',
        caloriesPer100g: '',
        nutritionalInfo: ''
    });
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        unit: '',
        caloriesPer100g: '',
        nutritionalInfo: ''
    });
    const [showAddRow, setShowAddRow] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [ingredientTags, setIngredientTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(false);

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const data = await getAllIngredients();
            console.log('Fetched ingredients:', data);
            setIngredients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            toast.error('Failed to load ingredients');
            setIngredients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ingredient) => {
        setEditingId(ingredient.id);
        setEditForm({
            name: ingredient.name || '',
            unit: ingredient.unit || '',
            caloriesPer100g: ingredient.caloriesPer100g !== null && ingredient.caloriesPer100g !== undefined ? ingredient.caloriesPer100g : '',
            nutritionalInfo: ingredient.nutritionalInfo || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({
            name: '',
            unit: '',
            caloriesPer100g: '',
            nutritionalInfo: ''
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            // Convert calories to number
            const dataToSave = {
                ...editForm,
                caloriesPer100g: editForm.caloriesPer100g ? parseInt(editForm.caloriesPer100g) : null
            };
            await updateIngredient(id, dataToSave);
            toast.success('Ingredient updated successfully!');
            setEditingId(null);
            fetchIngredients();
        } catch (error) {
            console.error('Error updating ingredient:', error);
            toast.error('Failed to update ingredient');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this ingredient?')) {
            try {
                await deleteIngredient(id);
                toast.success('Ingredient deleted successfully!');
                fetchIngredients();
            } catch (error) {
                console.error('Error deleting ingredient:', error);
                toast.error('Failed to delete ingredient');
            }
        }
    };

    const handleAddNew = () => {
        setShowAddRow(true);
        setNewIngredient({
            name: '',
            unit: '',
            caloriesPer100g: '',
            nutritionalInfo: ''
        });
    };

    const handleCancelAdd = () => {
        setShowAddRow(false);
        setNewIngredient({
            name: '',
            unit: '',
            caloriesPer100g: '',
            nutritionalInfo: ''
        });
    };

    const handleSaveNew = async () => {
        try {
            // Convert calories to number
            const dataToSave = {
                ...newIngredient,
                caloriesPer100g: newIngredient.caloriesPer100g ? parseInt(newIngredient.caloriesPer100g) : null
            };
            await createIngredient(dataToSave);
            toast.success('Ingredient created successfully!');
            setShowAddRow(false);
            setNewIngredient({
                name: '',
                unit: '',
                caloriesPer100g: '',
                nutritionalInfo: ''
            });
            fetchIngredients();
        } catch (error) {
            console.error('Error creating ingredient:', error);
            toast.error('Failed to create ingredient');
        }
    };

    const handleToggleExpand = async (ingredientId) => {
        if (expandedId === ingredientId) {
            // Collapse
            setExpandedId(null);
            setIngredientTags([]);
        } else {
            // Expand
            setExpandedId(ingredientId);
            await fetchIngredientTags(ingredientId);
            await fetchAllTags();
        }
    };

    const fetchIngredientTags = async (ingredientId) => {
        try {
            setTagsLoading(true);
            const tags = await getIngredientTags(ingredientId);
            setIngredientTags(tags);
        } catch (error) {
            console.error('Error fetching ingredient tags:', error);
            toast.error('Failed to load tags');
        } finally {
            setTagsLoading(false);
        }
    };

    const fetchAllTags = async () => {
        try {
            const tags = await getAllTags();
            setAllTags(tags);
        } catch (error) {
            console.error('Error fetching all tags:', error);
        }
    };

    const handleToggleTag = async (ingredientId, tagId, isCurrentlySelected) => {
        try {
            if (isCurrentlySelected) {
                await removeTagFromIngredient(ingredientId, tagId);
                toast.success('Tag removed');
            } else {
                await addTagsToIngredient(ingredientId, [tagId]);
                toast.success('Tag added');
            }
            // Refresh tags
            await fetchIngredientTags(ingredientId);
        } catch (error) {
            console.error('Error toggling tag:', error);
            toast.error('Failed to update tag');
        }
    };

    // Helper function to parse and format nutritional info
    const parseNutritionalInfo = (nutritionalInfo) => {
        if (!nutritionalInfo) return '-';
        try {
            const info = JSON.parse(nutritionalInfo);
            const parts = [];
            if (info.fat !== undefined) parts.push(`Fat: ${info.fat}g`);
            if (info.carbs !== undefined) parts.push(`Carbs: ${info.carbs}g`);
            if (info.protein !== undefined) parts.push(`Protein: ${info.protein}g`);
            return parts.length > 0 ? parts.join(', ') : '-';
        } catch (e) {
            // If not valid JSON, return as-is
            return nutritionalInfo;
        }
    };

    if (loading) {
        return (
            <div className="ingredients-page">
                <div className="loading">Loading ingredients...</div>
            </div>
        );
    }

    return (
        <div className="ingredients-page">
            <div className="page-header">
                <h2>Ingredients Management</h2>
                <button className="btn-primary" onClick={handleAddNew}>
                    + Add New Ingredient
                </button>
            </div>

            <div className="ingredients-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Unit</th>
                            <th>Calories (per 100g)</th>
                            <th>Nutritional Info</th>
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
                                        value={newIngredient.name}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                        placeholder="Ingredient name"
                                        autoFocus
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="inline-input"
                                        value={newIngredient.unit}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                        placeholder="e.g., kg, g, liter"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="inline-input"
                                        value={newIngredient.caloriesPer100g}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, caloriesPer100g: e.target.value })}
                                        placeholder="Calories"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="inline-input"
                                        value={newIngredient.nutritionalInfo}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, nutritionalInfo: e.target.value })}
                                        placeholder='{"fat": 0, "carbs": 0, "protein": 0}'
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

                        {/* Existing Ingredients */}
                        {ingredients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">No ingredients found</td>
                            </tr>
                        ) : (
                            ingredients.map(ingredient => (
                                editingId === ingredient.id ? (
                                    // Editing Row
                                    <tr key={ingredient.id} className="editing-row">
                                        <td>{ingredient.id}</td>
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
                                                value={editForm.unit}
                                                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="inline-input"
                                                value={editForm.caloriesPer100g}
                                                onChange={(e) => setEditForm({ ...editForm, caloriesPer100g: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.nutritionalInfo}
                                                onChange={(e) => setEditForm({ ...editForm, nutritionalInfo: e.target.value })}
                                                placeholder='{"fat": 0, "carbs": 0, "protein": 0}'
                                            />
                                        </td>
                                        <td>
                                            <button className="btn-save" onClick={() => handleSaveEdit(ingredient.id)}>
                                                ✓ Save
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                                ✕ Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {/* Display Row */}
                                        <tr key={ingredient.id}>
                                            <td>{ingredient.id}</td>
                                            <td>{ingredient.name}</td>
                                            <td>{ingredient.unit || '-'}</td>
                                            <td>{ingredient.caloriesPer100g || '-'}</td>
                                            <td className="nutritional-info-cell">
                                                {parseNutritionalInfo(ingredient.nutritionalInfo)}
                                            </td>
                                            <td>
                                                <button className="btn-edit" onClick={() => handleEdit(ingredient)}>
                                                    ✏️ Edit
                                                </button>
                                                <button className="btn-delete" onClick={() => handleDelete(ingredient.id)}>
                                                    🗑️ Delete
                                                </button>
                                                <button
                                                    className="btn-expand"
                                                    onClick={() => handleToggleExpand(ingredient.id)}
                                                    title="Manage Tags"
                                                >
                                                    {expandedId === ingredient.id ? '▲' : '▼'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expandable Tags Row */}
                                        {expandedId === ingredient.id && (
                                            <tr className="sub-row tags-row">
                                                <td colSpan="6">
                                                    <div className="sub-content">
                                                        <strong>🏷️ Tags:</strong>
                                                        {tagsLoading ? (
                                                            <span className="loading-text">Loading tags...</span>
                                                        ) : (
                                                            <div className="tags-manager">
                                                                {/* Current Tags */}
                                                                <div className="current-tags">
                                                                    {ingredientTags.length > 0 ? (
                                                                        ingredientTags.map(tag => (
                                                                            <span key={tag.id} className="tag-badge">
                                                                                {tag.name}
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="no-tags">No tags assigned</span>
                                                                    )}
                                                                </div>

                                                                {/* Tag Selection */}
                                                                <div className="tags-selection">
                                                                    <div className="tags-list">
                                                                        {allTags.map(tag => {
                                                                            const isSelected = ingredientTags.some(t => t.id === tag.id);
                                                                            return (
                                                                                <label key={tag.id} className="tag-checkbox">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isSelected}
                                                                                        onChange={() => handleToggleTag(ingredient.id, tag.id, isSelected)}
                                                                                    />
                                                                                    <span>{tag.name}</span>
                                                                                </label>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
