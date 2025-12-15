import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/tags', icon: '🏷️', label: 'Tags' },
        { path: '/admin/ingredients', icon: '🥕', label: 'Ingredients' },
        { path: '/admin/recipes', icon: '📝', label: 'Recipes' },
        { path: '/admin/categories', icon: '📁', label: 'Categories' },
        { path: '/admin/allergies', icon: '⚠️', label: 'Allergies' },
        { path: '/admin/users', icon: '👥', label: 'Users' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>🍳 Admin Panel</h2>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`nav-item ${window.location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Header */}
                <header className="admin-header">
                    <h1>Family Kitchen Hub</h1>
                    <div className="user-info">
                        <span>👤 {user.username || 'Admin'}</span>
                        <span className="user-role">{user.role}</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
