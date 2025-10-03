import React from "react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Cột 1 - Logo và mô tả */}
        <div className="footer-col">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 11c0-1.657 1.343-3 3-3h4c1.657 0 3 1.343 3 3v1H7v-1z"
                  fill="#E76F00"
                />
                <path
                  d="M6 12h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"
                  fill="#F7F7F7"
                  stroke="#E0E0E0"
                />
                <path
                  d="M7 11V10a5 5 0 0 1 10 0v1"
                  stroke="#E76F00"
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              </svg>
            </div>
            <h3>Family Menu Manager</h3>
          </div>
          <p className="footer-desc">
            Helping families eat healthier, one meal at a time. Join thousands of
            families planning better meals together.
          </p>
          <div className="footer-icons">
            <button className="icon-btn" aria-label="Website">
              🌐
            </button>
            <button className="icon-btn" aria-label="Mobile App">
              📱
            </button>
          </div>
        </div>

        {/* Cột 2 - Features */}
        <div className="footer-col">
          <h4>Features</h4>
          <ul>
            <li>Meal Planning</li>
            <li>Recipe Management</li>
            <li>Fridge Tracking</li>
            <li>Shopping Lists</li>
            <li>Nutrition Analysis</li>
            <li>Family Profiles</li>
          </ul>
        </div>

        {/* Cột 3 - Support */}
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Cookie Policy</li>
            <li>GDPR</li>
          </ul>
        </div>

        {/* Cột 4 - Company */}
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Blog</li>
            <li>Careers</li>
            <li>Press Kit</li>
            <li>Investors</li>
            <li>Partners</li>
          </ul>
        </div>
      </div>

      <hr className="footer-line" />

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© 2024 Family Menu Manager. All rights reserved.</p>
        <div className="footer-tags">
          <span className="tag">SOC 2 Compliant</span>
          <span className="tag">GDPR Ready</span>
        </div>
      </div>
    </footer>
  );
}
