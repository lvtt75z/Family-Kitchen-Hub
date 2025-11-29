// ...existing code...
import React from "react";
import DashboardSidebar from "../layouts/dashboardSidebar";

import { Outlet } from "react-router-dom";
import "../styles/ManagesLayout.css"; // Thêm dòng này

const ManageLayouts = () => {
  return (
    <div className="manage-layout-root">
   

      <div className="manage-layout-flex">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <main className="manage-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManageLayouts;