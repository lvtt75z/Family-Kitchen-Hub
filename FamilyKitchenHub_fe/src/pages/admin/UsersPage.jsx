import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../../service/userService';
import { toast } from 'react-toastify';
import './UsersPage.css';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        fullName: '',
        country: '',
        role: 'USER'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            console.log('Fetched users:', data);
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setEditForm({
            username: user.username || '',
            email: user.email || '',
            fullName: user.fullName || '',
            country: user.country || '',
            role: user.role || 'USER'
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({
            username: '',
            email: '',
            fullName: '',
            country: '',
            role: 'USER'
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            await updateUser(id, editForm);
            toast.success('User updated successfully!');
            setEditingId(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(id);
                toast.success('User deleted successfully!');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="users-page">
                <div className="loading">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="users-page">
            <div className="page-header">
                <h2>Users Management</h2>
            </div>

            <div className="users-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Country</th>
                            <th>Role</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">No users found</td>
                            </tr>
                        ) : (
                            users.map(user => (
                                editingId === user.id ? (
                                    // Editing Row
                                    <tr key={user.id} className="editing-row">
                                        <td>{user.id}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                autoFocus
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.fullName}
                                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="email"
                                                className="inline-input"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.country}
                                                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="inline-select"
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <button className="btn-save" onClick={() => handleSaveEdit(user.id)}>
                                                ✓ Save
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                                ✕ Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    // Display Row
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.fullName || '-'}</td>
                                        <td>{user.email || '-'}</td>
                                        <td>{user.country || '-'}</td>
                                        <td>
                                            <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                                                {user.role || 'USER'}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => handleEdit(user)}>
                                                ✏️ Edit
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(user.id)}>
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
