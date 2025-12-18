import React, { useState, useEffect, useRef } from "react";
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

  // GET inventory list
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const userDataString = localStorage.getItem("user");
        if (!userDataString) return;

        const userData = JSON.parse(userDataString);
        const userId = userData.id;
        const token = localStorage.getItem("token");

        const res = await axios.get(`/inventory/user/${userId}`);
        const ingredientsData = res.data || [];
        setIngredients(ingredientsData);

        // Kiểm tra và tạo notification cho các nguyên liệu hết hạn
        console.log("🔍 Kiểm tra nguyên liệu hết hạn:", {
          totalIngredients: ingredientsData.length,
          ingredients: ingredientsData.map(item => ({
            id: item.id,
            name: item.ingredientName,
            expirationDate: item.expirationDate,
            isExpired: item.expirationDate ? checkExpired(item.expirationDate) : false
          }))
        });

        const expiredIngredients = ingredientsData.filter(item => {
          if (!item.expirationDate) return false;
          const isExpired = checkExpired(item.expirationDate);
          console.log(`  📅 ${item.ingredientName} (${item.expirationDate}): ${isExpired ? 'HẾT HẠN' : 'Còn hạn'}`);
          return isExpired;
        });

        console.log(`📊 Tìm thấy ${expiredIngredients.length} nguyên liệu hết hạn:`, expiredIngredients.map(i => i.ingredientName));

        if (expiredIngredients.length > 0) {
          console.log(`📊 Bắt đầu tạo notification cho ${expiredIngredients.length} nguyên liệu hết hạn`);

          // Tạo notification cho từng nguyên liệu hết hạn
          const notificationPromises = expiredIngredients.map(async (item) => {
            const formatDate = (d) => {
              if (!d) return "N/A";
              const dt = new Date(d);
              return dt.toLocaleDateString('vi-VN');
            };

            const notificationMessage = `${item.ingredientName} đã hết hạn (${formatDate(item.expirationDate)})`;

            // Tạo notification qua API backend
            // Backend expects NotificationRequestDTO - thử nhiều format
            const notificationPayloads = [
              // Format 1: camelCase với inventoryItemId là number
              {
                message: notificationMessage,
                type: "EXPIRED_INGREDIENT",
                inventoryItemId: Number(item.id)
              },
              // Format 2: camelCase với inventoryItemId là string
              {
                message: notificationMessage,
                type: "EXPIRED_INGREDIENT",
                inventoryItemId: String(item.id)
              },
              // Format 3: snake_case
              {
                message: notificationMessage,
                type: "EXPIRED_INGREDIENT",
                inventory_item_id: Number(item.id)
              },
              // Format 4: chỉ có message và type (không có inventoryItemId)
              {
                message: notificationMessage,
                type: "EXPIRED_INGREDIENT"
              }
            ];

            let lastError = null;
            for (let i = 0; i < notificationPayloads.length; i++) {
              const notificationPayload = notificationPayloads[i];
              try {
                console.log(`📝 [Format ${i + 1}] Đang tạo notification cho: ${item.ingredientName}`, {
                  message: notificationMessage,
                  inventoryItemId: item.id,
                  userId: userId,
                  endpoint: `/users/${userId}/notifications`,
                  payload: notificationPayload
                });

                const response = await axios.post(`/users/${userId}/notifications`, notificationPayload, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                console.log(`✅ Đã tạo notification thành công cho ${item.ingredientName} (Format ${i + 1}):`, response.data);
                return { success: true, item: item.ingredientName, data: response.data, format: i + 1 };
              } catch (notifError) {
                lastError = notifError;
                const errorDetails = {
                  status: notifError.response?.status,
                  statusText: notifError.response?.statusText,
                  data: notifError.response?.data,
                  message: notifError.response?.data?.message || notifError.message,
                  endpoint: `/users/${userId}/notifications`,
                  payload: notificationPayload,
                  format: i + 1
                };
                console.warn(`⚠️ Format ${i + 1} failed cho ${item.ingredientName}:`, errorDetails);

                // Nếu không phải lỗi 400, không thử format khác
                if (notifError.response?.status !== 400) {
                  break;
                }
              }
            }

            // Nếu tất cả format đều fail
            const errorDetails = {
              status: lastError?.response?.status,
              statusText: lastError?.response?.statusText,
              data: lastError?.response?.data,
              message: lastError?.response?.data?.message || lastError?.message,
              endpoint: `/users/${userId}/notifications`,
              allPayloads: notificationPayloads
            };
            console.error(`❌ Tất cả format đều fail cho ${item.ingredientName}:`, errorDetails);
            console.error("Full error response:", JSON.stringify(errorDetails, null, 2));
            return { success: false, item: item.ingredientName, error: lastError, details: errorDetails };
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
        } else {
          console.log("ℹ️ Không có nguyên liệu hết hạn");
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
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
          <div className="stat-card scroll-reveal" style={{ transitionDelay: '0.1s' }}>
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
              className={`ingredient-card ${status
                .toLowerCase()
                .replace(" ", "-")} scroll-reveal`}
              style={{ transitionDelay: `${index * 0.05}s` }}
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