# Hướng Dẫn Test API Upload Ảnh với Postman

## 1. Upload Ảnh Đơn Lẻ - `/api/media/upload`

### Request
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/media/upload`
- **Headers:**
  - Không cần header đặc biệt (Postman tự động thêm `Content-Type: multipart/form-data`)

### Body (form-data)
| Key | Type | Value |
|-----|------|-------|
| `file` | File | Chọn file ảnh từ máy tính |
| `type` | Text | `IMAGE` (optional, mặc định là IMAGE) |

### Ví dụ Response (200 OK)
```json
{
  "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "url": "/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "size": 245678,
  "type": "IMAGE"
}
```

---

## 2. Upload Nhiều Ảnh - `/api/media/upload` (Multiple Files)

### Request
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/media/upload`
- **Headers:**
  - Không cần header đặc biệt

### Body (form-data)
| Key | Type | Value |
|-----|------|-------|
| `files` | File | Chọn file ảnh 1 |
| `files` | File | Chọn file ảnh 2 |
| `files` | File | Chọn file ảnh 3 (có thể thêm nhiều) |
| `type` | Text | `IMAGE` (optional) |

**Lưu ý:** Trong Postman, bạn có thể thêm nhiều key `files` bằng cách:
1. Click vào key `files` đầu tiên
2. Chọn file
3. Click vào icon "+" bên cạnh để thêm key `files` mới
4. Lặp lại cho các file khác

### Ví dụ Response (200 OK)
```json
[
  {
    "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "url": "/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "size": 245678,
    "type": "IMAGE"
  },
  {
    "fileName": "b2c3d4e5-f6a7-8901-bcde-f12345678901.png",
    "url": "/media/b2c3d4e5-f6a7-8901-bcde-f12345678901.png",
    "size": 189234,
    "type": "IMAGE"
  }
]
```

---

## 3. Upload Nhiều Ảnh Cho Recipe - `/api/recipes/{id}/images`

### Request
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/recipes/{recipeId}/images`
- **Path Variables:**
  - `recipeId`: ID của recipe (ví dụ: 1, 2, 3...)

### Body (form-data)
| Key | Type | Value |
|-----|------|-------|
| `files` | File | Chọn file ảnh 1 |
| `files` | File | Chọn file ảnh 2 |
| `files` | File | Chọn file ảnh 3 (có thể thêm nhiều) |

**Lưu ý:** 
- Recipe phải tồn tại trước khi upload ảnh
- Có thể upload nhiều ảnh cùng lúc

### Ví dụ Request
```
POST http://localhost:8080/api/recipes/1/images
```

### Ví dụ Response (201 Created)
```json
[
  {
    "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "url": "/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "size": 245678,
    "type": "IMAGE"
  },
  {
    "fileName": "b2c3d4e5-f6a7-8901-bcde-f12345678901.png",
    "url": "/media/b2c3d4e5-f6a7-8901-bcde-f12345678901.png",
    "size": 189234,
    "type": "IMAGE"
  }
]
```

---

## 4. Lấy Tất Cả Ảnh Của Recipe - `/api/recipes/{id}/images`

### Request
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/recipes/{recipeId}/images`

### Ví dụ Response (200 OK)
```json
[
  {
    "id": 1,
    "imageUrl": "/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "displayOrder": 0,
    "createdAt": "2025-01-15T10:30:00"
  },
  {
    "id": 2,
    "imageUrl": "/media/b2c3d4e5-f6a7-8901-bcde-f12345678901.png",
    "fileName": "b2c3d4e5-f6a7-8901-bcde-f12345678901.png",
    "displayOrder": 1,
    "createdAt": "2025-01-15T10:30:01"
  }
]
```

---

## 5. Xóa Ảnh Của Recipe - `/api/recipes/{id}/images/{imageId}`

### Request
- **Method:** `DELETE`
- **URL:** `http://localhost:8080/api/recipes/{recipeId}/images/{imageId}`

### Ví dụ Request
```
DELETE http://localhost:8080/api/recipes/1/images/5
```

### Response
- **204 No Content** (thành công)

---

## Hướng Dẫn Sử Dụng Postman

### Bước 1: Tạo Request Mới
1. Mở Postman
2. Click "New" → "HTTP Request"
3. Chọn method `POST`

### Bước 2: Nhập URL
```
http://localhost:8080/api/media/upload
```

### Bước 3: Cấu Hình Body
1. Chọn tab **Body**
2. Chọn **form-data**
3. Thêm key `file` hoặc `files`
4. Ở cột **Type**, chọn **File** (thay vì Text)
5. Click **Select Files** và chọn file ảnh từ máy tính

### Bước 4: Upload Nhiều Files
Để upload nhiều files:
1. Thêm key `files` đầu tiên → chọn file
2. Click vào icon **+** bên cạnh để thêm key `files` mới
3. Lặp lại cho các file khác

### Bước 5: Gửi Request
Click **Send** và xem kết quả

---

## Lưu Ý Quan Trọng

1. **File Size:** Tối đa 10MB mỗi file, tổng request tối đa 50MB
2. **File Types:** Chấp nhận các định dạng ảnh: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
3. **Authentication:** 
   - `/api/media/upload` - Không cần authentication
   - `/api/recipes/{id}/images` - Có thể cần authentication (tùy cấu hình)
4. **Recipe ID:** Phải tồn tại trong database trước khi upload ảnh

---

## Ví Dụ Test Cases

### Test Case 1: Upload 1 ảnh thành công
- **Endpoint:** `POST /api/media/upload`
- **Body:** `file` = một file ảnh hợp lệ
- **Expected:** 201 Created với thông tin file

### Test Case 2: Upload nhiều ảnh thành công
- **Endpoint:** `POST /api/media/upload`
- **Body:** `files` = nhiều file ảnh
- **Expected:** 201 Created với mảng các file đã upload

### Test Case 3: Upload ảnh cho recipe
- **Endpoint:** `POST /api/recipes/1/images`
- **Body:** `files` = nhiều file ảnh
- **Expected:** 201 Created, ảnh được lưu vào database

### Test Case 4: Upload file rỗng (Error)
- **Endpoint:** `POST /api/media/upload`
- **Body:** Không có file hoặc file rỗng
- **Expected:** 400 Bad Request với thông báo lỗi

### Test Case 5: Upload cho recipe không tồn tại (Error)
- **Endpoint:** `POST /api/recipes/99999/images`
- **Body:** `files` = file ảnh
- **Expected:** 404 Not Found

---

## Troubleshooting

### Lỗi 500 Internal Server Error
- Kiểm tra xem thư mục `uploads` đã được tạo chưa
- Kiểm tra quyền ghi file trên server
- Xem server logs để biết chi tiết lỗi

### Lỗi 400 Bad Request
- Kiểm tra file có hợp lệ không
- Kiểm tra file size có vượt quá giới hạn không
- Kiểm tra Content-Type có đúng không

### File không hiển thị sau khi upload
- Kiểm tra URL trả về có đúng không
- Kiểm tra cấu hình `app.media.base-url` trong `application.properties`
- Kiểm tra WebConfig có map đúng đường dẫn `/media/**` không



