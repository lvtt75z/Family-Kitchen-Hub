import React, { useEffect, useRef, useState } from "react";
import "../styles/DashboardSidebar.css";
import {
  LayoutDashboard,
  BookOpen,
  Snowflake,
  LogOut,
  UserRound,
  User,
  HomeIcon,
  ChevronDown,
  UtensilsCrossed
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { label: "Home", path: "/home", icon: <HomeIcon size={18} /> },
  {
    label: "Recommend",
    path: "/manage/Dashboard",
    icon: <UtensilsCrossed size={18} />,
  },
  { label: "Recipes", path: "/manage/recipes", icon: <BookOpen size={18} /> },
  { label: "Fridge", path: "/manage/fridge", icon: <Snowflake size={18} /> },
  {
    label: "Members",
    path: "/manage/familyProfile",
    icon: <UserRound size={18} />,
  },
  { label: "Profile", icon: <User size={20} />, icon2: <ChevronDown size={12} />, dropdown: true }

];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const indicatorRef = useRef(null);
  const tabsRef = useRef([]);
  const sidebarRef = useRef(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Update indicator
  useEffect(() => {
    const activeIndex = TABS.findIndex((tab) =>
      tab.path === '/home'
        ? location.pathname === tab.path
        : location.pathname.startsWith(tab.path)
    );
    const activeTab = tabsRef.current[activeIndex];

    if (activeTab && indicatorRef.current) {
      const rect = activeTab.getBoundingClientRect();
      const parentRect = activeTab.parentElement.getBoundingClientRect();
      indicatorRef.current.style.top = rect.top - parentRect.top + "px";
      indicatorRef.current.style.height = rect.height + "px";
    }
  }, [location]);

  // Check login status
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData)); // chuyển chuỗi JSON thành object
      } catch (error) {
        console.error("Invalid user data in localStorage");
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);


  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpenDropdownIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setOpenDropdownIndex(null);
    navigate("/home");
  };

  return (
    <div className="sidebar-tab-switcher-outer" ref={sidebarRef}>
      <div className="sidebar-tab-switcher">
        {/* Indicator */}
        <div className="tab-indicator" ref={indicatorRef}></div>

        {TABS.map((tab, i) => {
          if (tab.dropdown) {
            return (
              <div
                key={i}
                className={`pf-tab-wrapper ${openDropdownIndex === i ? "open" : ""}`}
                ref={(el) => (tabsRef.current[i] = el)}
              >
                <div
                  className="pf-tab-inner"
                  onClick={() =>
                    setOpenDropdownIndex(openDropdownIndex === i ? null : i)
                  }
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.icon2 && <span className="pf-tab-icon2">{tab.icon2}</span>} {/* icon thứ 2 */}
                </div>

                <div
                  className={`pf-dropdown-menu ${openDropdownIndex === i ? "open" : ""
                    }`}
                >
                  {isLoggedIn ? (
                    <>
                      <div className="pf-dropdown-item"> {user.fullName || user.username || "User"}</div>
                      <Link
                        className="pf-dropdown-item pf-dropdown-editprofile"
                        to="/manage/editprofile"
                      >
                        <User size={16} /> Edit Profile
                      </Link>
                      <div
                        className="pf-dropdown-item pf-logout-btn"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} /> Logout
                      </div>



                    </>
                  ) : (
                    <Link className="pf-dropdown-item" to="/login">
                      <User size={16} /> Login
                    </Link>
                  )}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              ref={(el) => (tabsRef.current[i] = el)}
              className={`tab-btn${(tab.path === '/home'
                ? location.pathname === tab.path
                : location.pathname.startsWith(tab.path)) ? " active" : ""
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
