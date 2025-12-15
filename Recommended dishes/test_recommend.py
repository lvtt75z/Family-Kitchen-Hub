import requests
import json
from datetime import datetime, timedelta

# Sample test data
test_data = {
    "current_date": datetime.now().strftime('%Y-%m-%d'),
    "inventory_items": [
        {
            "ingredient_id": 1,  # Chicken
            "quantity": 500,
            "unit": "g",
            "expiration_date": (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')  # Expiring soon!
        },
        {
            "ingredient_id": 2,  # Rice
            "quantity": 1000,
            "unit": "g",
            "expiration_date": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        },
        {
            "ingredient_id": 3,  # Tomato
            "quantity": 300,
            "unit": "g",
            "expiration_date": (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')  # Expiring very soon!
        },
        {
            "ingredient_id": 4,  # Onion
            "quantity": 200,
            "unit": "g",
            "expiration_date": (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
        }
    ],
    "family_profiles": [
        {
            "allergies": [5],  # Allergic to peanuts (ingredient_id: 5)
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
                {"ingredient_id": 1, "is_main_ingredient": True},  # Chicken
                {"ingredient_id": 2, "is_main_ingredient": False},  # Rice
                {"ingredient_id": 3, "is_main_ingredient": False},  # Tomato
                {"ingredient_id": 4, "is_main_ingredient": False}  # Onion
            ],
            "categories": ["Low-Carb", "High-Protein"]
        },
        {
            "id": 102,
            "name": "Peanut Butter Sandwich",
            "ingredients": [
                {"ingredient_id": 5, "is_main_ingredient": True},  # Peanuts - SHOULD BE FILTERED
                {"ingredient_id": 6, "is_main_ingredient": False}  # Bread
            ],
            "categories": ["High-Protein"]
        },
        {
            "id": 103,
            "name": "Tomato Salad",
            "ingredients": [
                {"ingredient_id": 3, "is_main_ingredient": True},  # Tomato
                {"ingredient_id": 4, "is_main_ingredient": False}  # Onion
            ],
            "categories": ["Low-Carb"]
        },
        {
            "id": 104,
            "name": "Beef Steak",
            "ingredients": [
                {"ingredient_id": 7, "is_main_ingredient": True}  # Beef - NOT IN INVENTORY
            ],
            "categories": ["High-Protein"]
        }
    ]
}

# Send POST request
url = "http://127.0.0.1:5001/recommend"
headers = {"Content-Type": "application/json"}

print("🚀 Sending test request to /recommend endpoint...")
print(f"📅 Current date: {test_data['current_date']}")
print(f"📦 Inventory items: {len(test_data['inventory_items'])}")
print(f"👨‍👩‍👧‍👦 Family profiles: {len(test_data['family_profiles'])}")
print(f"🍳 Recipes to analyze: {len(test_data['all_recipes'])}")
print("\n" + "="*50 + "\n")

try:
    response = requests.post(url, json=test_data, headers=headers)
    
    print(f"✅ Status Code: {response.status_code}")
    print(f"\n📋 Response:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n📊 Summary:")
        print(f"   - Total recipes analyzed: {result.get('total_analyzed', 0)}")
        print(f"   - Recommendations found: {len(result.get('recommendations', []))}")
        
        if result.get('recommendations'):
            print(f"\n🏆 Top Recommendations:")
            for i, rec in enumerate(result['recommendations'][:5], 1):
                print(f"   {i}. Recipe ID {rec['recipe_id']} - Score: {rec['score']}")
    
except requests.exceptions.ConnectionError:
    print("❌ Error: Could not connect to the server.")
    print("   Make sure Flask app is running on http://127.0.0.1:5001")
except Exception as e:
    print(f"❌ Error: {str(e)}")

