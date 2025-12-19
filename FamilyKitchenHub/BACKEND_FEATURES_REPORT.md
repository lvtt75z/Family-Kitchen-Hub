# Báo Cáo Tính Năng Backend - Family Kitchen Hub

## 📋 Tổng Quan

Các tính năng đã được triển khai:

- **7.1** Hệ thống gắn tag cho nguyên liệu
- **7.2** Gợi ý món ăn tương tự
- **7.6** Quản lý phân loại món ăn
- **7.7** Lịch nấu ăn & Nhắc nhở với Email tự động

---

## 🏷️ 7.1 Hệ Thống Tag Nguyên Liệu

### Cơ Sở Dữ Liệu

#### Bảng `tags`
Lưu trữ các tag như "cay", "healthy", "gluten-free"

#### Bảng `ingredient_tags`
Liên kết giữa nguyên liệu và tag

### API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/tags` | Lấy tất cả các tag |
| GET | `/api/tags?type=NUTRITION` | Lọc tag theo loại (NUTRITION, CATEGORY, PRESERVATIVE, USAGE) |
| GET | `/api/tags/search?query=spicy` | Tìm kiếm tag theo tên |
| GET | `/api/tags/{id}` | Lấy thông tin 1 tag cụ thể |
| POST | `/api/tags` | Tạo tag mới |
| PUT | `/api/tags/{id}` | Cập nhật tag |
| DELETE | `/api/tags/{id}` | Xóa tag |
| GET | `/api/ingredients/with-tags` | Lấy tất cả nguyên liệu kèm tag |
| GET | `/api/ingredients/{id}/tags` | Lấy tag của 1 nguyên liệu |
| POST | `/api/ingredients/{id}/tags` | Gắn tag cho nguyên liệu |
| DELETE | `/api/ingredients/{ingredientId}/tags/{tagId}` | Bỏ tag khỏi nguyên liệu |

---

## 🔍 7.2 Gợi Ý Món Ăn Tương Tự

### Thuật Toán
Tính điểm tương đồng dựa trên: nguyên liệu chung (40%), tag chung (30%), cùng loại món (30%)

### API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/recipes/{id}/similar` | Lấy 5 món tương tự nhất |
| GET | `/api/recipes/{id}/similar-all` | Lấy tất cả món tương tự (không giới hạn) |

---

## 📂 7.6 Phân Loại Món Ăn

### Cơ Sở Dữ Liệu

#### Bảng `recipe_categories`
Danh mục phân cấp (ví dụ: Món Việt → Món Nước → Phở)

#### Bảng `recipe_category_map`
Liên kết công thức với danh mục

### API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/recipe-categories` | Lấy cây danh mục phân cấp |
| GET | `/api/recipe-categories/{id}/recipes` | Duyệt món ăn theo danh mục |
| GET | `/api/recipes/{id}/categories` | Lấy danh mục của 1 món |
| POST | `/api/recipes/{id}/categories` | Gán danh mục cho món (yêu cầu ít nhất 1 danh mục) |

---

## 📅 7.7 Lịch Nấu Ăn & Nhắc Nhở

### Cơ Sở Dữ Liệu

#### Bảng `recipe_schedules`
Định nghĩa thời điểm phù hợp để nấu món (mùa, thời tiết, dịp)

#### Bảng `user_recipe_reminders`
Lịch nhắc cá nhân của người dùng

### API - Recipe Schedules

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/recipes/{id}/schedule` | Đặt lịch nấu cho món (mùa, dịp, thời tiết) |
| GET | `/api/recipes/{id}/schedule` | Xem thông tin lịch của món |
| DELETE | `/api/recipes/{id}/schedule` | Xóa lịch của món |
| GET | `/api/recipes/season/{season}` | Tìm món theo mùa (SPRING, SUMMER, FALL, WINTER) |
| GET | `/api/recipes/occasion?q=birthday` | Tìm món theo dịp (sinh nhật, Tết...) |

### API - User Reminders

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/users/{userId}/reminders` | Tạo lời nhắc nấu món |
| GET | `/api/users/{userId}/reminders` | Xem tất cả lời nhắc |
| GET | `/api/users/{userId}/reminders/upcoming` | Xem lời nhắc sắp tới |
| GET | `/api/users/{userId}/reminders/past` | Xem lời nhắc đã qua |
| GET | `/api/users/{userId}/reminders/unread` | Lấy thông báo chưa đọc |
| PUT | `/api/users/{userId}/reminders/{id}` | Cập nhật lời nhắc |
| PATCH | `/api/users/{userId}/reminders/{id}/read` | Đánh dấu đã đọc |
| DELETE | `/api/users/{userId}/reminders/{id}` | Xóa lời nhắc |

---

## 📧 Hệ Thống Email Tự Động

### 1. Email Nhắc Nấu Món (Cá Nhân)

**Kích hoạt:** Mỗi 5 phút kiểm tra lời nhắc đến hạn

**Nội dung email:**
- 🍳 Tên món ăn
- ⏰ Thời gian đã đặt
- 📝 Ghi chú cá nhân
- 📖 **Công thức nấu đầy đủ**
- ✅ Nguyên liệu bạn có (màu xanh)
- ⚠️ Nguyên liệu còn thiếu (màu cam)

**Tối ưu bộ nhớ:** Xử lý 50 lời nhắc/lần, giảm 95% memory cho server < 3GB RAM

### 2. Email Gợi Ý Món Theo Mùa (Hàng Tháng)

**Kích hoạt:** 9h sáng ngày 1 mỗi tháng

**Nội dung email:**
- 🌸☀️🍂❄️ Gợi ý 5 món phù hợp với mùa hiện tại
- Hiển thị nguyên liệu có/thiếu cho từng món
- Nút "Xem Công Thức" cho mỗi món

**Phân mùa Việt Nam:**
- Xuân: Tháng 1-4
- Hạ: Tháng 5-8
- Thu: Tháng 9-10
- Đông: Tháng 11-12

---

## 📊 Thống Kê Tổng Quan

### Cơ Sở Dữ Liệu
- **6 bảng mới:** tags, ingredient_tags, recipe_categories, recipe_category_map, recipe_schedules, user_recipe_reminders
- **Dữ liệu mẫu:** 5 dòng/bảng

### API
- **30+ endpoints** cho 4 tính năng chính
- Hỗ trợ đầy đủ CRUD operations

### Background Jobs
- **ReminderScheduler:** Chạy mỗi 5 phút
- **SeasonalNewsletterScheduler:** Chạy hàng tháng

### Email Templates
- 2 mẫu email với thiết kế xanh lá nhạt
- Responsive, hỗ trợ mobile

---

## 🚀 Điểm Nổi Bật

1. **Tối ưu bộ nhớ:** Batch processing cho server RAM thấp
2. **JOIN FETCH:** Tránh N+1 query problem
3. **Phân cấp:** Hỗ trợ danh mục lồng nhau
4. **Gợi ý thông minh:** Tính điểm tương đồng đa yếu tố
5. **Mùa Việt Nam:** Điều chỉnh theo khí hậu Việt
6. **Kiểm tra kho:** Tích hợp realtime với inventory

---

**File SQL với dữ liệu mẫu:** `DATABASE_SCHEMA.sql`

**Công nghệ:** Java Spring Boot, MySQL, JavaMailSender, Hibernate JPA
