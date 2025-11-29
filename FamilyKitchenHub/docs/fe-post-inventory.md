# Hướng Dẫn FE - Tạo Inventory Item

## 1. Tải nguyên liệu cho combobox

- **Option A – tải tất cả:** gọi `GET /api/ingredients` khi mở form.
- **Option B – auto-complete:** mỗi khi người dùng nhập keyword, gọi `GET /api/ingredients/search?keyword={keyword}` (debounce ~300ms).
- Tạo option hiển thị `"{ingredient.name} ({ingredient.unit})"` và lưu `ingredient.id` làm `value`.

```jsx
const [ingredients, setIngredients] = useState([]);

useEffect(() => {
  fetch('/api/ingredients')
    .then(res => res.json())
    .then(setIngredients);
}, []);
```

## 2. Hiển thị form

- Combobox chọn nguyên liệu trả về `ingredientId`.
- Input `quantity` (number) và `expirationDate` (date). Có thể show `unit` kế bên quantity dựa trên option đang chọn.

```jsx
<Select
  label="Ingredient"
  value={form.ingredientId}
  onChange={(e) => setForm({ ...form, ingredientId: e.target.value })}
>
  {ingredients.map(ing => (
    <MenuItem key={ing.id} value={ing.id}>
      {`${ing.name} (${ing.unit})`}
    </MenuItem>
  ))}
</Select>
```

## 3. Gửi request POST

- Endpoint: `POST /api/inventory`
- Header: `Content-Type: application/json` (và Authorization nếu backend yêu cầu JWT)
- Body:

```json
{
  "userId": 1,
  "ingredientId": 3,
  "quantity": 2,
  "expirationDate": "2025-11-30"
}
```

```jsx
fetch('/api/inventory', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form)
})
  .then(res => {
    if (!res.ok) throw new Error('Create failed');
    return res.json();
  })
  .then(newItem => {
    // cập nhật danh sách ngay
    setItems(prev => [...prev, newItem]);
    resetForm();
  })
  .catch(showError);
```

## 4. Xử lý response

- API trả `InventoryItemResponseDTO`:

```json
{
  "id": 12,
  "ingredientId": 3,
  "ingredientName": "Gạo",
  "unit": "kg",
  "quantity": 2,
  "expirationDate": "2025-11-30"
}
```

- Dùng trực tiếp để cập nhật UI (bảng/tủ lạnh ảo). Không cần gọi lại GET.

## 5. Xử lý lỗi phổ biến

| Trường hợp | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| 400 Bad Request | Thiếu `quantity`, `expirationDate` sai format | Hiển thị thông báo, highlight ô sai |
| 404 Not Found | `userId` hoặc `ingredientId` không tồn tại | Kiểm tra dữ liệu trước khi gửi |
| 500 | Server lỗi khác | Kiểm tra console/log, đảm bảo API đang chạy |

## 6. UX gợi ý

- Sau khi thêm thành công, reset form hoặc giữ nguyên ingredient/quantity tùy nhu cầu.
- Cho phép nhập nhanh bằng nút “+” cạnh bảng list.
- Hiển thị đơn vị (`unit`) ngay cạnh số lượng để tránh nhầm.

## 7. Backend mở rộng cho bài viết & gợi ý món

### 7.1 Gắn tag cho nguyên liệu
- **Tables:** `tags(id, name, type)` và bảng liên kết `ingredient_tags(id, ingredient_id, tag_id)`.
- **APIs:**
  - `GET /api/tags?type=ingredient` để FE load list.
  - `POST /api/ingredients/{id}/tags` nhận `{ tagIds: number[] }`.
- **Logic:** khi lưu recipe hoặc inventory, backend cập nhật bảng liên kết. Cho phép seed tag mặc định (cay, healthy, gluten-free).

### 7.2 Đề xuất món tương tự khi click món
- **Endpoint:** `GET /api/recipes/{recipeId}/similar`.
- **Thuật toán:** tìm recipes chia sẻ nhiều tag/ingredient/category nhất; fallback theo loại món (`recipe_categories`). Response gồm `similarityScore` để FE sort/thẻ “Gợi ý”.
- **Cache:** Redis (key `recipe:{id}:similar`) trong 30 phút để giảm truy vấn.

### 7.3 Sử dụng tìm kiếm & bookmark để xếp hạng
- **Tracking:** 
  - `search_logs(id, user_id, keyword, recipe_id, created_at)`.
  - `recipe_bookmarks(id, user_id, recipe_id, created_at)`.
- **Scoring job:** cron mỗi 10 phút tính `popularity_score = search_count*0.5 + bookmark_count*2`.
- **API:** `GET /api/recipes/popular?limit=20` trả danh sách dựa trên `popularity_score`.

### 7.4 Comment & ảnh
- **Tables:** `recipe_comments(id, recipe_id, user_id, content, created_at)`, `comment_media(id, comment_id, url, type)`.
- **Endpoints:**
  - `POST /api/recipes/{id}/comments` nhận `content`, optional `mediaIds`.
  - `POST /api/media` upload ảnh (S3/GCS) -> trả URL để gắn vào comment.
  - `GET /api/recipes/{id}/comments` phân trang.
- **Moderation:** trường `status` (pending/approved/blocked) + queue review.

### 7.5 Đẩy bài nhiều tương tác lên đầu
- **Engagement score:** `engagement = comments*1 + photos*1.5 + bookmarks*2`.
- **Materialized view:** `recipe_engagement(recipe_id, engagement, updated_at)` cập nhật sau mỗi hành động.
- **API:** `GET /api/posts?sort=engagement`.
- **Sync job:** worker chạy mỗi 2 phút đọc `recipe_engagement` và ghi `engagement_rankings` (có cột `rank_bucket`) để FE phân trang ổn định.
- **Cache:** Redis key `posts:engagement:page:{n}` lưu response JSON trong 60s; khi có event mới thì publish message `recipe.engagement.updated` để các node xóa cache.
- **FE handling:** khi user chọn sort `engagement`, gọi API với query `?sort=engagement&page=1` rồi prefetch page 2. Highlight badge “🔥 Tương tác cao” nếu `engagement >= 20`.
- **Fallback:** nếu thiếu dữ liệu (view trả rỗng), FE quay về sort `publishedAt desc` và show toast “Chưa đủ dữ liệu tương tác”.

### 7.6 Phân loại món ăn trong DB
- **Tables:** `recipe_categories(id, name, parent_id)` và `recipe_category_map(recipe_id, category_id)`.
- **Endpoints:** 
  - `GET /api/recipe-categories` cho FE build filter tree.
  - `POST /api/recipes/{id}/categories` cập nhật danh sách category.
- **Validation:** đảm bảo tối thiểu một category trước khi publish.

### 7.7 Đánh dấu thời điểm nên nấu
- **Schema:** `recipe_schedules(id, recipe_id, season, weather, occasion, notes)`.
- **User note:** `user_recipe_reminders(id, user_id, recipe_id, reminder_at, note)`.
- **API:** 
  - `POST /api/recipes/{id}/occasions` để tác giả set metadata.
  - `POST /api/users/{id}/reminders` để user đặt lịch nấu (push notification / email worker).
- **Logic:** khi ngày/điều kiện phù hợp, worker quét reminder và gửi notification.

### 7.8 Thông báo hết hạn
- **Schema bổ sung:** thêm cột `purchased_at` (datetime) và `expiration_notified` (boolean) vào `inventory_items` để lưu ngày mua và đánh dấu đã gửi thông báo (FE vẫn có thể dùng ngày mua ở UI khác, nhưng thông báo chỉ nhắc ngày hết hạn).
- **Worker:** job chạy mỗi 6 tiếng quét `inventory_items` có `expiration_date <= now() + 2 ngày` và `expiration_notified = false`, push message `inventory.expiring` kèm `userId`, `ingredientName`.
- **Notification API:** `POST /api/users/{userId}/notifications` lưu queue hiển thị “{ingredientName} sắp hết hạn ngày {expirationDate}”.
- **FE:** hiển thị badge “⚠️ Hết hạn” trong tủ lạnh ảo; tooltip chỉ nhắc ngày hết hạn để tránh nhiễu cho người dùng.
- **Audit:** khi user đánh dấu “đã xử lý”, gọi `PATCH /api/inventory/{id}/ack-expiration` để set `expiration_notified=true` và lưu timestamp.


