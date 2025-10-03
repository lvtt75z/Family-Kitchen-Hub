import React from "react";
import "../styles/DashboardSidebar.css";
import {
  LayoutDashboard,
  BookOpen,
  Folder,
  Layers,
  Share2,
  Trash2,
  LogOut,
  Snowflake,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      {/* Top Section */}
      <div className="sidebar-top">
        <h2 className="workspace-name">Huy's Workspace</h2>
        <p className="plan-type">Starter Plan</p>
        <button className="upgrade-btn">Upgrade</button>
        <button className="invite-btn">Invite Members</button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        <Link
          to="/manage"
          className={`menu-item ${
            location.pathname === "/manage" ? "active" : ""
          }`}
        >
          <LayoutDashboard size={18} />
          <span>My Dashboard</span>
        </Link>

        <Link
          to="/manage/recipes"
          className={`menu-item ${
            location.pathname === "/manage/recipes" ? "active" : ""
          }`}
        >
          <BookOpen size={18} />
          <span>Recipes</span>
        </Link>

        <Link
          to="/manage/fridge"
          className={`menu-item ${
            location.pathname === "/manage/collections" ? "active" : ""
          }`}
        >
          <Snowflake size={18} />
          <span>Fridge</span>
        </Link>

        <Link
          to="/manage/shared"
          className={`menu-item ${
            location.pathname === "/manage/shared" ? "active" : ""
          }`}
        >
          <Share2 size={18} />
          <span>Shared with Me</span>
        </Link>

        <Link
          to="/manage/deleted"
          className={`menu-item ${
            location.pathname === "/manage/deleted" ? "active" : ""
          }`}
        >
          <Trash2 size={18} />
          <span>Recently Deleted</span>
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <div className="profile">
          <p className="profile-name">Huy Vo</p>
          <p className="profile-email">vdhuy2801@gmail.com</p>
        </div>
        <Link to="/logout" className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
}
