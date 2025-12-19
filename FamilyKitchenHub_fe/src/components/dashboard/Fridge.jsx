import React, { useState, useEffect, useRef } from "react";

// Track notifications đã được tạo trong session để tránh trùng lặp
const notificationCreationTracker = new Set();
import axios from "../../hooks/axios";
import "./../../styles/FridgeManager.css";
import bgIngredients from "../../assets/bgIg3.jpg";
import { Plus, MoreVertical, Package, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import ConfirmModal from "../ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Tooltip } from "@mui/material";

export default function FridgeManager() {
  const [ingredients, setIngredients] = useState([]); // Inventory items
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    itemId: null,
    itemName: ''
  });

  // Ingredients list for dropdown
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  // Ref để ngăn chặn việc tạo notification trùng lặp khi StrictMode chạy effect hai lần
  const isProcessingNotificationsRef = useRef(false);

  const [newIngredient, setNewIngredient] = useState({
    ingredientId: "",
    ingredientName: "",
    unit: "",
    quantity: "",
    expirationDate: "",
    purchasedAt: "",
  });

  // Scroll Animation Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    setTimeout(() => {
      const elements = document.querySelectorAll(".scroll-reveal");
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [ingredients]);

  // Helper function to check if ingredient is expired
  const checkExpired = (expDate) => {
    if (!expDate) {
      console.log("  ⚠️ Không có expirationDate");
      return false;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Xử lý nhiều format date có thể có
      let expiry;
      if (typeof expDate === 'string') {
        // Nếu là string, parse nó
        expiry = new Date(expDate);
      } else if (expDate instanceof Date) {
        expiry = new Date(expDate);
      } else {
        expiry = new Date(expDate);
      }

      expiry.setHours(0, 0, 0, 0);

      // Expires the day AFTER the expiration date
      const isExpired = today > expiry; // Changed from expiry < today
      const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

      console.log(`  📅 Expiration check: ${expDate} -> ${expiry.toISOString().split('T')[0]}, Today: ${today.toISOString().split('T')[0]}, Diff: ${diffDays} days, Expired: ${isExpired}`);

      return isExpired;
    } catch (error) {
      console.error("  ❌ Lỗi khi parse expirationDate:", expDate, error);
      return false; // Nếu không parse được, không coi là quá hạn
    }
  };

  // Helper function to check if ingredient is expiring soon (within 3 days and not expired)
  const checkExpiringSoon = (expDate) => {
    if (!expDate) {
      return false;
    }
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Xử lý nhiều format date có thể có
      let expiry;
      if (typeof expDate === 'string') {
        expiry = new Date(expDate);
      } else if (expDate instanceof Date) {
        expiry = new Date(expDate);
      } else {
        expiry = new Date(expDate);
      }
      
      expiry.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
      
      // Gần hết hạn: trong vòng 3 ngày và chưa hết hạn
      const isExpiringSoon = diffDays >= 0 && diffDays <= 3;
      
      console.log(`  ⏰ Expiring soon check: ${expDate} -> ${expiry.toISOString().split('T')[0]}, Today: ${today.toISOString().split('T')[0]}, Diff: ${diffDays} days, Expiring Soon: ${isExpiringSoon}`);
      
      return isExpiringSoon;
    } catch (error) {
      console.error("  ❌ Lỗi khi parse expirationDate:", expDate, error);
      return false;
    }
  };


  // GET inventory list
  useEffect(() => {
    const fetchIngredients = async () => {
      // Ngăn chặn việc chạy song song khi StrictMode chạy effect hai lần
      if (isProcessingNotificationsRef.current) {
        console.log("⏸️ Đang xử lý notification, bỏ qua lần chạy này");
        return;
      }

      // Đánh dấu đang xử lý ngay từ đầu để tránh race condition
      isProcessingNotificationsRef.current = true;

      try {
        const userDataString = localStorage.getItem("user");
        if (!userDataString) {
          isProcessingNotificationsRef.current = false;
          return;
        }

        const userData = JSON.parse(userDataString);
        const userId = userData.id;
        const token = localStorage.getItem("token");


        const res = await axios.get(`/inventory/user/${userId}`);
        const ingredientsData = res.data || [];
        setIngredients(ingredientsData);

        // Kiểm tra và tạo notification cho các nguyên liệu hết hạn và gần hết hạn
        console.log("🔍 Kiểm tra nguyên liệu hết hạn và gần hết hạn:", {
          totalIngredients: ingredientsData.length,
          ingredients: ingredientsData.map(item => ({
            id: item.id,
            name: item.ingredientName,
            expirationDate: item.expirationDate,
            isExpired: item.expirationDate ? checkExpired(item.expirationDate) : false,
            isExpiringSoon: item.expirationDate ? checkExpiringSoon(item.expirationDate) : false
          }))
        });

        // Lọc các nguyên liệu hết hạn
        const expiredIngredients = ingredientsData.filter(item => {
          if (!item.expirationDate) return false;
          const isExpired = checkExpired(item.expirationDate);
          console.log(`  📅 ${item.ingredientName} (${item.expirationDate}): ${isExpired ? 'HẾT HẠN' : 'Còn hạn'}`);
          return isExpired;
        });

        // Lọc các nguyên liệu gần hết hạn (chưa hết hạn nhưng trong vòng 3 ngày)
        const expiringSoonIngredients = ingredientsData.filter(item => {
          if (!item.expirationDate) return false;
          const isExpired = checkExpired(item.expirationDate);
          const isExpiringSoon = checkExpiringSoon(item.expirationDate);
          // Chỉ lấy những nguyên liệu gần hết hạn và chưa hết hạn
          if (isExpiringSoon && !isExpired) {
            console.log(`  ⏰ ${item.ingredientName} (${item.expirationDate}): GẦN HẾT HẠN`);
            return true;
          }
          return false;
        });

        console.log(`📊 Tìm thấy ${expiredIngredients.length} nguyên liệu hết hạn:`, expiredIngredients.map(i => i.ingredientName));
        console.log(`⏰ Tìm thấy ${expiringSoonIngredients.length} nguyên liệu gần hết hạn:`, expiringSoonIngredients.map(i => i.ingredientName));

        // Tạo notification cho cả nguyên liệu hết hạn và gần hết hạn
        // Thêm flag để phân biệt loại notification
        const expiredItemsWithType = expiredIngredients.map(item => ({ ...item, notificationType: 'expired' }));
        const expiringSoonItemsWithType = expiringSoonIngredients.map(item => ({ ...item, notificationType: 'expiringSoon' }));
        const allNotificationItems = [...expiredItemsWithType, ...expiringSoonItemsWithType];

        if (allNotificationItems.length > 0) {
          // Fetch danh sách notifications hiện có để tránh trùng lặp
          let existingNotifications = [];
          try {
            const notificationsRes = await axios.get(`/users/${userId}/notifications`);
            existingNotifications = notificationsRes.data || [];
            console.log(`📋 Đã fetch ${existingNotifications.length} notifications hiện có`);
            
          } catch (error) {
            console.warn("⚠️ Không thể fetch notifications hiện có:", error);
          }
          
          // Tạo Set các inventoryItemId đã có notification
          const existingInventoryIds = new Set(
            existingNotifications
              .filter(n => n.type === 'INVENTORY_EXPIRING' && n.inventoryItemId)
              .map(n => Number(n.inventoryItemId))
          );
          
          console.log(`📋 Có ${existingInventoryIds.size} nguyên liệu đã có notification:`, Array.from(existingInventoryIds));
          
          // Lọc bỏ các nguyên liệu đã có notification (cả trong DB và trong session)
          const itemsNeedingNotification = allNotificationItems.filter(item => {
            const inventoryId = Number(item.id);
            const alreadyHasNotificationInDB = existingInventoryIds.has(inventoryId);
            const alreadyCreatedInSession = notificationCreationTracker.has(inventoryId);
            const shouldSkip = alreadyHasNotificationInDB || alreadyCreatedInSession;
            
            
            if (shouldSkip) {
              console.log(`⏭️ Bỏ qua ${item.ingredientName} (ID: ${inventoryId}) - ${alreadyHasNotificationInDB ? 'đã có notification trong DB' : 'đã tạo trong session này'}`);
            }
            return !shouldSkip;
          });
          
          console.log(`📊 Cần tạo notification cho ${itemsNeedingNotification.length}/${allNotificationItems.length} nguyên liệu`);

          if (itemsNeedingNotification.length === 0) {
            console.log("ℹ️ Tất cả nguyên liệu đã có notification, không cần tạo mới");
            return;
          }
          
          console.log(`📊 Bắt đầu tạo notification cho ${itemsNeedingNotification.length} nguyên liệu`);
          
          // Tạo notification cho từng nguyên liệu
          const notificationPromises = itemsNeedingNotification.map(async (item) => {
            const formatDate = (d) => {
              if (!d) return "N/A";
              const dt = new Date(d);
              return dt.toLocaleDateString('vi-VN');
            };
            
            // Tính số ngày còn lại
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expiry = new Date(item.expirationDate);
            expiry.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
            
            // Tạo message khác nhau tùy theo loại notification
            let notificationMessage;
            if (item.notificationType === 'expired') {
              notificationMessage = `${item.ingredientName} đã hết hạn (${formatDate(item.expirationDate)})`;
            } else {
              // expiringSoon
              const daysText = diffDays === 0 ? 'hôm nay' : diffDays === 1 ? '1 ngày nữa' : `${diffDays} ngày nữa`;
              notificationMessage = `${item.ingredientName} sắp hết hạn (còn ${daysText} - ${formatDate(item.expirationDate)})`;
            }
            
            // Tạo notification qua API backend
            // Backend enum: NotificationType { INVENTORY_EXPIRING, GENERAL }
            // Sử dụng INVENTORY_EXPIRING cho cả nguyên liệu hết hạn và sắp hết hạn
            const inventoryId = Number(item.id);
            
            
            // Sử dụng format đúng: camelCase với inventoryItemId là number
            // Chỉ tạo 1 notification duy nhất, không thử nhiều format
            const notificationPayload = {
              message: notificationMessage,
              type: "INVENTORY_EXPIRING",
              inventoryItemId: inventoryId
            };
            
            
            try {
              console.log(`📝 Đang tạo notification cho: ${item.ingredientName}`, {
                message: notificationMessage,
                itemId: item.id,
                inventoryId: inventoryId,
                userId: userId,
                endpoint: `/users/${userId}/notifications`,
                payload: notificationPayload
              });

              // Đảm bảo Content-Type là application/json
              const response = await axios.post(
                `/users/${userId}/notifications`, 
                notificationPayload,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                  }
                }
              );
              
              
              // Đánh dấu đã tạo notification cho inventoryId này trong session
              notificationCreationTracker.add(inventoryId);
              
              console.log(`✅ Đã tạo notification thành công cho ${item.ingredientName}:`, response.data);
              return { success: true, item: item.ingredientName, data: response.data };
            } catch (notifError) {
              
              const errorDetails = {
                status: notifError.response?.status,
                statusText: notifError.response?.statusText,
                data: notifError.response?.data,
                message: notifError.response?.data?.message || notifError.message,
                endpoint: `/users/${userId}/notifications`,
                payload: notificationPayload
              };
              console.error(`❌ Không thể tạo notification cho ${item.ingredientName}:`, errorDetails);
              return { success: false, item: item.ingredientName, error: notifError, details: errorDetails };
            }
          });

          // Đợi tất cả notifications được tạo
          const results = await Promise.all(notificationPromises);
          const successCount = results.filter(r => r.success).length;
          const failCount = results.filter(r => !r.success).length;

          console.log(`📊 Kết quả tạo notification: ${successCount} thành công, ${failCount} thất bại`);
          if (successCount > 0) {
            console.log(`✅ Đã tạo thành công ${successCount} notification(s):`, results.filter(r => r.success).map(r => r.item));
          }
          if (failCount > 0) {
            console.warn(`⚠️ Không thể tạo ${failCount} notification(s):`, results.filter(r => !r.success).map(r => r.item));
          }

          // Trigger event để sidebar refresh notifications ngay lập tức (chỉ khi có ít nhất 1 notification thành công)
          if (successCount > 0) {
            console.log("🔄 Triggering refreshNotifications event để hiển thị trong notification-wrapper");
            // Đợi một chút để backend xử lý xong và commit vào database
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('refreshNotifications'));
              console.log("✅ Đã dispatch refreshNotifications event");
            }, 1000); // Tăng thời gian đợi lên 1 giây để đảm bảo backend xử lý xong
          } else {
            console.warn("⚠️ Không có notification nào được tạo thành công, không refresh sidebar");
          }
          
          // Reset flag sau khi xử lý xong
          isProcessingNotificationsRef.current = false;
        } else {
          console.log("ℹ️ Không có nguyên liệu hết hạn");
          // Reset flag ngay cả khi không có nguyên liệu hết hạn
          isProcessingNotificationsRef.current = false;
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        // Reset flag khi có lỗi
        isProcessingNotificationsRef.current = false;
      }
    };

    fetchIngredients();
  }, []);

  // Load all ingredients for dropdown
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const res = await axios.get("/ingredients");
        setAvailableIngredients(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error loading ingredients:", error);
      }
    };
    loadIngredients();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.ingredient-dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Search ingredients with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search keyword is empty, don't search but keep current list
    if (!searchKeyword.trim()) {
      return;
    }

    // Set debounce timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await axios.get("/ingredients/search", {
          params: { keyword: searchKeyword.trim() },
        });
        setAvailableIngredients(Array.isArray(res.data) ? res.data : []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching ingredients:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchKeyword]);

  // POST add ingredient
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      const userDataString = localStorage.getItem("user");
      if (!userDataString) {
        alert("Vui lòng đăng nhập lại.");
        return;
      }

      const userData = JSON.parse(userDataString);
      const userId = userData.user?.id || userData.id;

      if (!userId) {
        alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      // Validate: cần có ingredientId (bắt buộc theo backend)
      if (!newIngredient.ingredientId) {
        alert("Vui lòng chọn nguyên liệu từ danh sách.");
        return;
      }

      // Validate: cần có quantity
      if (!newIngredient.quantity) {
        alert("Vui lòng nhập số lượng.");
        return;
      }

      // Chuẩn bị payload theo format backend yêu cầu
      const payload = {
        userId: Number(userId),
        ingredientId: Number(newIngredient.ingredientId),
        quantity: parseFloat(newIngredient.quantity),
      };

      // Thêm expirationDate nếu có
      if (newIngredient.expirationDate) {
        payload.expirationDate = newIngredient.expirationDate;
      }

      // Thêm purchasedAt (ngày mua) - nếu không có thì dùng ngày hiện tại
      if (newIngredient.purchasedAt) {
        payload.purchasedAt = newIngredient.purchasedAt;
      } else {
        // Mặc định là ngày hiện tại (format YYYY-MM-DD)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        payload.purchasedAt = `${year}-${month}-${day}`;
      }

      console.log("Sending payload:", payload); // Debug log
      await axios.post("/inventory", payload);

      setShowModal(false);
      setNewIngredient({
        ingredientId: "",
        ingredientName: "",
        unit: "",
        quantity: "",
        expirationDate: "",
        purchasedAt: "",
      });
      setSearchKeyword("");
      setShowDropdown(false);

      const res = await axios.get(`/inventory/user/${userId}`);
      setIngredients(res.data);
    } catch (error) {
      console.error("Error adding ingredient:", error);
      // Hiển thị thông báo lỗi chi tiết hơn
      const errorMessage = error.response?.data?.message || error.message || "Không thể thêm nguyên liệu. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  const getStatus = (expDate) => {
    if (!expDate) return "Fresh";
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day
    const expiry = new Date(expDate);
    expiry.setHours(0, 0, 0, 0); // Normalize expiry to start of day

    // Expires the day AFTER expiration date
    // If today is 2023-10-27 and expiry is 2023-10-26, then today > expiry is true, meaning it's expired.
    // If today is 2023-10-26 and expiry is 2023-10-26, then today > expiry is false, meaning it's not yet expired.
    if (today > expiry) return "Expired";

    // Calculate difference in days for "Expiring Soon"
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff <= 3) return "Expiring Soon";
    return "Fresh";
  };

  const getItemsByStatus = (statusType) => {
    let items = [];
    if (statusType === "Total") items = ingredients;
    else if (statusType === "Fresh") items = ingredients.filter(item => getStatus(item.expirationDate) === "Fresh");
    else if (statusType === "Expired") items = ingredients.filter(item => getStatus(item.expirationDate) === "Expired");

    if (items.length === 0) return "No items";

    const MAX_ITEMS_SHOW = 10;
    const names = items.map(i => i.ingredientName);

    if (names.length <= MAX_ITEMS_SHOW) {
      return names.join(", ");
    }

    const shown = names.slice(0, MAX_ITEMS_SHOW).join(", ");
    const remaining = names.length - MAX_ITEMS_SHOW;
    return `${shown}, ... +${remaining} more`;
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    return dt.toLocaleDateString();
  };

  const handleDeleteClick = (item) => {
    setConfirmModal({
      isOpen: true,
      itemId: item.id,
      itemName: item.ingredientName
    });
  };

  const executeDelete = async () => {
    const id = confirmModal.itemId;
    const userDataString = localStorage.getItem("user");
    if (!userDataString) return toast.error("Vui lòng đăng nhập lại.");

    setIsLoading(true);

    try {
      // Assuming endpoint is DELETE /inventory/{id}
      await axios.delete(`/inventory/${id}`);

      setTimeout(() => {
        setIsLoading(false);
        setIngredients((prev) => prev.filter((item) => item.id !== id));
        setConfirmModal({ isOpen: false, itemId: null, itemName: '' });
        toast.success("Xóa nguyên liệu thành công!", {
          position: "top-center",
          autoClose: 2000,
        });
      }, 2000);
    } catch (error) {
      setTimeout(() => {
        setIsLoading(false);
        console.error("Error deleting ingredient:", error);

        // Xử lý lỗi chi tiết hơn
        let errorMessage = "Không thể xóa nguyên liệu!";

        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          const errorMsg = data?.message || data?.error || "";

          // Kiểm tra lỗi foreign key constraint
          if (errorMsg.includes("foreign key constraint") ||
            errorMsg.includes("Cannot delete or update a parent row") ||
            errorMsg.includes("user_notifications") ||
            errorMsg.includes("inventory_item_id")) {
            errorMessage = "Không thể xóa nguyên liệu này vì nó đang được sử dụng trong thông báo. Vui lòng xóa các thông báo liên quan trước.";
          } else if (status === 404) {
            errorMessage = "Không tìm thấy nguyên liệu cần xóa.";
          } else if (status === 403) {
            errorMessage = "Bạn không có quyền xóa nguyên liệu này.";
          } else if (status === 500) {
            errorMessage = errorMsg || "Lỗi server. Vui lòng thử lại sau.";
          } else {
            errorMessage = errorMsg || `Lỗi ${status}: Không thể xóa nguyên liệu.`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }, 2000);
    }
  };

  return (
    <div className="fridge-manager">
      <ToastContainer />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Xóa nguyên liệu"
        message={`Bạn có chắc chắn muốn xóa "${confirmModal.itemName}" khỏi tủ lạnh không?`}
        isLoading={isLoading}
      />
      {/* Welcome Section */}
      <div
        className="welcome-section"
        style={{
          backgroundImage: `url(${bgIngredients})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "110vh",
        }}
      >
        <div className="welcome-text">
          <h1>Welcome to Fridge Manager! Let’s check your fridge today</h1>
          <p>Keep your ingredients fresh and reduce food waste</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <Tooltip title={getItemsByStatus("Total")} arrow>
          <div className="stat-card scroll-reveal" style={{ transitionDelay: '1s' }}>
            <div className="stat-icon total">
              <Package size={28} />
            </div>
            <div className="stat-info">
              <h3>{ingredients.length}</h3>
              <p>Total Ingredients</p>
            </div>
          </div>
        </Tooltip>

        <Tooltip title={getItemsByStatus("Fresh")} arrow>
          <div className="stat-card scroll-reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="stat-icon fresh">
              <CheckCircle size={28} />
            </div>
            <div className="stat-info">
              <h3>{ingredients.filter(item => getStatus(item.expirationDate) === "Fresh").length}</h3>
              <p>Fresh Items</p>
            </div>
          </div>
        </Tooltip>

        <Tooltip title={getItemsByStatus("Expired")} arrow>
          <div className="stat-card scroll-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="stat-icon expiring">
              <AlertCircle size={28} />
            </div>
            <div className="stat-info">
              <h3>{ingredients.filter(item => getStatus(item.expirationDate) === "Expired").length}</h3>
              <p>Expired</p>
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Header */}
      <div className="header-fridge">
        <h2>Your Ingredients</h2>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Ingredient
        </button>
      </div>

      {/* Ingredient Grid */}
      <div className="ingredient-grid">
        {ingredients.map((item, index) => {
          const status = getStatus(item.expirationDate);

          return (
            <div
              key={item.id}
              className={`ingredient-card scroll-reveal ${status
                .toLowerCase()
                .replace(" ", "-")}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="card-header">
                <h3>{item.ingredientName}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="icon-btn"
                    onClick={() => handleDeleteClick(item)}
                    style={{ color: '#ef4444', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                  <MoreVertical size={16} />
                </div>
              </div>

              <p className="info">
                <strong>Số lượng:</strong> {item.quantity ?? "-"}
              </p>

              <p className="info">
                <strong>Đơn vị:</strong> {item.unit || "-"}
              </p>

              <p className="info">
                <strong>Mã nguyên liệu:</strong> {item.ingredientId ?? "-"}
              </p>

              <div className="nutrition">
                <p className="nutrition-title">Hạn sử dụng:</p>
                <p className="nutrition-value">
                  {formatDate(item.expirationDate)}
                </p>
              </div>

              <div
                className={`status ${status.toLowerCase().replace(" ", "-")}`}
              >
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Add Inventory Item */}
      {showModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Inventory Item</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                ✖
              </button>
            </div>

            <form className="modal-form" onSubmit={handleAddIngredient}>
              <label>
                Ingredient (Nguyên liệu)
                <div className="ingredient-dropdown-container" style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      setShowDropdown(true);
                    }}
                    onClick={() => setShowDropdown(true)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Tìm kiếm nguyên liệu..."
                    required
                    style={{ width: "100%" }}
                  />
                  {isSearching && (
                    <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}>
                      Đang tìm...
                    </span>
                  )}
                  {showDropdown && availableIngredients.length > 0 && (
                    <div className="ingredient-dropdown">
                      {availableIngredients.map((ing) => (
                        <div
                          key={ing.id}
                          className="ingredient-item"
                          onClick={() => {
                            setNewIngredient({
                              ...newIngredient,
                              ingredientId: ing.id,
                              ingredientName: ing.name,
                              unit: ing.unit || "",
                            });
                            setSearchKeyword(`${ing.name} (${ing.unit})`);
                            setShowDropdown(false);
                          }}
                        >
                          <span>{ing.name}</span>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {newIngredient.ingredientId && (
                  <small style={{ color: "#666", marginTop: "4px", display: "block" }}>
                    Đã chọn: {newIngredient.ingredientName}
                  </small>
                )}
              </label>

              {newIngredient.ingredientId && newIngredient.unit && (
                <label>
                  Unit (Đơn vị)
                  <input
                    type="text"
                    value={newIngredient.unit}
                    readOnly
                    style={{
                      backgroundColor: "#f5f5f5",
                      cursor: "not-allowed",
                      color: "#666",
                    }}
                    placeholder="Đơn vị sẽ hiển thị sau khi chọn nguyên liệu"
                  />
                </label>
              )}

              <label>
                Quantity (Số lượng)
                <input
                  type="number"
                  step="any"
                  value={newIngredient.quantity}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      quantity: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g. 15"
                />
              </label>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                  <DatePicker
                    disablePast
                    label="Expiration Date"
                    value={newIngredient.expirationDate ? dayjs(newIngredient.expirationDate) : null}
                    onChange={(newValue) =>
                      setNewIngredient({
                        ...newIngredient,
                        expirationDate: newValue ? newValue.format('YYYY-MM-DD') : "",
                      })
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />

                  <DatePicker
                    label="Purchased Date (Ngày mua)"
                    maxDate={dayjs()}
                    value={newIngredient.purchasedAt ? dayjs(newIngredient.purchasedAt) : null}
                    onChange={(newValue) =>
                      setNewIngredient({
                        ...newIngredient,
                        purchasedAt: newValue ? newValue.format('YYYY-MM-DD') : "",
                      })
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </div>
              </LocalizationProvider>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}