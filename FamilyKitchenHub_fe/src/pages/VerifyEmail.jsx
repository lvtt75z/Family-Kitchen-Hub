import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../hooks/axios";
import "../styles/LoginForm.css";

export default function VerifyEmail() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Tự động nhảy qua ô kế tiếp
      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      return alert("Please enter the full 6-digit OTP code.");
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/auth/verify-email", { email, otpCode });
      alert("Email verified successfully!");
      console.log(res.data);
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Verification failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("/auth/resend-otp", { email });
      alert("OTP has been resent to your email!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Email Verification</h2>
      <p>
        Enter the 6-digit OTP sent to <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerify} className="otp-form">
        <div className="otp-box">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="otp-input-box"
            />
          ))}
        </div>

        <button type="submit" className="verify-email-btn" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <p className="signup-link">
        Didn’t get the code?{" "}
        <button onClick={handleResend} className="resend-btn">
          Resend OTP
        </button>
      </p>
    </div>
  );
}
