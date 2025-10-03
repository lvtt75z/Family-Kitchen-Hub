import React from "react";
import Header from "./header";
import Footer from "./footer";
import { Outlet } from "react-router-dom";
import "../styles/MainLayout.css"; // nhớ tạo file CSS

function MainLayout() {
  return (
    <div className="main-layout">
      <Header />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
