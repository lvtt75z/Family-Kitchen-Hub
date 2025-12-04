import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import ManageLayouts from "./pages/ManagesLayout";
import Recipes from "./components/dashboard/Recipes";
import Fridge from "./components/dashboard/Fridge";
import DetailRecipes from "./components/dashboard/DetailRecipes";
import "./App.css";
import IngredientListScreen from "./components/IngredientListScreen";
import EditProfile from "./components/EditProfile";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmail";
import FamilyProfiles from "./components/dashboard/FamilyProfile";
import MealPlanner from "./components/dashboard/MealPlaner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Test from"./layouts/header";
import AddIngredientScreen from "./components/AddIngredientScreen";
function App() {  
  return (
    <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        
        {/* Dùng MainLayout làm layout chính */}
        <Route path="/" element={<MainLayout />}>
          {/* Các trang con hiển thị trong <Outlet /> */}
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage/>} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="test" element={<AddIngredientScreen />} />
        </Route>
        {/* Dùng ManageLayouts cho các trang quản lý */}
        <Route path="/manage/*" element={<ManageLayouts />}>
          {/* Các trang con quản lý */}
          <Route path="Dashboard" element={<IngredientListScreen />} />
          <Route path="fridge" element={<Fridge />} />
          <Route path="recipes" element={<Recipes/>} />
          <Route path="recipes/:id" element={<DetailRecipes />} />
          {/* Alias cho trang chi tiết: /manage/recipesdetails/:id */}
          <Route path="recipesdetails/:id" element={<DetailRecipes />} />
          <Route path="familyProfile" element={<FamilyProfiles/>} />
           <Route path="mealPlaner" element={<MealPlanner/>} />
          <Route path="editprofile" element={<EditProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
