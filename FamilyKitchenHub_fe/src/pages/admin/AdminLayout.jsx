import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showUserDropdown, setShowUserDropdown] = useState(false);

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

                    {/* User Menu - Top Right */}
                    <div className="header-user-menu">
                        <button
                            className="header-user-trigger"
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                        >
                            <span className="user-icon">👤</span>
                            <span className="user-info-inline">
                                <span className="user-label-text">Admin</span>
                                <span className="user-name-text">{user.username || 'admin_user'}</span>
                            </span>
                            <span className="dropdown-arrow">{showUserDropdown ? '▲' : '▼'}</span>
                        </button>

                        {showUserDropdown && (
                            <div className="header-user-dropdown">
                                <div className="dropdown-info-item">
                                    <span className="dropdown-username">{user.username || 'admin_user'}</span>
                                    {user.role && <span className="dropdown-role-badge">{user.role}</span>}
                                </div>
                                <button onClick={handleLogout} className="dropdown-logout-btn">
                                    🚪 Logout
                                </button>
                            </div>
                        )}
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
