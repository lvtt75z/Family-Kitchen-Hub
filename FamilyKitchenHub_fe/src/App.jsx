import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Home from "./pages/Home";

import MainLayout from "./layouts/MainLayout";
import ManageLayouts from "./pages/ManagesLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Recipes from "./components/dashboard/Recipes";
import Fridge from "./components/dashboard/Fridge";
import DetailRecipes from "./components/dashboard/DetailRecipes";
import IngredientListScreen from "./components/IngredientListScreen";
import EditProfile from "./components/EditProfile";
import FamilyProfiles from "./components/dashboard/FamilyProfile";
import MealPlanner from "./components/dashboard/MealPlaner";
import SmartRecommendation from "./components/dashboard/SmartRecommendation";
import AddIngredientScreen from "./components/AddIngredientScreen";
import ScrollToTop from "./components/dashboard/ScrollToTop";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import TagsPage from "./pages/admin/TagsPage";
import IngredientsPage from "./pages/admin/IngredientsPage";
import RecipesPage from "./pages/admin/RecipesPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import AllergiesPage from "./pages/admin/AllergiesPage";
import UsersPage from "./pages/admin/UsersPage";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="test" element={<AddIngredientScreen />} />
        </Route>

        {/* ADMIN ROUTES (PROTECTED) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="ingredients" element={<IngredientsPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="allergies" element={<AllergiesPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>

        {/* MANAGE ROUTES (PROTECTED) */}
        <Route
          path="/manage"
          element={
            <ProtectedRoute>
              <ManageLayouts />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<IngredientListScreen />} />
          <Route path="fridge" element={<Fridge />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/:id" element={<DetailRecipes />} />
          <Route path="recipesdetails/:id" element={<DetailRecipes />} />
          <Route path="familyProfile" element={<FamilyProfiles />} />
          <Route path="mealPlaner" element={<MealPlanner />} />
          <Route path="editprofile" element={<EditProfile />} />
          <Route path="recommendations" element={<SmartRecommendation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
