# Hướng Dẫn Test API với Postman

## Cách 1: Import Collection (Khuyến nghị)

1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn file `Postman_Collection.json`
4. Collection sẽ xuất hiện với 3 requests mẫu

## Cách 2: Tạo Request Thủ Công

### 1. Tạo Request Mới
- Method: **POST**
- URL: `http://127.0.0.1:5002/recommend`

### 2. Headers
```
Content-Type: application/json
```

### 3. Body (raw JSON)
```json
{
    "current_date": "2024-12-20",
    "inventory_items": [
        {
            "ingredient_id": 1,
            "quantity": 500,
            "unit": "g",
            "expiration_date": "2024-12-22"
        },
        {
            "ingredient_id": 2,
            "quantity": 1000,
            "unit": "g",
            "expiration_date": "2025-01-20"
        }
    ],
    "family_profiles": [
        {
            "allergies": [5],
            "health_goals": ["Low-Carb", "High-Protein"]
        },
        {
            "allergies": [],
            "health_goals": ["Low-Carb"]
        }
    ],
    "all_recipes": [
        {
            "id": 101,
            "name": "Chicken Fried Rice",
            "ingredients": [
                {"ingredient_id": 1, "is_main_ingredient": true},
                {"ingredient_id": 2, "is_main_ingredient": false}
            ],
            "categories": ["Low-Carb", "High-Protein"]
        }
    ]
}
```

## Cấu Trúc Request Body

### `current_date` (optional)
- Format: `YYYY-MM-DD`
- Mặc định: Ngày hiện tại

### `inventory_items` (array)
Mỗi item gồm:
- `ingredient_id`: ID nguyên liệu (number)
- `quantity`: Số lượng (number)
- `unit`: Đơn vị (string)
- `expiration_date`: Hạn sử dụng `YYYY-MM-DD` (string)

### `family_profiles` (array)
Mỗi profile gồm:
- `allergies`: Danh sách ID nguyên liệu gây dị ứng (array of numbers)
- `health_goals`: Mục tiêu sức khỏe (array of strings)

### `all_recipes` (array)
Mỗi recipe gồm:
- `id`: ID món ăn (number)
- `name`: Tên món (string, optional)
- `ingredients`: Danh sách nguyên liệu (array)
  - `ingredient_id`: ID nguyên liệu
  - `is_main_ingredient`: Có phải nguyên liệu chính không (boolean)
- `categories`: Danh mục món ăn (array of strings)

## Response Mẫu

```json
{
    "status": "success",
    "total_analyzed": 4,
    "recommendations": [
        {
            "recipe_id": 101,
            "score": 85
        },
        {
            "recipe_id": 103,
            "score": 60
        }
    ]
}
```

## Các Test Cases Trong Collection

1. **Recommend Recipes**: Test case đầy đủ với tất cả tính năng
2. **Empty Inventory**: Test với tồn kho rỗng
3. **Expiring Items Priority**: Test ưu tiên nguyên liệu sắp hết hạn

## Lưu Ý

- Đảm bảo Flask server đang chạy trên `http://127.0.0.1:5002`
- Các món có nguyên liệu gây dị ứng sẽ bị loại bỏ hoàn toàn
- Các món thiếu nguyên liệu chính sẽ bị phạt điểm nặng
- Món sử dụng nguyên liệu sắp hết hạn (< 3 ngày) sẽ được cộng điểm bonus


