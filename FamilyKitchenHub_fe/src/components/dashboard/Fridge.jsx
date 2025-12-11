import React, { useState, useEffect, useRef } from "react";
import axios from "../../hooks/axios";
import "./../../styles/FridgeManager.css";
import bgIngredients from "../../assets/bgIg3.jpg";
import { Plus, MoreVertical, Package, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import ConfirmModal from "../ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // GET inventory list
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const userDataString = localStorage.getItem("user");
        if (!userDataString) return;

        const userData = JSON.parse(userDataString);
        const userId = userData.id;

        const res = await axios.get(`/inventory/user/${userId}`);
        setIngredients(res.data);
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
    const expiry = new Date(expDate);
    const diff = (expiry - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "Expired";
    if (diff <= 3) return "Expiring Soon";
    return "Fresh";
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
        toast.error("Không thể xóa nguyên liệu!", {
          position: "top-right",
          autoClose: 2000,
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
        <div className="stat-card">
          <div className="stat-icon total">
            <Package size={28} />
          </div>
          <div className="stat-info">
            <h3>{ingredients.length}</h3>
            <p>Total Ingredients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon fresh">
            <CheckCircle size={28} />
          </div>
          <div className="stat-info">
            <h3>{ingredients.filter(item => getStatus(item.expirationDate) === "Fresh").length}</h3>
            <p>Fresh Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expiring">
            <AlertCircle size={28} />
          </div>
          <div className="stat-info">
            <h3>{ingredients.filter(item => getStatus(item.expirationDate) === "Expiring Soon").length}</h3>
            <p>Expiring Soon</p>
          </div>
        </div>
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
        {ingredients.map((item) => {
          const status = getStatus(item.expirationDate);

          return (
            <div
              key={item.id}
              className={`ingredient-card ${status
                .toLowerCase()
                .replace(" ", "-")}`}
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
                    onFocus={() => {
                      if (availableIngredients.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
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
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                        marginTop: "4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {availableIngredients.map((ing) => (
                        <div
                          key={ing.id}
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
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f5f5f5";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "white";
                          }}
                        >
                          {ing.name} ({ing.unit})
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

              <label>
                Expiration Date
                <input
                  type="date"
                  value={newIngredient.expirationDate}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      expirationDate: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Purchased Date (Ngày mua)
                <input
                  type="date"
                  value={newIngredient.purchasedAt}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      purchasedAt: e.target.value,
                    })
                  }
                />
              </label>

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
