from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

# --- CẤU HÌNH TRỌNG SỐ (WEIGHTS) ---
SCORE_ALLERGY_VIOLATION = -9999  # Loại ngay lập tức nếu dị ứng
SCORE_MISSING_MAIN_INGREDIENT = -500  # Phạt nặng nếu thiếu nguyên liệu chính
SCORE_EXPIRING_SOON_BONUS = 50  # Thưởng lớn nếu dùng đồ sắp hết hạn (< 3 ngày)
SCORE_HAS_INGREDIENT = 10  # Điểm cộng cơ bản khi có nguyên liệu
SCORE_CATEGORY_MATCH = 5  # Điểm cộng khi đúng sở thích (nhân với số người thích)
SCORE_CALORIE_MATCH = 5  # Điểm cộng nhẹ nếu calo hợp lý


@app.route('/recommend', methods=['POST'])
def recommend_recipes():
    try:
        data = request.json

        # --- 1. PARSE DỮ LIỆU ĐẦU VÀO ---
        # Lấy ngày hiện tại (Java gửi sang hoặc lấy giờ server)
        current_date_str = data.get('current_date', datetime.now().strftime('%Y-%m-%d'))

        # Map Inventory: {id: {quantity, expiration_date}}
        inventory_map = {}
        for item in data.get('inventory_items', []):
            inv_id = item.get('ingredient_id')
            inventory_map[inv_id] = {
                'quantity': item.get('quantity', 0),
                'unit': item.get('unit', ''),
                'expiration_date': item.get('expiration_date')  # Format YYYY-MM-DD
            }

        family_profiles = data.get('family_profiles', [])
        all_recipes = data.get('all_recipes', [])

        # --- 2. TỔNG HỢP DỮ LIỆU GIA ĐÌNH (AGGREGATION) ---
        family_allergy_ids = set()
        family_goals_count = {}  # Đếm: {'Low-Carb': 2, 'High-Protein': 1}

        for profile in family_profiles:
            # Gộp dị ứng (Bất cứ ai bị dị ứng -> Thêm vào danh sách cấm)
            family_allergy_ids.update(profile.get('allergies', []))

            # Đếm tần suất mục tiêu sức khỏe/sở thích
            for goal in profile.get('health_goals', []):
                family_goals_count[goal] = family_goals_count.get(goal, 0) + 1

        print(f"--- DEBUG ---")
        print(f"🚫 Allergies: {family_allergy_ids}")
        print(f"🎯 Goals: {family_goals_count}")

        # --- 3. VÒNG LẶP ĐÁNH GIÁ TỪNG CÔNG THỨC ---
        scored_recipes = []

        for recipe in all_recipes:
            score = 0
            recipe_id = recipe.get('id')
            recipe_ingredients = recipe.get('ingredients', [])  # List ingredient chi tiết
            recipe_categories = set(recipe.get('categories', []))  # List tên category

            # A. KIỂM TRA DỊ ỨNG (HARD FILTER)
            # Lấy tất cả ID nguyên liệu trong món này
            recipe_ing_ids = {ri['ingredient_id'] for ri in recipe_ingredients}

            # Nếu giao nhau khác rỗng -> Có chứa chất gây dị ứng
            if not recipe_ing_ids.isdisjoint(family_allergy_ids):
                # print(f"❌ Loại món ID {recipe_id} vì dị ứng")
                continue

                # B. KIỂM TRA TỒN KHO & HẠN SỬ DỤNG
            missing_main_ingredient = False

            for ri in recipe_ingredients:
                ing_id = ri['ingredient_id']
                is_main = ri.get('is_main_ingredient', False)

                if ing_id in inventory_map:
                    # User CÓ nguyên liệu này -> Cộng điểm
                    score += SCORE_HAS_INGREDIENT

                    # Kiểm tra Hạn sử dụng (Logic Giải cứu thực phẩm)
                    user_item = inventory_map[ing_id]
                    if user_item['expiration_date']:
                        days_left = days_between(current_date_str, user_item['expiration_date'])
                        if 0 <= days_left <= 3:
                            score += SCORE_EXPIRING_SOON_BONUS
                            print(f"✨ Recipe {recipe_id}: Bonus giải cứu thực phẩm ID {ing_id} (Còn {days_left} ngày)")

                else:
                    # User KHÔNG CÓ
                    if is_main:
                        missing_main_ingredient = True
                        # Không break ở đây để tiếp tục tính các điểm khác nếu muốn,
                        # nhưng thường thì thiếu đồ chính là fail.

            # Phạt nặng nếu thiếu nguyên liệu chính
            if missing_main_ingredient:
                score += SCORE_MISSING_MAIN_INGREDIENT

            # C. ĐÁNH GIÁ SỞ THÍCH GIA ĐÌNH (CONTEXT)
            # Nhân điểm với số lượng người muốn mục tiêu đó
            for goal, count_people in family_goals_count.items():
                if goal in recipe_categories:
                    bonus = SCORE_CATEGORY_MATCH * count_people
                    score += bonus

            # D. LƯU KẾT QUẢ
            # Chỉ lấy món có điểm > -100 (để loại bỏ các món thiếu đồ chính)
            if score > -100:
                scored_recipes.append({
                    'recipe_id': recipe_id,
                    'score': score
                })

        # Sắp xếp giảm dần theo điểm
        sorted_recommendations = sorted(scored_recipes, key=lambda r: r['score'], reverse=True)

        return jsonify({
            'status': 'success',
            'total_analyzed': len(all_recipes),
            'recommendations': sorted_recommendations
        })

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({'error': str(e)}), 400


# Hàm tính khoảng cách ngày
def days_between(d1_str, d2_str):
    try:
        if not d1_str or not d2_str: return 999
        d1 = datetime.strptime(d1_str, "%Y-%m-%d")
        d2 = datetime.strptime(d2_str, "%Y-%m-%d")
        return (d2 - d1).days
    except:
        return 999


if __name__ == '__main__':
    app.run(port=5001, debug=True)