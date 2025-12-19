# Hướng dẫn Test API POST Recipes trong Postman

## Endpoint: Tạo Recipe Mới

**Method:** `POST`  
**URL:** `http://localhost:8080/api/recipes`  
**Headers:**
```
Content-Type: application/json
```

---

## Ví dụ 1: Tạo Recipe Đơn Giản (Không có nguyên liệu)

### Request Body:
```json
{
  "title": "Cơm Chiên Trứng",
  "instructions": "1. Chiên trứng trước\n2. Cho cơm vào chảo\n3. Đảo đều và nêm gia vị\n4. Cho trứng vào đảo cùng",
  "cookingTimeMinutes": 15,
  "servings": 2,
  "imageUrl": "https://example.com/images/com-chien-trung.jpg",
  "mealType": "LUNCH"
}
```

### Response (201 Created):
```json
{
  "id": 1,
  "title": "Cơm Chiên Trứng",
  "instructions": "1. Chiên trứng trước\n2. Cho cơm vào chảo\n3. Đảo đều và nêm gia vị\n4. Cho trứng vào đảo cùng",
  "cookingTimeMinutes": 15,
  "servings": 2,
  "imageUrl": "https://example.com/images/com-chien-trung.jpg",
  "mealType": "LUNCH",
  "ingredients": []
}
```

---

## Ví dụ 2: Tạo Recipe Với Nguyên Liệu

### Request Body:
```json
{
  "title": "Phở Bò",
  "instructions": "1. Nấu nước dùng từ xương bò\n2. Luộc bánh phở\n3. Thái thịt bò mỏng\n4. Cho bánh phở vào tô, thêm thịt bò và nước dùng\n5. Thêm hành, ngò, chanh",
  "cookingTimeMinutes": 120,
  "servings": 4,
  "imageUrl": "https://example.com/images/pho-bo.jpg",
  "mealType": "BREAKFAST",
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 500.0,
      "unit": "gram"
    },
    {
      "ingredientId": 2,
      "quantity": 200.0,
      "unit": "gram"
    },
    {
      "ingredientId": 3,
      "quantity": 50.0,
      "unit": "gram"
    }
  ]
}
```

### Response (201 Created):
```json
{
  "id": 2,
  "title": "Phở Bò",
  "instructions": "1. Nấu nước dùng từ xương bò\n2. Luộc bánh phở\n3. Thái thịt bò mỏng\n4. Cho bánh phở vào tô, thêm thịt bò và nước dùng\n5. Thêm hành, ngò, chanh",
  "cookingTimeMinutes": 120,
  "servings": 4,
  "imageUrl": "https://example.com/images/pho-bo.jpg",
  "mealType": "BREAKFAST",
  "ingredients": [
    {
      "ingredientId": 1,
      "ingredientName": "Bánh phở",
      "quantity": 500.0,
      "unit": "gram"
    },
    {
      "ingredientId": 2,
      "ingredientName": "Thịt bò",
      "quantity": 200.0,
      "unit": "gram"
    },
    {
      "ingredientId": 3,
      "ingredientName": "Hành lá",
      "quantity": 50.0,
      "unit": "gram"
    }
  ]
}
```

---

## Ví dụ 3: Tạo Recipe Cho Bữa Tối

### Request Body:
```json
{
  "title": "Bò Kho",
  "instructions": "1. Ướp thịt bò với gia vị\n2. Xào thịt bò với hành tỏi\n3. Cho nước dừa và nước mắm vào\n4. Nấu nhừ trong 2 giờ\n5. Thêm cà rốt và củ cải trắng\n6. Nấu thêm 30 phút",
  "cookingTimeMinutes": 150,
  "servings": 6,
  "imageUrl": "https://example.com/images/bo-kho.jpg",
  "mealType": "DINNER",
  "ingredients": [
    {
      "ingredientId": 10,
      "quantity": 1000.0,
      "unit": "gram"
    },
    {
      "ingredientId": 11,
      "quantity": 300.0,
      "unit": "gram"
    },
    {
      "ingredientId": 12,
      "quantity": 200.0,
      "unit": "gram"
    },
    {
      "ingredientId": 13,
      "quantity": 100.0,
      "unit": "gram"
    }
  ]
}
```

---

## Ví dụ 4: Tạo Recipe Tối Thiểu (Chỉ có title bắt buộc)

### Request Body:
```json
{
  "title": "Món Ăn Nhanh",
  "instructions": "Làm theo hướng dẫn trên bao bì",
  "mealType": "LUNCH"
}
```

---

## Các Giá Trị MealType Hợp Lệ:
- `BREAKFAST` - Bữa sáng
- `LUNCH` - Bữa trưa
- `DINNER` - Bữa tối

---

## Lưu Ý Khi Test:

1. **IngredientId phải tồn tại**: Các `ingredientId` trong mảng `ingredients` phải là ID của các nguyên liệu đã có trong database. Nếu không, sẽ nhận lỗi `404 Not Found`.

2. **Title là bắt buộc**: Trường `title` không được để trống.

3. **Quantity phải là số dương**: Giá trị `quantity` trong `RecipeIngredientDTO` phải là số dương.

4. **Unit là optional**: Trường `unit` trong `ingredients` là tùy chọn. Nếu không cung cấp, hệ thống sẽ tự động lấy từ `Ingredient.defaultUnit`. Nếu Ingredient cũng không có defaultUnit, hệ thống sẽ dùng "gram" làm mặc định.

5. **Kiểm tra Response Status**:
   - `201 Created`: Tạo thành công
   - `400 Bad Request`: Dữ liệu không hợp lệ
   - `404 Not Found`: Ingredient không tồn tại
   - `500 Internal Server Error`: Lỗi server

---

## Cách Test Trong Postman:

1. Mở Postman và tạo request mới
2. Chọn method: **POST**
3. Nhập URL: `http://localhost:8080/api/recipes`
4. Vào tab **Headers**, thêm:
   - Key: `Content-Type`
   - Value: `application/json`
5. Vào tab **Body**, chọn **raw** và **JSON**
6. Copy một trong các ví dụ JSON ở trên và paste vào
7. Click **Send**
8. Kiểm tra response status và body

---

## Test Cases Cần Kiểm Tra:

### ✅ Test Case 1: Tạo thành công với đầy đủ thông tin
- Input: JSON đầy đủ các trường
- Expected: 201 Created, trả về recipe với ID

### ✅ Test Case 2: Tạo thành công chỉ với title
- Input: JSON chỉ có title
- Expected: 201 Created

### ❌ Test Case 3: Thiếu title (bắt buộc)
- Input: JSON không có trường `title`
- Expected: 400 Bad Request

### ❌ Test Case 4: IngredientId không tồn tại
- Input: JSON với `ingredientId` không có trong database
- Expected: 404 Not Found

### ❌ Test Case 5: MealType không hợp lệ
- Input: JSON với `mealType` = "SNACK" (không có trong enum)
- Expected: 400 Bad Request

### ❌ Test Case 6: Quantity âm hoặc null
- Input: JSON với `quantity` = -10 hoặc null
- Expected: 400 Bad Request hoặc lỗi validation

