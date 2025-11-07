import React, { useEffect, useState } from "react";
import axios from "../../hooks/axios";
import "./../../styles/FamilyProfile.css";
import { Pen, Trash2, PlusCircle } from "lucide-react";

export default function FamilyProfiles() {
  const [members, setMembers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    healthGoals: "",
    notes: "",
  });

  // Fetch API thật khi load trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Chưa có token, vui lòng đăng nhập!");
      return;
    }

    axios
      .get("/family-members", {
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
  }, []);

  // Form handler
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleAdd(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Chưa đăng nhập!");
    const user = JSON.parse(localStorage.getItem("user"));

    const payload = {
      userId: user?.id,
      name: form.name,
      age: parseInt(form.age) || null,
      healthGoals: form.healthGoals,
      notes: form.notes,
      allergies: [],
    };

    axios
      .post("/family-members", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMembers((prev) => [...prev, res.data]);
        closeModal();
      })
      .catch((err) => {
        console.error("Lỗi khi thêm thành viên:", err);
        alert("Không thể thêm thành viên!");
      });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Chưa đăng nhập!");

    const payload = {
      name: form.name,
      age: parseInt(form.age) || null,
      healthGoals: form.healthGoals,
      notes: form.notes,
    };

    axios
      .put(`/family-members/${editing.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMembers((prev) =>
          prev.map((m) => (m.id === editing.id ? res.data : m))
        );
        closeModal();
      })
      .catch((err) => {
        console.error("Lỗi khi cập nhật:", err);
        alert("Không thể cập nhật thành viên!");
      });
  }

  function handleDelete(id) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Chưa đăng nhập!");

    if (!window.confirm("Xóa thành viên này?")) return;
    axios
      .delete(`/family-members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setMembers((prev) => prev.filter((m) => m.id !== id)))
      .catch((err) => {
        console.error("Lỗi khi xóa:", err);
        alert("Không thể xóa!");
      });
  }

  function openModal(member = null) {
    if (member) {
      setEditing(member);
      setForm({
        name: member.name,
        age: member.age || "",
        healthGoals: member.healthGoals || "",
        notes: member.notes || "",
      });
    } else {
      setEditing(null);
      setForm({ name: "", age: "", healthGoals: "", notes: "" });
    }
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setEditing(null);
  }

  return (
    <div className="family-profiles-wrap">
      <div className="profiles-header">
        <div>
          <h1>Family Members</h1>
          <p className="muted">Manage your family members' info</p>
        </div>
        <button className="btn primary" onClick={() => openModal()}>
          <PlusCircle size={16} /> Add Member
        </button>
      </div>

      <div className="cards-grid">
        {members.length === 0 ? (
          <div className="empty">No family members yet.</div>
        ) : (
          members.map((m) => (
            <div key={m.id} className="profile-card">
              <div className="card-top">
                <div className="avatar">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="meta">
                  <h3>{m.name}</h3>
                  <p className="sub">
                    {m.age ? `${m.age} tuổi` : "—"} • {m.userName}
                  </p>
                </div>
                <div className="actions">
                  <button
                    onClick={() => openModal(m)}
                    className="icon-btn edit"
                  >
                    <Pen size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="icon-btn delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-body">
                <p>
                  <strong>Mục tiêu sức khỏe:</strong>{" "}
                  {m.healthGoals || "Không có"}
                </p>
                <p>
                  <strong>Ghi chú:</strong> {m.notes || "Không có"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className={`modal-overlay ${isOpen ? "active" : ""}`}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? "Edit Member" : "Add Member"}</h3>
              <button className="icon-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form
              className="modal-form"
              onSubmit={editing ? handleEditSubmit : handleAdd}
            >
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Huy Vo"
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
                    placeholder="e.g. 25"
                  />
                </label>
                <label>
                  Health Goals
                  <input
                    type="text"
                    name="healthGoals"
                    value={form.healthGoals}
                    onChange={handleChange}
                    placeholder="e.g. Lose weight"
                  />
                </label>
              </div>

              <label>
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="e.g. Allergic to dairy"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  {editing ? "Update Member" : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
