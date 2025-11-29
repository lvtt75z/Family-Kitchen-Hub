import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import "../styles/TopNavbar.css";

export default function TopNavbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra user đã đăng nhập
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowDropdown(false);
    navigate("/login");
  };

  // Lấy chữ cái đầu của tên
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="top-navbar">
      <div className="top-navbar-inner">
        <div className="brand">
          <div className="brand-icon">🍳</div>
          <Link to="/home" className="brand-title">
            Family Kitchen Hub
          </Link>
        </div>

        <nav className="nav-links">
          <Link to="/feedback" className="nav-link">
            Feedback
          </Link>
          <Link to="/request" className="nav-link">
            Submit a request
          </Link>
        </nav>

        <div className="nav-actions">
          {token ? (
            <div className="user-profile-dropdown">
              <button
                className="avatar-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="User menu"
              >
                <div className="avatar-circle">
                  {getInitials(user.fullName || user.username)}
                </div>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="user-name">{user.fullName || user.username}</p>
                    <p className="user-email">{user.email}</p>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-signin">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}