# Hướng Dẫn Test API POST Inventory trong Postman

## API: Thêm nguyên liệu vào tủ lạnh ảo

### 1. Thông tin cơ bản

- **Method:** `POST`
- **URL:** `http://localhost:8080/api/inventory`
- **Description:** Thêm một nguyên liệu vào tủ lạnh ảo của người dùng với số lượng và ngày hết hạn cụ thể.

---

## 2. Cấu hình Request trong Postman

### 2.1. Method và URL

1. Chọn method: **POST**
2. Nhập URL: `http://localhost:8080/api/inventory`

### 2.2. Headers

Thêm các headers sau trong tab **Headers**:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer {your_jwt_token}` (nếu API yêu cầu authentication) |

**Lưu ý:** Kiểm tra `SecurityConfig` để xem API này có yêu cầu JWT token hay không.

### 2.3. Body

Chọn tab **Body** → chọn **raw** → chọn **JSON** từ dropdown.

#### Ví dụ Request Body (đầy đủ):

```json
{
  "userId": 1,
  "ingredientId": 3,
  "quantity": 2.5,
  "expirationDate": "2025-12-31",
  "purchasedAt": "2025-12-04"
}
```

#### Ví dụ Request Body (tối thiểu - không có purchasedAt):

```json
{
  "userId": 1,
  "ingredientId": 3,
  "quantity": 2.5,
  "expirationDate": "2025-12-31"
}
```

---

## 3. Các trường trong Request Body

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả | Ví dụ |
|--------|--------------|----------|-------|-------|
| `userId` | Long | ✅ Yes | ID của người dùng sở hữu nguyên liệu | `1` |
| `ingredientId` | Long | ✅ Yes | ID của nguyên liệu (ingredient) | `3` |
| `quantity` | Float | ✅ Yes | Số lượng nguyên liệu | `2.5` |
| `expirationDate` | String (LocalDate) | ✅ Yes | Ngày hết hạn (format: YYYY-MM-DD) | `"2025-12-31"` |
| `purchasedAt` | String (LocalDate) | ❌ No | Ngày mua (format: YYYY-MM-DD) | `"2025-12-04"` |

---

## 4. Ví dụ Test Cases

### Test Case 1: Thêm gạo vào tủ lạnh

**Request:**
```json
{
  "userId": 1,
  "ingredientId": 1,
  "quantity": 5.0,
  "expirationDate": "2026-01-15",
  "purchasedAt": "2025-12-04"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 12,
  "userId": 1,
  "ingredientId": 1,
  "ingredientName": "Gạo",
  "unit": "kg",
  "quantity": 5.0,
  "expirationDate": "2026-01-15",
  "purchasedAt": "2025-12-04",
  "createdAt": "2025-12-04T10:30:00",
  "expirationNotified": false,
  "expirationAcknowledgedAt": null
}
```

### Test Case 2: Thêm thịt gà vào tủ lạnh

**Request:**
```json
{
  "userId": 1,
  "ingredientId": 5,
  "quantity": 1.5,
  "expirationDate": "2025-12-10"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 13,
  "userId": 1,
  "ingredientId": 5,
  "ingredientName": "Thịt gà",
  "unit": "kg",
  "quantity": 1.5,
  "expirationDate": "2025-12-10",
  "purchasedAt": null,
  "createdAt": "2025-12-04T10:35:00",
  "expirationNotified": false,
  "expirationAcknowledgedAt": null
}
```

### Test Case 3: Thêm cà chua (số lượng nhỏ)

**Request:**
```json
{
  "userId": 2,
  "ingredientId": 8,
  "quantity": 0.5,
  "expirationDate": "2025-12-08",
  "purchasedAt": "2025-12-03"
}
```

---

## 5. Response Codes

| Status Code | Mô tả |
|-------------|-------|
| `201 Created` | Tạo thành công, trả về `InventoryItemResponseDTO` |
| `400 Bad Request` | Request body không hợp lệ (thiếu trường bắt buộc, sai format ngày...) |
| `404 Not Found` | Không tìm thấy `userId` hoặc `ingredientId` |
| `401 Unauthorized` | Không có token hoặc token không hợp lệ (nếu API yêu cầu authentication) |

---

## 6. Các lỗi thường gặp

### Lỗi 1: Thiếu trường bắt buộc

**Request (thiếu userId):**
```json
{
  "ingredientId": 3,
  "quantity": 2.5,
  "expirationDate": "2025-12-31"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "userId is required"
}
```

### Lỗi 2: Sai format ngày

**Request (sai format expirationDate):**
```json
{
  "userId": 1,
  "ingredientId": 3,
  "quantity": 2.5,
  "expirationDate": "31/12/2025"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "Invalid date format. Expected YYYY-MM-DD"
}
```

### Lỗi 3: User không tồn tại

**Request:**
```json
{
  "userId": 999,
  "ingredientId": 3,
  "quantity": 2.5,
  "expirationDate": "2025-12-31"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "User not found with id: 999"
}
```

### Lỗi 4: Ingredient không tồn tại

**Request:**
```json
{
  "userId": 1,
  "ingredientId": 999,
  "quantity": 2.5,
  "expirationDate": "2025-12-31"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "Ingredient not found with id: 999"
}
```

---

## 7. Pre-request Script (Postman)

Để tự động lấy JWT token (nếu cần), bạn có thể thêm script sau vào tab **Pre-request Script**:

```javascript
// Lấy token từ environment variable
const token = pm.environment.get("jwt_token");

if (token) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + token
    });
}
```

---

## 8. Test Script (Postman)

Thêm script sau vào tab **Tests** để tự động kiểm tra response:

```javascript
// Kiểm tra status code
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// Kiểm tra response có đúng format
pm.test("Response has correct structure", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('userId');
    pm.expect(jsonData).to.have.property('ingredientId');
    pm.expect(jsonData).to.have.property('quantity');
    pm.expect(jsonData).to.have.property('expirationDate');
});

// Kiểm tra userId và ingredientId khớp với request
pm.test("userId and ingredientId match request", function () {
    var jsonData = pm.response.json();
    var requestBody = JSON.parse(pm.request.body.raw);
    pm.expect(jsonData.userId).to.eql(requestBody.userId);
    pm.expect(jsonData.ingredientId).to.eql(requestBody.ingredientId);
});

// Kiểm tra response time
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

## 9. Collection Variables (Postman)

Để dễ quản lý, bạn có thể tạo các biến trong Postman Collection:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:8080` | `http://localhost:8080` |
| `jwt_token` | (để trống, sẽ được set sau khi login) | - |
| `test_user_id` | `1` | `1` |
| `test_ingredient_id` | `3` | `3` |

Sau đó sử dụng trong request body:

```json
{
  "userId": {{test_user_id}},
  "ingredientId": {{test_ingredient_id}},
  "quantity": 2.5,
  "expirationDate": "2025-12-31"
}
```

---

## 10. Checklist Test

- [ ] Test với đầy đủ các trường (bao gồm `purchasedAt`)
- [ ] Test với request body tối thiểu (không có `purchasedAt`)
- [ ] Test với `quantity` là số nguyên (ví dụ: `2`)
- [ ] Test với `quantity` là số thập phân (ví dụ: `2.5`)
- [ ] Test với `expirationDate` trong tương lai
- [ ] Test với `expirationDate` đã qua (nếu backend cho phép)
- [ ] Test thiếu trường bắt buộc (`userId`, `ingredientId`, `quantity`, `expirationDate`)
- [ ] Test với `userId` không tồn tại
- [ ] Test với `ingredientId` không tồn tại
- [ ] Test với format ngày sai
- [ ] Test với `quantity` là số âm (nếu backend không cho phép)
- [ ] Test với `quantity` là 0 (nếu backend không cho phép)

---

## 11. Lưu Request vào Collection

1. Click **Save** trong Postman
2. Chọn Collection hoặc tạo Collection mới: **"Family Kitchen Hub - Inventory APIs"**
3. Đặt tên request: **"POST - Add Inventory Item"**
4. Thêm description: **"Thêm nguyên liệu vào tủ lạnh ảo"**

---

**Chúc bạn test thành công! 🚀**


