import React from "react";
import Header from "./header";
import Footer from "./footer";
import { Outlet } from "react-router-dom";
import "../styles/MainLayout.css"; // nhớ tạo file CSS
import Dashboard from "../layouts/dashboardSidebar";
function MainLayout() {
  return (
    <div className="main-layout">
      <Dashboard />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
