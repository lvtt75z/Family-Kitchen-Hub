import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from '../../hooks/axios';
import { toast } from 'react-toastify';
import './UserRecipesPage.css';

export default function UserRecipesPage() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [recipeIngredients, setRecipeIngredients] = useState([]);
    const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL'); // PENDING_APPROVAL, APPROVED, REJECTED
    const [rejectionModal, setRejectionModal] = useState({
        isOpen: false,
        recipeId: null,
        recipeTitle: ''
    });
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchRecipesByStatus();
    }, [statusFilter]);

    const fetchRecipesByStatus = async () => {
        try {
            setLoading(true);
            let response;

            if (statusFilter === 'PENDING_APPROVAL') {
                response = await axios.get('/admin/recipes/pending');
            } else {
                // Fetch all user submissions and filter by status
                response = await axios.get('/admin/recipes/all-submissions');
            }

            let recipesData = Array.isArray(response.data) ? response.data : [];

            // Filter by status if not pending
            if (statusFilter !== 'PENDING_APPROVAL') {
                recipesData = recipesData.filter(r => r.status === statusFilter);
            }

            // Fetch user details for each recipe
            const recipesWithUsers = await Promise.all(
                recipesData.map(async (recipe) => {
                    if (recipe.submittedByUserId) {
                        try {
                            const userRes = await axios.get(`/users/${recipe.submittedByUserId}`);
                            return {
                                ...recipe,
                                submittedByUser: userRes.data
                            };
                        } catch (error) {
                            console.error(`Error fetching user ${recipe.submittedByUserId}:`, error);
                            return recipe;
                        }
                    }
                    return recipe;
                })
            );

            setRecipes(recipesWithUsers);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            toast.error('Failed to load recipes');
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleExpand = async (recipeId) => {
        if (expandedId === recipeId) {
            setExpandedId(null);
            setRecipeIngredients([]);
        } else {
            setExpandedId(recipeId);
            await fetchRecipeIngredients(recipeId);
        }
    };

    const fetchRecipeIngredients = async (recipeId) => {
        try {
            const response = await axios.get(`/recipes/${recipeId}/ingredients`);
            setRecipeIngredients(response.data);
        } catch (error) {
            console.error('Error fetching recipe ingredients:', error);
        }
    };

    const handleApprove = async (recipeId) => {
        if (!window.confirm('Approve this recipe?')) return;

        try {
            const adminData = JSON.parse(localStorage.getItem('user'));
            const adminId = adminData?.user?.id || adminData?.id;

            if (!adminId) {
                toast.error('Admin ID not found');
                return;
            }

            await axios.post(`/admin/recipes/${recipeId}/approve`, null, {
                params: { adminId }
            });

            toast.success('Recipe approved successfully!');
            fetchRecipesByStatus();

            if (expandedId === recipeId) {
                setExpandedId(null);
            }
        } catch (error) {
            console.error('Error approving recipe:', error);
            toast.error(error.response?.data?.message || 'Failed to approve recipe');
        }
    };

    const handleRejectClick = async (recipeId, recipeTitle) => {
        console.log('Reject button clicked for recipe:', recipeId, recipeTitle);

        // Use browser prompt instead of custom modal
        const reason = prompt(`Reject recipe "${recipeTitle}"?\n\nPlease enter rejection reason:`);

        if (!reason || !reason.trim()) {
            if (reason !== null) { // User didn't click cancel
                toast.error('Rejection reason is required');
            }
            return;
        }

        try {
            const adminData = JSON.parse(localStorage.getItem('user'));
            const adminId = adminData?.user?.id || adminData?.id;

            console.log('Admin ID:', adminId);
            console.log('Recipe ID:', recipeId);
            console.log('Reason:', reason);

            if (!adminId) {
                toast.error('Admin ID not found');
                return;
            }

            console.log('Sending rejection request...');
            const response = await axios.post(`/admin/recipes/${recipeId}/reject`, null, {
                params: {
                    adminId,
                    reason: reason.trim()
                }
            });
            console.log('Rejection response:', response);

            toast.success('Recipe rejected successfully!');
            fetchRecipesByStatus();

            if (expandedId === recipeId) {
                setExpandedId(null);
            }
        } catch (error) {
            console.error('Error rejecting recipe:', error);
            console.error('Error response:', error.response);
            toast.error(error.response?.data?.message || 'Failed to reject recipe');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="user-recipes-page">
                <div className="loading">Loading pending recipes...</div>
            </div>
        );
    }

    return (
        <div className="user-recipes-page">
            <div className="page-header">
                <h2>User Recipe Submissions</h2>
            </div>

            {/* Status Filter Tabs */}
            <div className="status-tabs">
                <button
                    className={`status-tab ${statusFilter === 'PENDING_APPROVAL' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('PENDING_APPROVAL')}
                >
                    <span className="tab-icon">⏳</span>
                    Pending
                    <span className="tab-count">{statusFilter === 'PENDING_APPROVAL' ? recipes.length : ''}</span>
                </button>
                <button
                    className={`status-tab ${statusFilter === 'APPROVED' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('APPROVED')}
                >
                    <span className="tab-icon">✅</span>
                    Approved
                    <span className="tab-count">{statusFilter === 'APPROVED' ? recipes.length : ''}</span>
                </button>
                <button
                    className={`status-tab ${statusFilter === 'REJECTED' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('REJECTED')}
                >
                    <span className="tab-icon">❌</span>
                    Rejected
                    <span className="tab-count">{statusFilter === 'REJECTED' ? recipes.length : ''}</span>
                </button>
            </div>

            <div className="recipes-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Submitted By</th>
                            <th>Instructions</th>
                            <th>Servings</th>
                            <th>Cooking Time</th>
                            <th>Meal Type</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipes.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="no-data">
                                    {statusFilter === 'PENDING_APPROVAL' && 'No pending recipes'}
                                    {statusFilter === 'APPROVED' && 'No approved recipes'}
                                    {statusFilter === 'REJECTED' && 'No rejected recipes'}
                                </td>
                            </tr>
                        ) : (
                            recipes.map(recipe => (
                                <React.Fragment key={recipe.id}>
                                    <tr>
                                        <td>{recipe.id}</td>
                                        <td>
                                            {recipe.imageUrl ? (
                                                <img
                                                    src={recipe.imageUrl}
                                                    alt={recipe.title}
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <span style={{ color: '#999' }}>No image</span>
                                            )}
                                        </td>
                                        <td><strong>{recipe.title}</strong></td>
                                        <td>
                                            {recipe.submittedByUser ? (
                                                <div>
                                                    <div><strong>{recipe.submittedByUser.fullName || recipe.submittedByUser.username}</strong></div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>ID: {recipe.submittedByUserId}</div>
                                                </div>
                                            ) : (
                                                <span>User #{recipe.submittedByUserId}</span>
                                            )}
                                        </td>
                                        <td className="text-cell" style={{ maxWidth: '200px' }}>
                                            {recipe.instructions ? (
                                                recipe.instructions.length > 100
                                                    ? recipe.instructions.substring(0, 100) + '...'
                                                    : recipe.instructions
                                            ) : (
                                                recipe.description?.substring(0, 100) || '-'
                                            )}
                                        </td>
                                        <td>{recipe.servings || '-'}</td>
                                        <td>{recipe.cookingTimeMinutes ? `${recipe.cookingTimeMinutes} min` : '-'}</td>
                                        <td>
                                            {recipe.mealType ? (
                                                <span className="badge badge-meal">{recipe.mealType}</span>
                                            ) : '-'}
                                        </td>
                                        <td style={{ fontSize: '13px' }}>{formatDate(recipe.submittedAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {statusFilter === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <button
                                                            className="btn-approve"
                                                            onClick={() => handleApprove(recipe.id)}
                                                            title="Approve"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => handleRejectClick(recipe.id, recipe.title)}
                                                            title="Reject"
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </>
                                                )}
                                                {statusFilter === 'REJECTED' && recipe.rejectionReason && (
                                                    <button
                                                        className="btn-view-reason"
                                                        onClick={() => {
                                                            alert(`Rejection Reason:\n\n${recipe.rejectionReason}`);
                                                        }}
                                                        title="View rejection reason"
                                                    >
                                                        View Reason
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-expand"
                                                    onClick={() => handleToggleExpand(recipe.id)}
                                                >
                                                    {expandedId === recipe.id ? '▲ Hide' : '▼ Details'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expandable detail row */}
                                    {expandedId === recipe.id && (
                                        <tr className="expanded-row">
                                            <td colSpan="10">
                                                <div className="recipe-details">
                                                    <div className="detail-section">
                                                        <h4>RECIPE INFORMATION</h4>
                                                        <div className="detail-grid">
                                                            <div className="detail-item">
                                                                <strong>Cooking Time:</strong>
                                                                <span>{recipe.cookingTimeMinutes ? `${recipe.cookingTimeMinutes} min` : '-'}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Servings:</strong>
                                                                <span>{recipe.servings || '-'}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Meal Type:</strong>
                                                                <span>{recipe.mealType || '-'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="detail-section">
                                                        <h4>INSTRUCTIONS</h4>
                                                        <div className="recipe-description">
                                                            {recipe.instructions || recipe.description || 'No instructions provided'}
                                                        </div>
                                                    </div>

                                                    <div className="detail-section">
                                                        <h4>INGREDIENTS</h4>
                                                        {recipeIngredients.length === 0 ? (
                                                            <p className="no-data-text">No ingredients</p>
                                                        ) : (
                                                            <ul className="ingredients-list">
                                                                {recipeIngredients.map((ing, idx) => (
                                                                    <li key={idx}>
                                                                        <strong>{ing.ingredientName}</strong>: {ing.quantity} {ing.unit}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
