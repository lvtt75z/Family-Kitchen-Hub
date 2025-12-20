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


  return (
    <div className="family-profiles-wrap">
      <ToastContainer />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete Member"
        message={`Are you sure you want to delete member "${confirmModal.memberName}"? This action cannot be undone.`}
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
              <p className="muted">Manage family information</p>
            </div>
            <button className="btn primary" onClick={() => openModal()}>
              <PlusCircle size={16} /> Add Member
            </button>
          </div>

          <div className="members-list">
            {members.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No members yet</h3>
                <p>Add family members to get started</p>
                <button className="btn primary" onClick={() => openModal()}>
                  <PlusCircle size={16} /> Add first member
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
                        {m.age && <span className="age-badge">{m.age} years old</span>}
                        {m.gender && (
                          <span className="age-badge">
                            {m.gender === "MALE"
                              ? "Male"
                              : m.gender === "FEMALE"
                                ? "Female"
                                : "Other"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        type="button"
                        className="btn ghost"
                        title="Edit"
                        onClick={() => openModal(m)}
                      >
                        <Pen size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn danger"
                        title="Delete"
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
                          {m.gender && <span>Gender: <strong>{m.gender === 'MALE' ? 'Male' : m.gender === 'FEMALE' ? 'Female' : 'Other'}</strong></span>}
                          {m.heightCm && <span> • Height: <strong>{m.heightCm}cm</strong></span>}
                          {m.weightKg && <span> • Weight: <strong>{m.weightKg}kg</strong></span>}
                        </div>
                      </div>
                    )}

                    {m.healthConditions && (
                      <div className="info-row">
                        <div className="info-icon">
                          <Heart size={14} />
                        </div>
                        <div className="info-text">
                          <strong>Health:</strong> {m.healthConditions}
                        </div>
                      </div>
                    )}

                    {m.tastePreferences && (
                      <div className="info-row">
                        <div className="info-icon">
                          <Target size={14} />
                        </div>
                        <div className="info-text">
                          <strong>Preferences:</strong> {m.tastePreferences}
                        </div>
                      </div>
                    )}

                    {!m.healthConditions && !m.tastePreferences && !m.gender && (!m.allergies || m.allergies.length === 0) && (
                      <p className="no-info">No additional information</p>
                    )}

                    {m.allergies && m.allergies.length > 0 && (
                      <div className="section">
                        <div className="section-title">Allergies:</div>
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
                  <p>Processing...</p>
                </div>
              )}

              <div className="modal-header">
                <h3>
                  {editing ? "✏️ Edit Member" : "➕ Add New Member"}
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
                  Member Name
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    required
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Age
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="25"
                    />
                  </label>
                  <label>
                    Gender
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      style={{ color: "black" }}
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Height (cm)
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
                    Weight (kg)
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
                  Activity Level
                  <select
                    name="activityLevel"
                    value={form.activityLevel}
                    onChange={handleChange}
                    style={{ color: "black" }}
                  >
                    <option value="">-- Select Activity Level --</option>
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHT">Light</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="ACTIVE">Active</option>
                  </select>
                </label>

                <label>
                  Taste Preferences
                  <input
                    type="text"
                    name="tastePreferences"
                    value={form.tastePreferences}
                    onChange={handleChange}
                    placeholder="e.g., spicy, sweet..."
                  />
                </label>

                <label>
                  Health Conditions
                  <textarea
                    name="healthConditions"
                    value={form.healthConditions}
                    onChange={handleChange}
                    placeholder="e.g., diabetes, hypertension..."
                  />
                </label>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Allergies</label>
                  <div className="custom-combobox">
                    <div
                      className="combobox-trigger"
                      onClick={() => setShowAllergies(!showAllergies)}
                    >
                      {form.allergyIds && form.allergyIds.length > 0
                        ? `${form.allergyIds.length} allergies selected`
                        : "-- Select Allergies --"}
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
                    Cancel
                  </button>
                  <button type="submit" className="btn primary">
                    {editing ? "Update" : "Add New"}
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
