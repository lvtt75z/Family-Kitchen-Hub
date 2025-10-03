import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import ManageLayouts from "./pages/ManagesLayout";
import Recipes from "./components/dashboard/Recipes";
import Fridge from "./components/dashboard/Fridge";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dùng MainLayout làm layout chính */}
        <Route path="/" element={<MainLayout />}>
          {/* Các trang con hiển thị trong <Outlet /> */}
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
        {/* Dùng ManageLayouts cho các trang quản lý */}
        <Route path="/manage/*" element={<ManageLayouts />}>
          {/* Các trang con quản lý */}
          {/* <Route path='/' index element={<div>Manage Dashboard</div>} /> */}
          <Route path="fridge" element={<Fridge />} />
          <Route path="recipes" element={<Recipes/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
