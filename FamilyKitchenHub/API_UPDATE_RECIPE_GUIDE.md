# Hướng Dẫn API Update Recipe

## 1. Update Recipe Cơ Bản - `PUT /api/recipes/{id}`

### Request
- **Method:** `PUT`
- **URL:** `http://localhost:8080/api/recipes/{id}`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (nếu cần authentication)

### Body (JSON)
```json
{
  "title": "Cơm Gà Nướng",
  "instructions": "Nướng gà trong 30 phút ở nhiệt độ 200 độ C",
  "cookingTimeMinutes": 30,
  "servings": 4,
  "imageUrl": "/media/image.jpg",
  "mealType": "DINNER",
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 500,
      "unit": "gram"
    },
    {
      "ingredientId": 2,
      "quantity": 2,
      "unit": "cái"
    }
  ]
}
```

### Ví dụ Response (200 OK)
```json
{
  "id": 1,
  "title": "Cơm Gà Nướng",
  "description": null,
  "instructions": "Nướng gà trong 30 phút ở nhiệt độ 200 độ C",
  "cookingTimeMinutes": 30,
  "servings": 4,
  "totalCalories": null,
  "imageUrl": "/media/image.jpg",
  "imageUrls": [],
  "difficultyLevel": null,
  "mealType": "DINNER",
  "ingredients": [
    {
      "ingredientId": 1,
      "ingredientName": "Gà",
      "quantity": 500,
      "unit": "gram"
    },
    {
      "ingredientId": 2,
      "ingredientName": "Trứng",
      "quantity": 2,
      "unit": "cái"
    }
  ]
}
```

---

## 2. Partial Update Recipe - `PATCH /api/recipes/{id}`

### Request
- **Method:** `PATCH`
- **URL:** `http://localhost:8080/api/recipes/{id}`
- **Headers:**
  - `Content-Type: application/json`

### Body (JSON) - Chỉ gửi các field cần update
```json
{
  "title": "Cơm Gà Nướng Mới",
  "cookingTimeMinutes": 35
}
```

**Lưu ý:** Chỉ các field được gửi sẽ được cập nhật, các field khác giữ nguyên.

### Ví dụ Response (200 OK)
```json
{
  "id": 1,
  "title": "Cơm Gà Nướng Mới",
  "instructions": "Nướng gà trong 30 phút ở nhiệt độ 200 độ C",
  "cookingTimeMinutes": 35,
  "servings": 4,
  ...
}
```

---

## 3. Update Recipe với Upload Ảnh Mới

### Bước 1: Upload ảnh mới
```
POST http://localhost:8080/api/recipes/{id}/images
Body → form-data:
  - files: [Chọn file ảnh mới]
```

### Bước 2: Update recipe với imageUrl mới
```
PUT http://localhost:8080/api/recipes/{id}
Body → JSON:
{
  "title": "Cơm Gà Nướng",
  "imageUrl": "/media/new-image.jpg",
  ...
}
```

Hoặc sử dụng imageUrls từ response của upload:
```
PUT http://localhost:8080/api/recipes/{id}
Body → JSON:
{
  "title": "Cơm Gà Nướng",
  "imageUrl": "/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  ...
}
```

---

## 4. Update Recipe - Các Field Có Thể Update

| Field | Type | Mô tả |
|-------|------|-------|
| `title` | String | Tên công thức |
| `instructions` | String | Hướng dẫn nấu |
| `cookingTimeMinutes` | Integer | Thời gian nấu (phút) |
| `servings` | Integer | Số phần ăn |
| `imageUrl` | String | URL ảnh chính |
| `mealType` | Enum | Loại bữa ăn: BREAKFAST, LUNCH, DINNER, SNACK |
| `description` | String | Mô tả công thức |
| `totalCalories` | Integer | Tổng calo |
| `difficultyLevel` | Enum | Độ khó: EASY, MEDIUM, HARD |
| `ingredients` | Array | Danh sách nguyên liệu |

---

## 5. Update Ingredients

### Request Body
```json
{
  "title": "Cơm Gà Nướng",
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 500,
      "unit": "gram"
    },
    {
      "ingredientId": 3,
      "quantity": 200,
      "unit": "gram"
    }
  ]
}
```

**Lưu ý:** 
- Nếu gửi `ingredients`, tất cả ingredients cũ sẽ bị xóa và thay thế bằng danh sách mới
- Nếu không gửi `ingredients`, danh sách cũ sẽ giữ nguyên

---

## 6. Ví Dụ Test Cases

### Test Case 1: Update Title
```json
PUT /api/recipes/1
{
  "title": "Cơm Gà Nướng Mới"
}
```

### Test Case 2: Update Multiple Fields
```json
PUT /api/recipes/1
{
  "title": "Cơm Gà Nướng",
  "cookingTimeMinutes": 45,
  "servings": 6,
  "mealType": "DINNER"
}
```

### Test Case 3: Update với Ingredients Mới
```json
PUT /api/recipes/1
{
  "title": "Cơm Gà Nướng",
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 600,
      "unit": "gram"
    }
  ]
}
```

### Test Case 4: Partial Update (PATCH)
```json
PATCH /api/recipes/1
{
  "cookingTimeMinutes": 40
}
```

---

## 7. Error Responses

### 404 Not Found - Recipe không tồn tại
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Recipe not found with id: 999"
}
```

### 404 Not Found - Ingredient không tồn tại
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Ingredient not found with id: 999"
}
```

### 400 Bad Request - Validation Error
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed"
}
```

---

## 8. Postman Collection Example

### Request 1: Update Recipe Title
```
PUT http://localhost:8080/api/recipes/1
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "title": "Cơm Gà Nướng Mới"
}
```

### Request 2: Update Recipe với Full Data
```
PUT http://localhost:8080/api/recipes/1
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "title": "Cơm Gà Nướng",
  "instructions": "Nướng gà trong 30 phút ở nhiệt độ 200 độ C. Sau đó cắt nhỏ và bày ra đĩa.",
  "cookingTimeMinutes": 30,
  "servings": 4,
  "imageUrl": "/media/recipe-image.jpg",
  "mealType": "DINNER",
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 500,
      "unit": "gram"
    },
    {
      "ingredientId": 2,
      "quantity": 2,
      "unit": "cái"
    }
  ]
}
```

### Request 3: Partial Update
```
PATCH http://localhost:8080/api/recipes/1
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "cookingTimeMinutes": 35,
  "servings": 5
}
```

---

## 9. Workflow Update Recipe với Ảnh Mới

### Cách 1: Update riêng biệt
1. **Upload ảnh mới:**
   ```
   POST /api/recipes/1/images
   Body: files = [ảnh mới]
   ```
   Response: `[{ "url": "/media/new-image.jpg", ... }]`

2. **Update recipe với URL mới:**
   ```
   PUT /api/recipes/1
   Body: { "imageUrl": "/media/new-image.jpg", ... }
   ```

### Cách 2: Update imageUrl trực tiếp
```
PUT /api/recipes/1
Body: {
  "imageUrl": "/media/existing-image.jpg",
  "title": "Recipe Title"
}
```

---

## 10. Lưu Ý Quan Trọng

1. **PUT vs PATCH:**
   - `PUT`: Cần gửi đầy đủ các field (hoặc null cho field không muốn thay đổi)
   - `PATCH`: Chỉ cần gửi các field muốn update

2. **Ingredients:**
   - Nếu gửi `ingredients`, tất cả ingredients cũ sẽ bị thay thế
   - Để giữ nguyên ingredients cũ, không gửi field `ingredients`

3. **Images:**
   - `imageUrl`: Ảnh chính (single)
   - Để thêm nhiều ảnh, sử dụng endpoint `/api/recipes/{id}/images`

4. **Validation:**
   - `title`: Bắt buộc khi tạo mới
   - `ingredientId`: Phải tồn tại trong database
   - `mealType`: Phải là một trong các giá trị: BREAKFAST, LUNCH, DINNER, SNACK

