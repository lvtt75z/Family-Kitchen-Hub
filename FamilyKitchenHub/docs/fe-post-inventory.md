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

