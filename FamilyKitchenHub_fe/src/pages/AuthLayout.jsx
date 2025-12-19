import React from "react";
import "../styles/AuthLayout.css";
import { CheckCircle, Lock, Users } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {/* LEFT SIDE */}
      <div className="auth-layout__left">
        <button className="auth-layout__join-btn">Join Our Community</button>
        <h1 className="auth-layout__title">
          Start managing your family's <br /> meals today
        </h1>
        <p className="auth-layout__subtitle">
          Join thousands of families who have transformed their eating habits
          with our smart meal planning platform.
        </p>

        {/* Feature 1 */}
        <div className="auth-layout__feature">
          <span className="auth-layout__icon auth-layout__icon--green">
            <CheckCircle size={20} strokeWidth={2.5} />
          </span>
          <div>
            <strong className="auth-layout__feature-title">Free to Start</strong>
            <p className="auth-layout__feature-desc">
              No credit card required, cancel anytime
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="auth-layout__feature">
          <span className="auth-layout__icon auth-layout__icon--blue">
            <Lock size={20} strokeWidth={2.5} />
          </span>
          <div>
            <strong className="auth-layout__feature-title">Secure & Private</strong>
            <p className="auth-layout__feature-desc">
              Your family data is protected and encrypted
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="auth-layout__feature">
          <span className="auth-layout__icon auth-layout__icon--yellow">
            <Users size={20} strokeWidth={2.5} />
          </span>
          <div>
            <strong className="auth-layout__feature-title">Family Friendly</strong>
            <p className="auth-layout__feature-desc">
              Designed for families of all sizes
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="auth-layout__right">{children}</div>
    </div>
  );
}
