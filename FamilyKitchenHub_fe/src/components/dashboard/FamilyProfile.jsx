import React, { useEffect, useState } from "react";
import axios from "../../hooks/axios";
import EditProfile from "../EditProfile";
import "./../../styles/FamilyProfile.css";
import { Pen, Trash2, PlusCircle, Users, Heart, Activity, Target, ChevronDown } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/cooking animation.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "../ConfirmModal";

export default function FamilyProfiles() {
  const [members, setMembers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: ''
  });
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "",
    tastePreferences: "",
    healthConditions: "",
    allergyIds: [],
  });
  const [allAllergies, setAllAllergies] = useState([]);
  const [showAllergies, setShowAllergies] = useState(false);

  // Fetch API thật khi load trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warn("Bạn chưa đăng nhập! Vui lòng đăng nhập để xem hồ sơ gia đình.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Get userId from localStorage
    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id || localStorage.getItem("userId");

    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    // Use the correct endpoint: /family-members/user/{userId}
    axios
      .get(`/family-members/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMembers(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách:", err.response || err.message || err);
      });

    axios
      .get("/allergies", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllAllergies(res.data))
      .catch((err) => console.error("Lỗi khi lấy danh sách dị ứng:", err));
  }, []);

  // Form handler
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleAllergyToggle(id) {
    setForm((prev) => {
      const current = prev.allergyIds || [];
      if (current.includes(id)) {
        return { ...prev, allergyIds: current.filter((x) => x !== id) };
      } else {
        return { ...prev, allergyIds: [...current, id] };
      }
    });
  }

  function handleAdd(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Chưa đăng nhập!");
    const user = JSON.parse(localStorage.getItem("user"));

    const payload = {
      userId: user?.id,
      name: form.name,
      age: parseInt(form.age) || null,
      gender: form.gender || null,
      heightCm: parseFloat(form.heightCm) || null,
      weightKg: parseFloat(form.weightKg) || null,
      activityLevel: form.activityLevel || null,
      tastePreferences: form.tastePreferences || null,
      healthConditions: form.healthConditions || null,
      allergyIds: form.allergyIds || [],
    };

    setIsLoading(true);

    axios
      .post("/family-members", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTimeout(() => {
          setIsLoading(false);
          setMembers((prev) => [...prev, res.data]);
          closeModal();
          toast.success("Thêm thành viên thành công!", {
            position: "top-center",
            autoClose: 2000,
          });
        }, 2000);
      })
      .catch((err) => {
        setTimeout(() => {
          setIsLoading(false);
          console.error("Lỗi khi thêm thành viên:", err);
          toast.error("Không thể thêm thành viên!", {
            position: "top-right",
            autoClose: 2000,
          });
        }, 2000);
      });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Chưa đăng nhập!");

    const payload = {
      name: form.name,
      age: parseInt(form.age) || null,
      gender: form.gender || null,
      heightCm: parseFloat(form.heightCm) || null,
      weightKg: parseFloat(form.weightKg) || null,
      activityLevel: form.activityLevel || null,
      tastePreferences: form.tastePreferences || null,
      healthConditions: form.healthConditions || null,
      allergyIds: form.allergyIds || [],
    };

    setIsLoading(true);

    axios
      .put(`/family-members/${editing.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTimeout(() => {
          setIsLoading(false);
          setMembers((prev) =>
            prev.map((m) => (m.id === editing.id ? res.data : m))
          );
          closeModal();
          toast.success("Cập nhật thành công!", {
            position: "top-center",
            autoClose: 2000,
          });
        }, 2000);
      })
      .catch((err) => {
        setTimeout(() => {
          setIsLoading(false);
          console.error("Lỗi khi chỉnh sửa:", err);
          toast.error("Không thể cập nhật!", {
            position: "top-right",
            autoClose: 2000,
          });
        }, 2000);
      });
  }

  function handleDeleteClick(member) {
    setConfirmModal({
      isOpen: true,
      memberId: member.id,
      memberName: member.name
    });
  }

  function executeDelete() {
    const id = confirmModal.memberId;
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Chưa đăng nhập!");

    setIsLoading(true);

    axios
      .delete(`/family-members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setTimeout(() => {
          setIsLoading(false);
          setMembers((prev) => prev.filter((m) => m.id !== id));
          setConfirmModal({ isOpen: false, memberId: null, memberName: '' });
          toast.success("Xóa thành viên thành công!", {
            position: "top-center",
            autoClose: 2000,
          });
        }, 2000);
      })
      .catch((err) => {
        setTimeout(() => {
          setIsLoading(false);
          console.error("Lỗi khi xóa:", err);
          toast.error("Không thể xóa thành viên!", {
            position: "top-right",
            autoClose: 2000,
          });
          setConfirmModal({ isOpen: false, memberId: null, memberName: '' });
        }, 2000);
      });
  }

  function openModal(member = null) {
    if (member) {
      setEditing(member);
      setForm({
        name: member.name,
        age: member.age || "",
        gender: member.gender || "",
        heightCm: member.heightCm || "",
        weightKg: member.weightKg || "",
        activityLevel: member.activityLevel || "",
        tastePreferences: member.tastePreferences || "",
        healthConditions: member.healthConditions || "",
        allergyIds: member.allergies ? member.allergies.map((a) => a.id) : [],
      });
    } else {
      setEditing(null);
      setForm({
        name: "",
        age: "",
        gender: "",
        heightCm: "",
        weightKg: "",
        activityLevel: "",
        tastePreferences: "",
        healthConditions: "",
        allergyIds: [],
      });
    }
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setEditing(null);
    setShowAllergies(false);
  }

  // Calculate stats
  const totalMembers = members.length;
  const avgAge = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + (m.age || 0), 0) / members.length)
    : 0;
  const withGoals = members.filter(m => m.healthGoals).length;

  return (
    <div className="family-profiles-wrap">
      <ToastContainer />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Xóa thành viên"
        message={`Bạn có chắc chắn muốn xóa thành viên "${confirmModal.memberName}" không? Hành động này không thể hoàn tác.`}
        isLoading={isLoading}
      />


      {/* Two Column Layout */}
      <div className="family-profile-layout">
        {/* LEFT: Edit Profile */}
        <div className="left-section">
          <EditProfile />
        </div>

        {/* RIGHT: Family Members */}
        <div className="right-section">
          <div className="members-header">
            <div className="header-content">
              <h2>
                <Users size={24} className="header-icon" />
                Family Members
              </h2>
              <p className="muted">Quản lý thông tin gia đình</p>
            </div>
            <button className="btn primary" onClick={() => openModal()}>
              <PlusCircle size={16} /> Add Member
            </button>
          </div>

          <div className="members-list">
            {members.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>Chưa có thành viên nào</h3>
                <p>Thêm thành viên gia đình để bắt đầu</p>
                <button className="btn primary" onClick={() => openModal()}>
                  <PlusCircle size={16} /> Thêm thành viên đầu tiên
                </button>
              </div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="member-card">
                  <div className="card-top">
                    <div className="avatar">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="meta">
                      <h4>{m.name}</h4>
                      <div className="sub-info">
                        {m.age && <span className="age-badge">{m.age} tuổi</span>}
                        {m.gender && (
                          <span className="age-badge">
                            {m.gender === "MALE"
                              ? "Nam"
                              : m.gender === "FEMALE"
                                ? "Nữ"
                                : "Khác"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        type="button"
                        className="btn ghost"
                        title="Chỉnh sửa"
                        onClick={() => openModal(m)}
                      >
                        <Pen size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn danger"
                        title="Xóa"
                        onClick={() => handleDeleteClick(m)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    {(m.gender || m.heightCm || m.weightKg) && (
                      <div className="info-row">
                        <div className="info-icon">
                          <Activity size={14} />
                        </div>
                        <div className="info-text">
                          {m.gender && <span>Giới tính: <strong>{m.gender === 'MALE' ? 'Nam' : m.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</strong></span>}
                          {m.heightCm && <span> • Cao: <strong>{m.heightCm}cm</strong></span>}
                          {m.weightKg && <span> • Nặng: <strong>{m.weightKg}kg</strong></span>}
                        </div>
                      </div>
                    )}

                    {m.healthConditions && (
                      <div className="info-row">
                        <div className="info-icon">
                          <Heart size={14} />
                        </div>
                        <div className="info-text">
                          <strong>Sức khỏe:</strong> {m.healthConditions}
                        </div>
                      </div>
                    )}

                    {m.tastePreferences && (
                      <div className="info-row">
                        <div className="info-icon">
                          <Target size={14} />
                        </div>
                        <div className="info-text">
                          <strong>Sở thích:</strong> {m.tastePreferences}
                        </div>
                      </div>
                    )}

                    {!m.healthConditions && !m.tastePreferences && !m.gender && (!m.allergies || m.allergies.length === 0) && (
                      <p className="no-info">Chưa có thông tin bổ sung</p>
                    )}

                    {m.allergies && m.allergies.length > 0 && (
                      <div className="section">
                        <div className="section-title">Nguyên liệu dị ứng:</div>
                        <div className="chips">
                          {m.allergies.map((algo) => (
                            <span key={algo.id} className="chip danger">
                              {algo.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Member */}
      {
        isOpen && (
          <div className={`modal-overlay ${isOpen ? "active" : ""}`}>
            <div className="modal">
              {isLoading && (
                <div className="loading-overlay" style={{ position: 'absolute', zIndex: 9999 }}>
                  <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    style={{ width: 150, height: 150 }}
                  />
                  <p>Đang xử lý...</p>
                </div>
              )}

              <div className="modal-header">
                <h3>
                  {editing ? "✏️ Chỉnh sửa thành viên" : "➕ Thêm thành viên mới"}
                </h3>
                <button className="icon-btn close-btn" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <form
                className="modal-form"
                onSubmit={editing ? handleEditSubmit : handleAdd}
              >
                <label>
                  Tên thành viên
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Tuổi
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="25"
                    />
                  </label>
                  <label>
                    Giới tính
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      style={{ color: "black" }}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Chiều cao (cm)
                    <input
                      type="number"
                      step="0.1"
                      name="heightCm"
                      value={form.heightCm}
                      onChange={handleChange}
                      placeholder="170"
                    />
                  </label>
                  <label>
                    Cân nặng (kg)
                    <input
                      type="number"
                      step="0.1"
                      name="weightKg"
                      value={form.weightKg}
                      onChange={handleChange}
                      placeholder="65"
                    />
                  </label>
                </div>

                <label>
                  Mức độ hoạt động
                  <select
                    name="activityLevel"
                    value={form.activityLevel}
                    onChange={handleChange}
                    style={{ color: "black" }}
                  >
                    <option value="">-- Chọn mức độ --</option>
                    <option value="SEDENTARY">Ít vận động</option>
                    <option value="LIGHT">Vận động nhẹ</option>
                    <option value="MODERATE">Vận động vừa phải</option>
                    <option value="ACTIVE">Năng động</option>
                  </select>
                </label>

                <label>
                  Sở thích ẩm thực
                  <input
                    type="text"
                    name="tastePreferences"
                    value={form.tastePreferences}
                    onChange={handleChange}
                    placeholder="Thích ăn cay, ngọt..."
                  />
                </label>

                <label>
                  Tình trạng sức khỏe
                  <textarea
                    name="healthConditions"
                    value={form.healthConditions}
                    onChange={handleChange}
                    placeholder="Tiểu đường, cao huyết áp..."
                  />
                </label>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Nguyên liệu dị ứng</label>
                  <div className="custom-combobox">
                    <div
                      className="combobox-trigger"
                      onClick={() => setShowAllergies(!showAllergies)}
                    >
                      {form.allergyIds && form.allergyIds.length > 0
                        ? `Đã chọn ${form.allergyIds.length} nguyên liệu dị ứng`
                        : "-- Chọn nguyên liệu dị ứng --"}
                      <ChevronDown size={16} />
                    </div>
                    {showAllergies && (
                      <div className="combobox-options">
                        {allAllergies.map((allergy) => (
                          <label key={allergy.id} className="checkbox-option">
                            <input
                              type="checkbox"
                              checked={form.allergyIds?.includes(allergy.id)}
                              onChange={() => handleAllergyToggle(allergy.id)}
                            />
                            {allergy.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={closeModal}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn primary">
                    {editing ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}
