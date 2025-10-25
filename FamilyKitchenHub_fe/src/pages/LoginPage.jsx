import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/cooking animation.json";
import "../styles/LoginForm.css";
import axios from "../hooks/axios";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/auth/login", {
        usernameOrEmail: email,
        password: password,
      });

      console.log(" Login success:", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed, please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {isLoading ? (
        <div className="loading-overlay">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 150, height: 150 }}
          />
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
            <label>Email or Username</label>
            <div className="input-box">
              <input
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label>Password</label>
            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
