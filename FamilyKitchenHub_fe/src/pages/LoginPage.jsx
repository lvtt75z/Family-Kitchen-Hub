import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/cooking animation.json"; // 👈 file animation JSON
import "../styles/LoginForm.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    setIsLoading(true); // bật loading

    // Giả lập login API delay
    setTimeout(() => {
      setIsLoading(false);
      navigate("/home"); // 👈 chuyển hướng sang trang home
    }, 2000); // 2 giây loading
  };

  return (
    <AuthLayout>
      {isLoading ? (
        <div className="loading-overlay">
          <Lottie animationData={loadingAnimation} loop={true} style={{ width: 150, height: 150 }} />
          <p>Signing in...</p>
        </div>
      ) : (
        <>
          <div className="tab-buttons">
            <Link to="/login" className="active">
              Sign In
            </Link>
            <Link to="/register">Sign Up</Link>
          </div>

          <h2>Sign In</h2>
          <p>Enter your email and password to access your account</p>

          <form className="form" onSubmit={handleLogin}>
            <label>Email</label>
            <div className="input-box">
              <input type="email" placeholder="Enter your email" />
            </div>

            <label>Password</label>
            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </span>
            </div>

            <button type="submit" className="sign-in-btn">
              Sign In
            </button>
          </form>

          <div className="divider">OR</div>
          <button className="demo-btn">Try Demo Account</button>
          <a href="#" className="forgot">
            Forgot your password?
          </a>
          <p className="signup-link">
            Don't have an account?{" "}
            <Link to="/register">
              Sign up here
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
