# Hướng Dẫn API Nấu/Đặt Recipe - Trừ Nguyên Liệu Từ Tủ Lạnh Ảo

## Tổng Quan

Khi người dùng ấn nút "Nấu" hoặc "Đặt" trên một công thức, hệ thống sẽ:
1. So sánh các nguyên liệu trong tủ lạnh ảo với công thức
2. Kiểm tra xem có đủ nguyên liệu không
3. Trừ đi các nguyên liệu đã sử dụng từ tủ lạnh ảo
4. Trả về thông tin chi tiết về các nguyên liệu đã được trừ

---

## Endpoint: `POST /api/recipes/{id}/cook`

### Request
- **Method:** `POST` (QUAN TRỌNG: Phải là POST, không phải GET)
- **URL:** `http://localhost:8080/api/recipes/{id}/cook`
- **Path Variables:**
  - `id`: ID của recipe cần nấu
- **Query Parameters:**
  - `userId`: ID của người dùng thực hiện nấu (Long, **optional** - nếu không có sẽ lấy từ authentication context)

### Ví dụ Request

#### Cách 1: Với userId trong query parameter
```
POST http://localhost:8080/api/recipes/1/cook?userId=1
```

#### Cách 2: Với authentication token (userId tự động lấy từ token)
```
POST http://localhost:8080/api/recipes/1/cook
Headers:
  Authorization: Bearer {jwt_token}
```

### ⚠️ Lưu Ý Quan Trọng:
- **PHẢI sử dụng method POST**, không phải GET
- Nếu bạn gửi GET request, sẽ nhận lỗi: "No static resource api/recipes/9/cook"
- `userId` là **optional**:
  - Nếu có authentication token → userId sẽ tự động lấy từ token
  - Nếu không có token → phải cung cấp `userId` trong query parameter
  - Nếu cả hai đều không có → sẽ nhận lỗi 400 Bad Request
- Endpoint này đã được cấu hình public trong SecurityConfig

### Response (200 OK) - Thành công
```json
{
  "message": "Đã nấu món ăn thành công! Nguyên liệu đã được trừ khỏi tủ lạnh ảo.",
  "recipeId": 1,
  "recipeTitle": "Cơm Gà Nướng",
  "deductedIngredients": [
    {
      "ingredientId": 1,
      "ingredientName": "Gà",
      "deductedQuantity": 500.0,
      "remainingQuantity": 200.0,
      "unit": "gram",
      "removedFromInventory": false
    },
    {
      "ingredientId": 2,
      "ingredientName": "Trứng",
      "deductedQuantity": 2.0,
      "remainingQuantity": 0.0,
      "unit": "cái",
      "removedFromInventory": true
    }
  ]
}
```

### Response Fields

| Field | Type | Mô tả |
|-------|------|-------|
| `message` | String | Thông báo kết quả |
| `recipeId` | Long | ID của recipe đã nấu |
| `recipeTitle` | String | Tên của recipe |
| `deductedIngredients` | Array | Danh sách các nguyên liệu đã trừ |

#### DeductedIngredientDTO Fields

| Field | Type | Mô tả |
|-------|------|-------|
| `ingredientId` | Long | ID của nguyên liệu |
| `ingredientName` | String | Tên nguyên liệu |
| `deductedQuantity` | Double | Số lượng đã trừ |
| `remainingQuantity` | Double | Số lượng còn lại trong tủ lạnh |
| `unit` | String | Đơn vị tính |
| `removedFromInventory` | Boolean | `true` nếu nguyên liệu đã hết và bị xóa khỏi inventory |

---

## Error Responses

### 404 Not Found - Recipe không tồn tại
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Recipe not found with id: 999"
}
```

### 400 Bad Request - Không đủ nguyên liệu
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Không đủ nguyên liệu: Gà. Cần: 500.0. Có: 200.0"
}
```

### 400 Bad Request - Nguyên liệu không có trong tủ lạnh
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Không đủ nguyên liệu: Trứng. Cần: 2.0. Có: 0"
}
```

### 400 Bad Request - Thiếu userId
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "userId là bắt buộc. Vui lòng cung cấp userId trong query parameter hoặc đăng nhập để sử dụng userId từ authentication."
}
```

---

## Logic Xử Lý

### 1. Kiểm Tra Nguyên Liệu
- Hệ thống sẽ kiểm tra từng nguyên liệu trong recipe
- So sánh số lượng yêu cầu với số lượng có trong tủ lạnh ảo của user
- Nếu thiếu bất kỳ nguyên liệu nào, sẽ throw exception và không trừ nguyên liệu nào

### 2. Trừ Nguyên Liệu
- Sau khi đảm bảo đủ tất cả nguyên liệu, hệ thống sẽ trừ từng nguyên liệu:
  - Nếu số lượng còn lại sau khi trừ > 0: Cập nhật số lượng mới
  - Nếu số lượng còn lại sau khi trừ <= 0: Xóa nguyên liệu khỏi inventory

### 3. Trả Về Thông Tin
- Trả về danh sách chi tiết các nguyên liệu đã được trừ
- Bao gồm số lượng đã trừ, số lượng còn lại, và trạng thái (còn lại hay đã hết)

---

## Ví Dụ Sử Dụng

### Ví Dụ 1: Nấu Recipe Thành Công

**Request:**
```
POST http://localhost:8080/api/recipes/1/cook?userId=1
```

**Tình huống:**
- Recipe yêu cầu: 500g Gà, 2 quả Trứng
- Tủ lạnh có: 700g Gà, 3 quả Trứng

**Response:**
```json
{
  "message": "Đã nấu món ăn thành công! Nguyên liệu đã được trừ khỏi tủ lạnh ảo.",
  "recipeId": 1,
  "recipeTitle": "Cơm Gà Nướng",
  "deductedIngredients": [
    {
      "ingredientId": 1,
      "ingredientName": "Gà",
      "deductedQuantity": 500.0,
      "remainingQuantity": 200.0,
      "unit": "gram",
      "removedFromInventory": false
    },
    {
      "ingredientId": 2,
      "ingredientName": "Trứng",
      "deductedQuantity": 2.0,
      "remainingQuantity": 1.0,
      "unit": "cái",
      "removedFromInventory": false
    }
  ]
}
```

**Kết quả:**
- Tủ lạnh còn: 200g Gà, 1 quả Trứng

---

### Ví Dụ 2: Nguyên Liệu Hết Sau Khi Trừ

**Request:**
```
POST http://localhost:8080/api/recipes/1/cook?userId=1
```

**Tình huống:**
- Recipe yêu cầu: 500g Gà, 2 quả Trứng
- Tủ lạnh có: 500g Gà, 2 quả Trứng (vừa đủ)

**Response:**
```json
{
  "message": "Đã nấu món ăn thành công! Nguyên liệu đã được trừ khỏi tủ lạnh ảo.",
  "recipeId": 1,
  "recipeTitle": "Cơm Gà Nướng",
  "deductedIngredients": [
    {
      "ingredientId": 1,
      "ingredientName": "Gà",
      "deductedQuantity": 500.0,
      "remainingQuantity": 0.0,
      "unit": "gram",
      "removedFromInventory": true
    },
    {
      "ingredientId": 2,
      "ingredientName": "Trứng",
      "deductedQuantity": 2.0,
      "remainingQuantity": 0.0,
      "unit": "cái",
      "removedFromInventory": true
    }
  ]
}
```

**Kết quả:**
- Cả Gà và Trứng đã bị xóa khỏi inventory (vì đã hết)

---

### Ví Dụ 3: Không Đủ Nguyên Liệu

**Request:**
```
POST http://localhost:8080/api/recipes/1/cook?userId=1
```

**Tình huống:**
- Recipe yêu cầu: 500g Gà, 2 quả Trứng
- Tủ lạnh có: 200g Gà, 3 quả Trứng

**Response (400 Bad Request):**
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Không đủ nguyên liệu: Gà. Cần: 500.0. Có: 200.0"
}
```

**Kết quả:**
- Không có nguyên liệu nào bị trừ (transaction rollback)
- Tủ lạnh vẫn giữ nguyên: 200g Gà, 3 quả Trứng

---

## Postman Collection Example

### Request Configuration

#### Option 1: Với userId trong query parameter
```
Method: POST
URL: http://localhost:8080/api/recipes/1/cook?userId=1
Headers:
  Content-Type: application/json
```

#### Option 2: Với authentication token (không cần userId)
```
Method: POST
URL: http://localhost:8080/api/recipes/1/cook
Headers:
  Content-Type: application/json
  Authorization: Bearer {jwt_token}
```

### Test Cases

#### Test Case 1: Nấu Recipe Thành Công
```
POST /api/recipes/1/cook?userId=1
Expected: 200 OK với thông tin các nguyên liệu đã trừ
```

#### Test Case 2: Không Đủ Nguyên Liệu
```
POST /api/recipes/1/cook?userId=1
Expected: 400 Bad Request với message lỗi
```

#### Test Case 3: Recipe Không Tồn Tại
```
POST /api/recipes/99999/cook?userId=1
Expected: 404 Not Found
```

#### Test Case 4: User Không Tồn Tại
```
POST /api/recipes/1/cook?userId=99999
Expected: 404 Not Found (nếu user không tồn tại)
```

---

## Lưu Ý Quan Trọng

1. **Transaction Safety:**
   - Tất cả các thao tác trừ nguyên liệu được thực hiện trong một transaction
   - Nếu có bất kỳ nguyên liệu nào thiếu, toàn bộ transaction sẽ rollback
   - Đảm bảo tính nhất quán dữ liệu

2. **Unit Conversion:**
   - Hiện tại hệ thống yêu cầu đơn vị phải khớp giữa recipe và inventory
   - Nếu cần chuyển đổi đơn vị (ví dụ: kg sang gram), cần xử lý ở frontend hoặc cải thiện backend

3. **Multiple Inventory Items:**
   - Nếu user có nhiều inventory items cùng một ingredient (ví dụ: 2 lần mua Gà khác nhau)
   - Hệ thống sẽ chỉ trừ từ một inventory item (item đầu tiên tìm thấy)
   - Có thể cần cải thiện để ưu tiên trừ từ item sắp hết hạn trước

4. **Concurrent Requests:**
   - Nếu nhiều request cùng lúc trừ nguyên liệu, có thể xảy ra race condition
   - Nên sử dụng database locking hoặc optimistic locking

---

## Workflow Tích Hợp Frontend

### Bước 1: Kiểm Tra Nguyên Liệu Trước Khi Nấu
```
GET /api/recipes/{id}
→ Lấy danh sách nguyên liệu của recipe

GET /api/inventory/user/{userId}
→ Lấy danh sách nguyên liệu trong tủ lạnh

→ So sánh và hiển thị cảnh báo nếu thiếu nguyên liệu
```

### Bước 2: Người Dùng Ấn Nút "Nấu"
```
POST /api/recipes/{id}/cook?userId={userId}
→ Gọi API để trừ nguyên liệu
```

### Bước 3: Xử Lý Response
- **Thành công:** Hiển thị thông báo và cập nhật UI
- **Lỗi:** Hiển thị thông báo lỗi và không cập nhật UI

### Bước 4: Refresh Inventory
```
GET /api/inventory/user/{userId}
→ Lấy lại danh sách inventory sau khi trừ
```

---

## Cải Thiện Tương Lai

1. **Unit Conversion:**
   - Hỗ trợ chuyển đổi đơn vị tự động (kg ↔ gram, lít ↔ ml, etc.)

2. **Multiple Inventory Items:**
   - Ưu tiên trừ từ item sắp hết hạn trước
   - Hỗ trợ trừ từ nhiều inventory items cùng một ingredient

3. **Recipe Scheduling:**
   - Lưu lịch nấu ăn và tự động trừ nguyên liệu vào thời điểm đã định

4. **Shopping List:**
   - Tự động tạo shopping list cho các nguyên liệu thiếu

5. **Notification:**
   - Gửi thông báo khi nguyên liệu sắp hết sau khi nấu

