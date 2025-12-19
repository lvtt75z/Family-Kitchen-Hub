import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/cooking animation.json";
import "../styles/LoginForm.css";
import axios from "../hooks/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.repeatPassword)
      newErrors.repeatPassword = "Please confirm your password.";
    if (
      formData.password &&
      formData.repeatPassword &&
      formData.password !== formData.repeatPassword
    )
      newErrors.repeatPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await axios.post("/auth/register", formData);
      console.log("Register success:", res.data);

      //  Hiển thị toast đẹp thay vì alert
      toast.success("Registration successful! Redirecting to verify email...", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });

      //  Đợi 2 giây rồi điều hướng
      setTimeout(() => {
        navigate("/verify-email", { state: { email: formData.email } });
      }, 2000);

    } catch (err) {
      console.error("Register failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Registration failed!", {
        position: "top-center",
        autoClose: 2500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <ToastContainer /> {/*  Bắt buộc để hiện toast */}

      {isLoading ? (
        <div className="loading-overlay">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 150, height: 150 }}
          />
          <p>Creating your account...</p>
        </div>
      ) : (
        <>
          <div className="tab-buttons">
            <Link to="/login">Sign In</Link>
            <Link to="/register" className="active">
              Sign Up
            </Link>
          </div>

          <h2>Create Account</h2>
          <p>Fill in the details below to create your account</p>

          <form className="form" onSubmit={handleRegister}>
            <label style={{ fontWeight: "bold" }}>Full Name</label>
            <div className="input-box">
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}

            <label style={{ fontWeight: "bold" }}>Username</label>
            <div className="input-box">
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            {errors.username && <p className="error-text">{errors.username}</p>}

            <label style={{ fontWeight: "bold" }}>Email</label>
            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}

            <label style={{ fontWeight: "bold" }}>Password</label>
            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </span>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}

            <label style={{ fontWeight: "bold" }}>Repeat Password</label>
            <div className="input-box">
              <input
                type={showRepeatPassword ? "text" : "password"}
                name="repeatPassword"
                placeholder="Repeat your password"
                value={formData.repeatPassword}
                onChange={handleChange}
              />
              <span
                className="toggle"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              >
                👁
              </span>
            </div>
            {errors.repeatPassword && (
              <p className="error-text">{errors.repeatPassword}</p>
            )}

            <button type="submit" className="sign-in-btn">
              Create Account
            </button>
          </form>

          <p className="signup-link">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
