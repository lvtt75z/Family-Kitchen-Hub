import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/cooking animation.json";
import "../styles/LoginForm.css";
import axios from "../hooks/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Email, 2: Reset Password
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await axios.post("/auth/forgot-password", {
                email: email,
            });

            console.log("Forgot password success:", res.data);

            // Show loading animation for 3 seconds
            setTimeout(() => {
                setIsLoading(false);
                toast.success(res.data.message || "Reset token sent to your email!", {
                    position: "top-center",
                    autoClose: 2000,
                });

                // Move to step 2 after showing toast
                setTimeout(() => {
                    setStep(2);
                }, 2000);
            }, 3000);
        } catch (err) {
            console.error("Forgot password failed:", err.response?.data || err.message);

            setTimeout(() => {
                setIsLoading(false);
                toast.error(
                    err.response?.data?.message || "Failed to send reset token. Please try again!",
                    {
                        position: "top-right",
                        autoClose: 3000,
                    }
                );
            }, 3000);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (newPassword !== repeatPassword) {
            toast.error("Passwords do not match!", {
                position: "top-right",
                autoClose: 2000,
            });
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters!", {
                position: "top-right",
                autoClose: 2000,
            });
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.post("/auth/reset-password", {
                resetToken: resetToken,
                newPassword: newPassword,
                repeatPassword: repeatPassword,
            });

            console.log("Reset password success:", res.data);

            // Show loading animation for 3 seconds
            setTimeout(() => {
                setIsLoading(false);
                toast.success(res.data.message || "Password reset successfully!", {
                    position: "top-center",
                    autoClose: 2000,
                });

                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }, 3000);
        } catch (err) {
            console.error("Reset password failed:", err.response?.data || err.message);

            setTimeout(() => {
                setIsLoading(false);
                toast.error(
                    err.response?.data?.message || "Failed to reset password. Please try again!",
                    {
                        position: "top-right",
                        autoClose: 3000,
                    }
                );
            }, 3000);
        }
    };

    return (
        <AuthLayout>
            <ToastContainer />
            {isLoading ? (
                <div className="loading-overlay">
                    <Lottie
                        animationData={loadingAnimation}
                        loop={true}
                        style={{ width: 150, height: 150 }}
                    />
                    <p>{step === 1 ? "Sending reset token..." : "Resetting password..."}</p>
                </div>
            ) : (
                <>
                    {step === 1 ? (
                        // Step 1: Enter Email
                        <>
                            <div className="tab-buttons">
                                <Link to="/login">Sign In</Link>
                                <Link to="/register">Sign Up</Link>
                            </div>

                            <h2>Forgot Password</h2>
                            <p>Enter your email address and we'll send you a reset token</p>

                            <form className="form" onSubmit={handleForgotPassword}>
                                <label>Email</label>
                                <div className="input-box">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="sign-in-btn">
                                    Send Reset Token
                                </button>
                            </form>

                            <p className="signup-link" style={{ marginTop: "20px" }}>
                                Remember your password? <Link to="/login">Sign in here</Link>
                            </p>
                        </>
                    ) : (
                        // Step 2: Reset Password
                        <>
                            <div className="tab-buttons">
                                <Link to="/login">Sign In</Link>
                                <Link to="/register">Sign Up</Link>
                            </div>

                            <h2>Reset Password</h2>
                            <p>Enter the token from your email and your new password</p>

                            <form className="form" onSubmit={handleResetPassword}>
                                <label>Reset Token</label>
                                <div className="input-box">
                                    <input
                                        type="text"
                                        placeholder="Enter reset token from email"
                                        value={resetToken}
                                        onChange={(e) => setResetToken(e.target.value)}
                                        required
                                    />
                                </div>

                                <label>New Password</label>
                                <div className="input-box">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <span
                                        className="toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        👁
                                    </span>
                                </div>

                                <label>Repeat New Password</label>
                                <div className="input-box">
                                    <input
                                        type={showRepeatPassword ? "text" : "password"}
                                        placeholder="Repeat new password"
                                        value={repeatPassword}
                                        onChange={(e) => setRepeatPassword(e.target.value)}
                                        required
                                    />
                                    <span
                                        className="toggle"
                                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                    >
                                        👁
                                    </span>
                                </div>

                                <button type="submit" className="sign-in-btn">
                                    Reset Password
                                </button>
                            </form>

                            <p className="signup-link" style={{ marginTop: "20px" }}>
                                Didn't receive token?{" "}
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setStep(1);
                                        setResetToken("");
                                        setNewPassword("");
                                        setRepeatPassword("");
                                    }}
                                    style={{ color: "#c2410c", fontWeight: 600, textDecoration: "none" }}
                                >
                                    Resend
                                </a>
                            </p>
                        </>
                    )}
                </>
            )}
        </AuthLayout>
    );
}
