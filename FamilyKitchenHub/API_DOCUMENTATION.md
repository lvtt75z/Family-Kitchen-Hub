# Tài Liệu API - Family Kitchen Hub

## Tổng Quan
Tài liệu này tổng hợp tất cả các API endpoints trong hệ thống Family Kitchen Hub.

**Base URL:** `http://localhost:8080`

---

## 1. Authentication APIs - Xác Thực Người Dùng

### 1.1. Đăng ký tài khoản mới
- **Link API:** `POST http://localhost:8080/api/auth/register`
- **Chức năng:** Cho phép người dùng đăng ký tài khoản mới trong hệ thống. Hệ thống sẽ gửi mã OTP qua email để xác thực.
- **Request Body:** `RegisterRequest` (username, email, password, fullName, ...)
- **Response:** `MessageResponse` với thông báo thành công (201 Created)

### 1.2. Xác thực email với mã OTP
- **Link API:** `POST http://localhost:8080/api/auth/verify-email`
- **Chức năng:** Xác thực email của người dùng bằng mã OTP đã được gửi qua email khi đăng ký.
- **Request Body:** `VerifyOtpRequest` (email, otpCode)
- **Response:** `MessageResponse` với thông báo xác thực thành công (200 OK)

### 1.3. Gửi lại mã OTP
- **Link API:** `POST http://localhost:8080/api/auth/resend-otp`
- **Chức năng:** Gửi lại mã OTP mới cho người dùng nếu mã cũ đã hết hạn hoặc bị mất.
- **Request Body:** `ResendOtpRequest` (email)
- **Response:** `MessageResponse` với thông báo đã gửi lại mã OTP (200 OK)

### 1.4. Đăng nhập vào hệ thống
- **Link API:** `POST http://localhost:8080/api/auth/login`
- **Chức năng:** Xác thực thông tin đăng nhập và trả về JWT token để sử dụng cho các API yêu cầu xác thực.
- **Request Body:** `LoginRequest` (username/email, password)
- **Response:** `AuthResponse` chứa JWT token và thông tin người dùng (200 OK)

### 1.5. Quên mật khẩu
- **Link API:** `POST http://localhost:8080/api/auth/forgot-password`
- **Chức năng:** Gửi token reset mật khẩu qua email cho người dùng khi họ quên mật khẩu.
- **Request Body:** `ForgotPasswordRequest` (email)
- **Response:** `MessageResponse` với thông báo đã gửi email reset mật khẩu (200 OK)

### 1.6. Đặt lại mật khẩu mới
- **Link API:** `POST http://localhost:8080/api/auth/reset-password`
- **Chức năng:** Cho phép người dùng đặt lại mật khẩu mới bằng token đã nhận qua email.
- **Request Body:** `ResetPasswordRequest` (token, newPassword)
- **Response:** `MessageResponse` với thông báo đặt lại mật khẩu thành công (200 OK)

---

## 2. User APIs - Quản Lý Người Dùng

### 2.1. Tạo tài khoản người dùng mới
- **Link API:** `POST http://localhost:8080/api/users`
- **Chức năng:** Tạo tài khoản người dùng mới trong hệ thống (thường được sử dụng bởi admin).
- **Request Body:** `UserRequestDTO` (username, email, password, fullName, role)
- **Response:** `UserResponseDTO` chứa thông tin người dùng đã tạo (201 Created)

### 2.2. Lấy danh sách tất cả người dùng
- **Link API:** `GET http://localhost:8080/api/users`
- **Chức năng:** Lấy danh sách tất cả người dùng đã đăng ký trong hệ thống.
- **Response:** `List<UserResponseDTO>` chứa danh sách người dùng (200 OK)

### 2.3. Lấy thông tin chi tiết người dùng theo ID
- **Link API:** `GET http://localhost:8080/api/users/{id}`
- **Chức năng:** Lấy thông tin chi tiết của một người dùng cụ thể dựa trên ID.
- **Path Parameters:** `id` (Long) - ID của người dùng
- **Response:** `UserResponseDTO` chứa thông tin người dùng (200 OK)

### 2.4. Cập nhật thông tin người dùng
- **Link API:** `PUT http://localhost:8080/api/users/{id}`
- **Chức năng:** Cập nhật thông tin cá nhân của người dùng như tên đầy đủ, email (không bao gồm mật khẩu).
- **Path Parameters:** `id` (Long) - ID của người dùng cần cập nhật
- **Request Body:** `UserRequestDTO` (fullName, email)
- **Response:** `UserResponseDTO` chứa thông tin đã cập nhật (200 OK)

### 2.5. Xóa tài khoản người dùng
- **Link API:** `DELETE http://localhost:8080/api/users/{id}`
- **Chức năng:** Xóa tài khoản người dùng khỏi hệ thống (thường chỉ admin mới có quyền).
- **Path Parameters:** `id` (Long) - ID của người dùng cần xóa
- **Response:** 204 No Content (xóa thành công)

### 2.6. Cập nhật thông tin profile người dùng
- **Link API:** `PUT http://localhost:8080/api/users/{id}/profile`
- **Chức năng:** Cập nhật thông tin profile chi tiết của người dùng bao gồm thông tin cá nhân, gia đình, sở thích và nhóm tuổi. API này cho phép người dùng chỉnh sửa toàn bộ thông tin profile từ form edit profile.
- **Path Parameters:** `id` (Long) - ID của người dùng cần cập nhật profile
- **Request Body:** `EditProfileRequestDTO` với các trường:
  - `fullName` (String) - Tên đầy đủ
  - `gender` (String) - Giới tính: "male", "female", "other"
  - `pathology` (String) - Bệnh lý: "allergy", "diabetes", "hypertension", "none"
  - `email` (String) - Email
  - `numberOfFamilyMembers` (Integer) - Số lượng thành viên gia đình
  - `country` (String) - Quốc gia: "vietnam", "usa", "uk", "france"
  - `favorite` (String) - Sở thích ăn uống: "Vegetarian", "Vegan", "Meat Lover", "Balanced"
  - `ageGroups` (Object) - Nhóm tuổi trong gia đình:
    - `children` (Boolean) - Trẻ em (1-12 tuổi)
    - `teenagers` (Boolean) - Thanh thiếu niên (13-18 tuổi)
    - `adult` (Boolean) - Người lớn (19-60 tuổi)
    - `oldPerson` (Boolean) - Người già (>60 tuổi)
- **Response:** `EditProfileResponseDTO` chứa thông tin profile đã cập nhật (200 OK)
- **Ví dụ Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "gender": "male",
  "pathology": "allergy",
  "email": "nguyenvana@example.com",
  "numberOfFamilyMembers": 4,
  "country": "vietnam",
  "favorite": "Balanced",
  "ageGroups": {
    "children": true,
    "teenagers": false,
    "adult": true,
    "oldPerson": false
  }
}
```

---

## 3. Ingredient APIs - Quản Lý Nguyên Liệu

### 3.1. Tạo nguyên liệu mới
- **Link API:** `POST http://localhost:8080/api/ingredients`
- **Chức năng:** Thêm một nguyên liệu mới vào cơ sở dữ liệu của hệ thống (ví dụ: thịt gà, cà chua, hành tây...).
- **Request Body:** `IngredientDTO` (name, unit, nutritionalInfo)
- **Response:** `Ingredient` chứa thông tin nguyên liệu đã tạo (201 Created)

### 3.2. Lấy danh sách tất cả nguyên liệu
- **Link API:** `GET http://localhost:8080/api/ingredients`
- **Chức năng:** Lấy danh sách tất cả các nguyên liệu có trong hệ thống để hiển thị cho người dùng chọn.
- **Response:** `List<Ingredient>` chứa danh sách nguyên liệu (200 OK)

### 3.3. Lấy thông tin chi tiết nguyên liệu theo ID
- **Link API:** `GET http://localhost:8080/api/ingredients/{id}`
- **Chức năng:** Lấy thông tin chi tiết của một nguyên liệu cụ thể bao gồm tên, đơn vị tính, thông tin dinh dưỡng.
- **Path Parameters:** `id` (Long) - ID của nguyên liệu
- **Response:** `Ingredient` chứa thông tin chi tiết (200 OK) hoặc 404 Not Found nếu không tồn tại

### 3.4. Cập nhật thông tin nguyên liệu
- **Link API:** `PUT http://localhost:8080/api/ingredients/{id}`
- **Chức năng:** Cập nhật thông tin của nguyên liệu như tên, đơn vị tính, thông tin dinh dưỡng.
- **Path Parameters:** `id` (Long) - ID của nguyên liệu cần cập nhật
- **Request Body:** `IngredientDTO` (name, unit, nutritionalInfo)
- **Response:** `Ingredient` chứa thông tin đã cập nhật (200 OK)

### 3.5. Xóa nguyên liệu khỏi hệ thống
- **Link API:** `DELETE http://localhost:8080/api/ingredients/{id}`
- **Chức năng:** Xóa một nguyên liệu khỏi hệ thống (cần kiểm tra xem nguyên liệu có đang được sử dụng trong công thức không).
- **Path Parameters:** `id` (Long) - ID của nguyên liệu cần xóa
- **Response:** 204 No Content (xóa thành công)

### 3.6. Tìm kiếm nguyên liệu theo tên (phục vụ combobox)
- **Link API:** `GET http://localhost:8080/api/ingredients/search?keyword={keyword}`
- **Chức năng:** Tìm kiếm nguyên liệu theo tên (không phân biệt hoa thường, hỗ trợ partial match) để hiển thị combobox/auto-complete trên FE, ví dụ gõ "ga" sẽ trả về "Gà ta (kg)"...
- **Query Parameters:** `keyword` (String) - Chuỗi bất kỳ mà người dùng nhập (ít nhất 1 ký tự)
- **Response:** `List<Ingredient>` chứa các nguyên liệu phù hợp (200 OK)
- **Ví dụ:** `GET http://localhost:8080/api/ingredients/search?keyword=ga`

---

## 4. Inventory APIs - Quản Lý Tủ Lạnh Ảo

### 4.1. Thêm nguyên liệu vào tủ lạnh ảo
- **Link API:** `POST http://localhost:8080/api/inventory`
- **Chức năng:** Thêm một nguyên liệu vào tủ lạnh ảo của người dùng với số lượng và ngày hết hạn cụ thể.
  - **Request Body:** `InventoryItemDTO` (userId, ingredientId, quantity, expirationD                                                                                                                                       ate)
- **Response:** `InventoryItem` chứa thông tin item đã thêm (201 Created)

### 4.2. Xem danh sách nguyên liệu trong tủ lạnh ảo
- **Link API:** `GET http://localhost:8080/api/inventory/user/{userId}`
- **Chức năng:** Lấy danh sách tất cả nguyên liệu hiện có trong tủ lạnh ảo của một người dùng để hiển thị trên giao diện.
- **Path Parameters:** `userId` (Long) - ID của người dùng
- **Response:** `List<InventoryItem>` chứa danh sách nguyên liệu (200 OK)

### 4.3. Xem chi tiết một item trong tủ lạnh ảo
- **Link API:** `GET http://localhost:8080/api/inventory/{id}`
- **Chức năng:** Lấy thông tin chi tiết của một item cụ thể trong tủ lạnh ảo bao gồm nguyên liệu, số lượng, ngày hết hạn.
- **Path Parameters:** `id` (Long) - ID của inventory item
- **Response:** `InventoryItem` chứa thông tin chi tiết (200 OK)

### 4.4. Cập nhật số lượng và ngày hết hạn
- **Link API:** `PUT http://localhost:8080/api/inventory/{id}`
- **Chức năng:** Cập nhật số lượng hoặc ngày hết hạn của một nguyên liệu trong tủ lạnh ảo (ví dụ: sau khi sử dụng một phần).
- **Path Parameters:** `id` (Long) - ID của inventory item cần cập nhật
- **Request Body:** `InventoryItemDTO` (quantity, expirationDate)
- **Response:** `InventoryItem` chứa thông tin đã cập nhật (200 OK)

### 4.5. Xóa nguyên liệu khỏi tủ lạnh ảo
- **Link API:** `DELETE http://localhost:8080/api/inventory/{id}`
- **Chức năng:** Xóa một nguyên liệu khỏi tủ lạnh ảo khi người dùng không còn sử dụng hoặc đã hết hạn.
- **Path Parameters:** `id` (Long) - ID của inventory item cần xóa
- **Response:** 204 No Content (xóa thành công)

### 4.6. Thực hiện nấu ăn và trừ nguyên liệu
- **Link API:** `POST http://localhost:8080/api/inventory/deduct?userId={userId}&recipeId={recipeId}`
- **Chức năng:** Khi người dùng thực hiện nấu một món ăn, hệ thống sẽ tự động trừ các nguyên liệu cần thiết khỏi tủ lạnh ảo theo công thức. Kiểm tra đủ nguyên liệu trước khi trừ.
- **Query Parameters:** 
  - `userId` (Long) - ID người dùng thực hiện nấu ăn
  - `recipeId` (Long) - ID công thức nấu ăn
- **Response:** Thông báo thành công (200 OK) hoặc lỗi thiếu nguyên liệu (400 Bad Request) hoặc không tìm thấy (404 Not Found)

> **Lưu ý:** Các API Inventory hiện trả về `InventoryItemResponseDTO`, trong đó bao gồm sẵn `ingredientName`, `unit`, `quantity` và `expirationDate` để giao diện hiển thị trực tiếp.

---

## 5. Recipe APIs - Quản Lý Công Thức Nấu Ăn

### 5.1. Tạo công thức nấu ăn mới
- **Link API:** `POST http://localhost:8080/api/recipes`
- **Chức năng:** Cho phép người dùng hoặc admin tạo một công thức nấu ăn mới bao gồm tên món, mô tả, nguyên liệu cần thiết, hướng dẫn nấu, thời gian nấu, độ khó...
- **Request Body:** `RecipeRequestDTO` (name, description, ingredients, instructions, cookingTime, difficulty, mealType...)
- **Response:** `RecipeResponseDTO` chứa thông tin công thức đã tạo (201 Created)

### 5.2. Xem danh sách tất cả công thức
- **Link API:** `GET http://localhost:8080/api/recipes`
- **Chức năng:** Lấy danh sách tất cả các công thức nấu ăn có trong hệ thống để người dùng có thể duyệt và chọn món muốn nấu.
- **Response:** `List<RecipeResponseDTO>` chứa danh sách công thức (200 OK)

### 5.3. Xem chi tiết công thức nấu ăn
- **Link API:** `GET http://localhost:8080/api/recipes/{id}`
- **Chức năng:** Lấy thông tin chi tiết đầy đủ của một công thức bao gồm danh sách nguyên liệu, hướng dẫn từng bước, thông tin dinh dưỡng...
- **Path Parameters:** `id` (Long) - ID của công thức
- **Response:** `RecipeResponseDTO` chứa thông tin chi tiết (200 OK) hoặc 404 Not Found nếu không tồn tại

### 5.4. Lọc công thức theo kiểu món ăn
- **Link API:** `GET http://localhost:8080/api/recipes/meal-type/{mealType}`
- **Chức năng:** Lọc và lấy danh sách các công thức nấu ăn theo kiểu món ăn (BREAKFAST, LUNCH, DINNER). Giúp người dùng tìm công thức phù hợp cho từng bữa ăn trong ngày.
- **Path Parameters:** `mealType` (MealType enum) - Kiểu món ăn: BREAKFAST, LUNCH, hoặc DINNER
- **Ví dụ:** 
  - `GET http://localhost:8080/api/recipes/meal-type/BREAKFAST` - Lấy danh sách món ăn sáng
  - `GET http://localhost:8080/api/recipes/meal-type/LUNCH` - Lấy danh sách món ăn trưa
  - `GET http://localhost:8080/api/recipes/meal-type/DINNER` - Lấy danh sách món ăn tối
- **Response:** `List<RecipeResponseDTO>` chứa danh sách công thức theo kiểu món ăn (200 OK)

### 5.5. Tìm kiếm công thức theo tên
- **Link API:** `GET http://localhost:8080/api/recipes/search?name={name}`
- **Chức năng:** Tìm kiếm công thức nấu ăn theo tên món. Hỗ trợ tìm kiếm không phân biệt hoa thường và tìm kiếm một phần (partial match). Ví dụ: tìm "gà" sẽ trả về các món như "Gà nướng", "Gà kho", "Gà rán"...
- **Query Parameters:** `name` (String) - Tên hoặc một phần tên của công thức cần tìm
- **Ví dụ:** 
  - `GET http://localhost:8080/api/recipes/search?name=gà` - Tìm tất cả công thức có chứa từ "gà" trong tên
  - `GET http://localhost:8080/api/recipes/search?name=phở` - Tìm tất cả công thức có chứa từ "phở" trong tên
  - `GET http://localhost:8080/api/recipes/search?name=canh` - Tìm tất cả công thức có chứa từ "canh" trong tên
- **Response:** `List<RecipeResponseDTO>` chứa danh sách công thức tìm được (200 OK). Trả về danh sách rỗng nếu không tìm thấy.

### 5.6. Cập nhật thông tin công thức
- **Link API:** `PUT http://localhost:8080/api/recipes/{id}`
- **Chức năng:** Cho phép chỉnh sửa thông tin của công thức như thay đổi nguyên liệu, cập nhật hướng dẫn nấu, điều chỉnh thời gian nấu...
- **Path Parameters:** `id` (Long) - ID của công thức cần cập nhật
- **Request Body:** `RecipeRequestDTO` (name, description, ingredients, instructions...)
- **Response:** `RecipeResponseDTO` chứa thông tin đã cập nhật (200 OK)

### 5.7. Xóa công thức khỏi hệ thống
- **Link API:** `DELETE http://localhost:8080/api/recipes/{id}`
- **Chức năng:** Xóa một công thức nấu ăn khỏi hệ thống (thường chỉ admin hoặc người tạo mới có quyền).
- **Path Parameters:** `id` (Long) - ID của công thức cần xóa
- **Response:** 204 No Content (xóa thành công)

---

## 6. Allergy APIs - Quản Lý Dị Ứng

### 6.1. Tạo loại dị ứng mới
- **Link API:** `POST http://localhost:8080/api/allergies`
- **Chức năng:** Thêm một loại dị ứng mới vào hệ thống (ví dụ: dị ứng đậu phộng, dị ứng sữa, dị ứng hải sản...).
- **Request Body:** `AllergyRequestDTO` (name, description)
- **Response:** `AllergyResponseDTO` chứa thông tin loại dị ứng đã tạo (201 Created)

### 6.2. Xem danh sách tất cả các loại dị ứng
- **Link API:** `GET http://localhost:8080/api/allergies`
- **Chức năng:** Lấy danh sách tất cả các loại dị ứng có trong hệ thống để người dùng có thể chọn khi thiết lập thông tin thành viên gia đình.
- **Response:** `List<AllergyResponseDTO>` chứa danh sách dị ứng (200 OK)

### 6.3. Xem chi tiết loại dị ứng
- **Link API:** `GET http://localhost:8080/api/allergies/{id}`
- **Chức năng:** Lấy thông tin chi tiết của một loại dị ứng cụ thể bao gồm tên và mô tả.
- **Path Parameters:** `id` (Long) - ID của loại dị ứng
- **Response:** `AllergyResponseDTO` chứa thông tin chi tiết (200 OK) hoặc 404 Not Found nếu không tồn tại

### 6.4. Tìm kiếm dị ứng theo tên
- **Link API:** `GET http://localhost:8080/api/allergies/search?name={name}`
- **Chức năng:** Tìm kiếm một loại dị ứng cụ thể theo tên để người dùng có thể nhanh chóng tìm thấy loại dị ứng cần thiết.
- **Query Parameters:** `name` (String) - Tên loại dị ứng cần tìm
- **Response:** `AllergyResponseDTO` chứa thông tin dị ứng (200 OK) hoặc 404 Not Found nếu không tìm thấy

### 6.5. Cập nhật thông tin loại dị ứng
- **Link API:** `PUT http://localhost:8080/api/allergies/{id}`
- **Chức năng:** Cập nhật thông tin của một loại dị ứng như tên hoặc mô tả.
- **Path Parameters:** `id` (Long) - ID của loại dị ứng cần cập nhật
- **Request Body:** `AllergyRequestDTO` (name, description)
- **Response:** `AllergyResponseDTO` chứa thông tin đã cập nhật (200 OK)

### 6.6. Xóa loại dị ứng khỏi hệ thống
- **Link API:** `DELETE http://localhost:8080/api/allergies/{id}`
- **Chức năng:** Xóa một loại dị ứng khỏi hệ thống (cần kiểm tra xem có thành viên nào đang sử dụng loại dị ứng này không).
- **Path Parameters:** `id` (Long) - ID của loại dị ứng cần xóa
- **Response:** 204 No Content (xóa thành công)

---

## 7. Family Member APIs - Quản Lý Thành Viên Gia Đình

### 7.1. Thêm thành viên gia đình mới
- **Link API:** `POST http://localhost:8080/api/family-members`
- **Chức năng:** Cho phép người dùng thêm thông tin thành viên gia đình (vợ, chồng, con cái...) vào hệ thống cùng với danh sách các loại dị ứng của thành viên đó để hệ thống có thể lọc công thức phù hợp.
- **Request Body:** `FamilyMemberRequestDTO` (name, dateOfBirth, relationship, userId, allergyIds[])
- **Response:** `FamilyMemberResponseDTO` chứa thông tin thành viên đã tạo (201 Created)

### 7.2. Xem danh sách tất cả thành viên gia đình
- **Link API:** `GET http://localhost:8080/api/family-members`
- **Chức năng:** Lấy danh sách tất cả thành viên gia đình trong toàn bộ hệ thống (thường dùng cho admin).
- **Response:** `List<FamilyMemberResponseDTO>` chứa danh sách thành viên (200 OK)

### 7.3. Xem chi tiết thông tin thành viên
- **Link API:** `GET http://localhost:8080/api/family-members/{id}`
- **Chức năng:** Lấy thông tin chi tiết của một thành viên gia đình bao gồm tên, ngày sinh, mối quan hệ và danh sách dị ứng.
- **Path Parameters:** `id` (Long) - ID của thành viên gia đình
- **Response:** `FamilyMemberResponseDTO` chứa thông tin chi tiết (200 OK) hoặc 404 Not Found nếu không tồn tại

### 7.4. Xem danh sách thành viên của một người dùng
- **Link API:** `GET http://localhost:8080/api/family-members/user/{userId}`
- **Chức năng:** Lấy danh sách tất cả thành viên gia đình của một người dùng cụ thể để hiển thị trên trang quản lý gia đình.
- **Path Parameters:** `userId` (Long) - ID của người dùng
- **Response:** `List<FamilyMemberResponseDTO>` chứa danh sách thành viên (200 OK)

### 7.5. Cập nhật thông tin thành viên
- **Link API:** `PUT http://localhost:8080/api/family-members/{id}`
- **Chức năng:** Cập nhật thông tin của thành viên gia đình như tên, ngày sinh, mối quan hệ và danh sách dị ứng.
- **Path Parameters:** `id` (Long) - ID của thành viên cần cập nhật
- **Request Body:** `FamilyMemberRequestDTO` (name, dateOfBirth, relationship, userId, allergyIds[])
- **Response:** `FamilyMemberResponseDTO` chứa thông tin đã cập nhật (200 OK)

### 7.6. Xóa thành viên gia đình
- **Link API:** `DELETE http://localhost:8080/api/family-members/{id}`
- **Chức năng:** Xóa thông tin một thành viên gia đình khỏi hệ thống khi không còn cần thiết.
- **Path Parameters:** `id` (Long) - ID của thành viên cần xóa
- **Response:** 204 No Content (xóa thành công)

### 7.7. Thêm dị ứng cho thành viên
- **Link API:** `POST http://localhost:8080/api/family-members/{memberId}/allergies/{allergyId}`
- **Chức năng:** Thêm một loại dị ứng mới cho thành viên gia đình (ví dụ: phát hiện thêm dị ứng mới).
- **Path Parameters:** 
  - `memberId` (Long) - ID của thành viên gia đình
  - `allergyId` (Long) - ID của loại dị ứng
- **Response:** `FamilyMemberResponseDTO` chứa thông tin thành viên đã cập nhật (200 OK)

### 7.8. Xóa dị ứng khỏi thành viên
- **Link API:** `DELETE http://localhost:8080/api/family-members/{memberId}/allergies/{allergyId}`
- **Chức năng:** Xóa một loại dị ứng khỏi danh sách dị ứng của thành viên (ví dụ: sau khi điều trị khỏi dị ứng).
- **Path Parameters:** 
  - `memberId` (Long) - ID của thành viên gia đình
  - `allergyId` (Long) - ID của loại dị ứng cần xóa
- **Response:** `FamilyMemberResponseDTO` chứa thông tin thành viên đã cập nhật (200 OK)

---

## 8. Member Allergy APIs - Quản Lý Quan Hệ Thành Viên-Dị Ứng

### 8.1. Tạo quan hệ thành viên-dị ứng
- **Link API:** `POST http://localhost:8080/api/member-allergies`
- **Chức năng:** Tạo mối quan hệ giữa một thành viên gia đình và một loại dị ứng cụ thể. API này quản lý bảng trung gian giữa thành viên và dị ứng.
- **Request Body:** `MemberAllergyRequestDTO` (memberId, allergyId)
- **Response:** `MemberAllergyResponseDTO` chứa thông tin quan hệ đã tạo (201 Created)

### 8.2. Xem danh sách tất cả quan hệ thành viên-dị ứng
- **Link API:** `GET http://localhost:8080/api/member-allergies`
- **Chức năng:** Lấy danh sách tất cả các mối quan hệ giữa thành viên và dị ứng trong toàn bộ hệ thống (thường dùng cho admin hoặc báo cáo).
- **Response:** `List<MemberAllergyResponseDTO>` chứa danh sách quan hệ (200 OK)

### 8.3. Kiểm tra quan hệ cụ thể
- **Link API:** `GET http://localhost:8080/api/member-allergies?memberId={memberId}&allergyId={allergyId}`
- **Chức năng:** Kiểm tra xem một thành viên cụ thể có bị một loại dị ứng cụ thể hay không.
- **Query Parameters:** 
  - `memberId` (Long) - ID của thành viên gia đình
  - `allergyId` (Long) - ID của loại dị ứng
- **Response:** `MemberAllergyResponseDTO` chứa thông tin quan hệ (200 OK) hoặc 404 Not Found nếu không tồn tại

### 8.4. Xem danh sách dị ứng của một thành viên
- **Link API:** `GET http://localhost:8080/api/member-allergies/member/{memberId}`
- **Chức năng:** Lấy danh sách tất cả các loại dị ứng mà một thành viên gia đình cụ thể đang có để hiển thị trong hồ sơ thành viên.
- **Path Parameters:** `memberId` (Long) - ID của thành viên gia đình
- **Response:** `List<MemberAllergyResponseDTO>` chứa danh sách dị ứng (200 OK)

### 8.5. Xem danh sách thành viên có một loại dị ứng
- **Link API:** `GET http://localhost:8080/api/member-allergies/allergy/{allergyId}`
- **Chức năng:** Lấy danh sách tất cả thành viên trong hệ thống có một loại dị ứng cụ thể (hữu ích cho việc thống kê hoặc lọc công thức).
- **Path Parameters:** `allergyId` (Long) - ID của loại dị ứng
- **Response:** `List<MemberAllergyResponseDTO>` chứa danh sách thành viên (200 OK)

### 8.6. Xóa quan hệ thành viên-dị ứng
- **Link API:** `DELETE http://localhost:8080/api/member-allergies?memberId={memberId}&allergyId={allergyId}`
- **Chức năng:** Xóa mối quan hệ giữa một thành viên và một loại dị ứng (ví dụ: khi thành viên không còn bị dị ứng đó nữa).
- **Query Parameters:** 
  - `memberId` (Long) - ID của thành viên gia đình
  - `allergyId` (Long) - ID của loại dị ứng
- **Response:** 204 No Content (xóa thành công)

---

## Tổng Kết

### Số lượng API theo module:
- **Authentication (Xác thực):** 6 APIs
- **User (Người dùng):** 6 APIs
- **Ingredient (Nguyên liệu):** 5 APIs
- **Inventory (Tủ lạnh ảo):** 6 APIs
- **Recipe (Công thức):** 7 APIs
- **Allergy (Dị ứng):** 6 APIs
- **Family Member (Thành viên gia đình):** 8 APIs
- **Member Allergy (Quan hệ thành viên-dị ứng):** 6 APIs

**Tổng cộng: 50 API endpoints**

### HTTP Methods sử dụng:
- **POST:** Tạo mới dữ liệu (Create)
- **GET:** Đọc và lấy dữ liệu (Read)
- **PUT:** Cập nhật dữ liệu (Update)
- **DELETE:** Xóa dữ liệu (Delete)

### Response Status Codes:
- **200 OK:** Yêu cầu thành công
- **201 Created:** Tạo mới thành công
- **204 No Content:** Xóa thành công (không có nội dung trả về)
- **400 Bad Request:** Yêu cầu không hợp lệ (thiếu dữ liệu, sai định dạng...)
- **404 Not Found:** Không tìm thấy tài nguyên yêu cầu

### Lưu ý:
- Base URL mặc định: `http://localhost:8080`
- Các API có thể yêu cầu JWT token trong header nếu được bảo vệ bởi Spring Security
- Format request/response thường là JSON
- Một số API có thể yêu cầu quyền admin hoặc quyền của chính người dùng đó

---

*Tài liệu được tạo tự động từ source code - Family Kitchen Hub Project*

