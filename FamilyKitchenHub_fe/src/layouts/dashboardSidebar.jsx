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
  UtensilsCrossed,
  Bell,
  AlertCircle,
  X,
  Trash2
} from "lucide-react";
import axios from "../hooks/axios";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isValidJWT } from "../utils/security";

const TABS = [
  { label: "Home", path: "/home", icon: <HomeIcon size={18} /> },
  {
    label: "Recommend",
    path: "/manage/dashboard",
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

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);
  const notificationRef = useRef(null);

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
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Validate token immediately
    if (token && !isValidJWT(token)) {
      console.warn("Sidebar: Token invalid, logging out.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    if (userData && token) {
      try {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData)); // chuyển chuỗi JSON thành object
      } catch {
        console.error("Invalid user data in localStorage");
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      // If token invalid/missing but we consider them logged in (or have stale data)
      // Perform cleanup
      if (localStorage.getItem("token") || localStorage.getItem("user")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
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

      // Close notifications when clicking outside
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch expiring ingredients
  // Fetch expiring ingredients
  // Fetch notifications from Backend
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoggedIn || !user) return;

      try {
        const res = await axios.get(`/users/${user.id}/notifications`);
        const data = res.data || [];

        console.log("📬 Fetched notifications from backend:", {
          total: data.length,
          notifications: data.map(n => ({
            id: n.id,
            message: n.message,
            type: n.type,
            inventoryItemId: n.inventoryItemId,
            createdAt: n.createdAt
          }))
        });

        // Filter out locally dismissed notifications (optional, if we want to hide them per session)
        // If the backend doesn't support "mark as read/delete", we might just show all.
        // But to keep the "Delete Ingredient" flow smooth, we hide the ones we just "acted" on.
        const visible = data.filter(n => !dismissedIds.includes(n.id));

        // Sort by createdAt desc (newest first)
        visible.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

        console.log("📋 Visible notifications after filtering:", visible.length);
        setNotifications(visible);
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
    };

    fetchNotifications();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    // Listen for custom event to refresh notifications immediately
    const handleRefreshNotifications = () => {
      console.log("🔄 Refreshing notifications due to custom event - sẽ hiển thị trong notification-wrapper");
      // Đợi một chút để đảm bảo backend đã commit notification vào database
      setTimeout(() => {
        fetchNotifications();
      }, 200);
    };
    window.addEventListener('refreshNotifications', handleRefreshNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
    };
  }, [isLoggedIn, user, dismissedIds]);

  const handleDeleteIngredient = async (e, notification) => {
    e.stopPropagation();
    const inventoryId = notification.inventoryItemId;

    if (!inventoryId) {
      // If no inventory ID (e.g. system message), maybe just dismiss locally?
      setDismissedIds(prev => [...prev, notification.id]);
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa nguyên liệu này khỏi tủ lạnh?")) {
      return;
    }

    try {
      await axios.delete(`/inventory/${inventoryId}`);
      // Optimistic update: Hide the notification
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setDismissedIds(prev => [...prev, notification.id]);
    } catch (error) {
      console.error("Error deleting ingredient from notification:", error);
      alert("Không thể xóa nguyên liệu. " + (error.response?.data?.message || ""));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
                      <div className="pf-dropdown-item"> {user?.fullName || user?.username || "User"}</div>
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
        {/* NOTIFICATION BELL */}
        {isLoggedIn && (
          <div className="notification-wrapper" ref={notificationRef}>
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <div className="notification-badge">{notifications.length}</div>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <span>Thông báo ({notifications.length})</span>
                </div>
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((item, index) => {
                      return (
                        <div key={item.id || index} className="notification-item">
                          <AlertCircle size={22} className="notif-icon" />
                          <div className="notif-content">
                            <div className="notif-title">{item.message}</div>
                            <div className="notif-time">
                              {item.createdAt ? dayjs(item.createdAt).format("DD/MM/YYYY HH:mm") : ""}
                            </div>
                          </div>
                          {item.inventoryItemId && (
                            <button
                              className="notif-close-btn"
                              onClick={(e) => handleDeleteIngredient(e, item)}
                              title="Xóa nguyên liệu khỏi tủ lạnh"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-notifications">
                      Không có thông báo nào.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
