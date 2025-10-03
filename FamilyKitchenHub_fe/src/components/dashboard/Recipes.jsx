import React from "react";
import "./../../styles/Recipes.css";
import {
  Heart,
  HeartOff,
  Trash2,
  Clock,
  Users,
  ChefHat,
  Tags,
} from "lucide-react";

export default function RecipeDashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Recipe Collection</h1>
        <p>Organize and discover new recipes for your family.</p>
        <h2>Quản lý Công thức</h2>
        <p className="subtext">Lưu trữ và quản lý các công thức nấu ăn yêu thích.</p>
      </header>

      <div className="dashboard-controls">
        <input type="text" placeholder="Tìm kiếm công thức..." />
        <select>
          <option>Tất cả danh mục</option>
          <option>Món chính</option>
          <option>Món phụ</option>
        </select>
        <button className="add-btn">+ Thêm công thức</button>
      </div>

      <div className="dashboard-tabs">
        <span className="tab active">Tất cả (2)</span>
        <span className="tab">Yêu thích (1)</span>
      </div>

      <div className="recipe-list">
        <div className="recipe-card">
          <div className="card-header">
            <h3>Chicken Pho</h3>
            <Heart color="red" size={18} />
          </div>
          <p>Traditional chicken pho with clear, aromatic broth</p>
          <div className="card-info">
            <span>Main Course</span>
            <span>Medium</span>
            <Clock size={16} /> <span>30 phút</span>
            <Users size={16} /> <span>4 người</span>
            <ChefHat size={16} /> <span>250 cal</span>
          </div>
          <div className="card-tags">
            <Tags size={16} />
            <span>#healthy</span>
            <span>#comfort-food</span>
          </div>
        </div>

        <div className="recipe-card">
          <div className="card-header">
            <h3>Yang Chow Fried Rice</h3>
            <HeartOff size={18} />
            <Trash2 color="red" size={18} />
          </div>
          <p>Mixed fried rice with shrimp, sausage and vegetables</p>
          <div className="card-info">
            <span>Main Course</span>
            <span>Easy</span>
            <Clock size={16} /> <span>30 phút</span>
            <Users size={16} /> <span>4 người</span>
            <ChefHat size={16} /> <span>280 cal</span>
          </div>
          <div className="card-tags">
            <Tags size={16} />
            <span>#quick</span>
            <span>#easy</span>
            <span>#comfort-food</span>
          </div>
        </div>
      </div>
    </div>
  );
}
