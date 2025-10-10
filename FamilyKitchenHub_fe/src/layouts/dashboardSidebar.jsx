import React from "react";
import "../styles/DashboardSidebar.css";
import {
  LayoutDashboard,
  BookOpen,
  Snowflake,
  Share2,
  Trash2,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const TABS = [
  { label: "Dashboard", path: "/manage", icon: <LayoutDashboard size={18} /> },
  { label: "Recipes", path: "/manage/recipes", icon: <BookOpen size={18} /> },
  { label: "Fridge", path: "/manage/fridge", icon: <Snowflake size={18} /> },
  { label: "Shared", path: "/manage/shared", icon: <Share2 size={18} /> },
  { label: "Deleted", path: "/manage/deleted", icon: <Trash2 size={18} /> },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar-tab-switcher-outer">
      <div className="sidebar-tab-switcher">
        {TABS.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`tab-btn${location.pathname === tab.path ? " active" : ""}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
      <Link to="/logout" className="tab-logout-btn">
        <LogOut size={18} />
        <span>Logout</span>
      </Link>
    </div>
  );
}