"""
Bill Detector - Detects ingredients from bill/receipt images using EasyOCR
"""
import re
import easyocr
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Optional
from unit_converter import convert_unit


class BillDetector:
    def __init__(self, languages=['en'], gpu=False):
        """Initialize EasyOCR reader"""
        print("🔄 Loading EasyOCR model...")
        self.reader = easyocr.Reader(languages, gpu=gpu)
        print("✅ EasyOCR model loaded successfully!")
        
        # Quantity patterns
        self.quantity_patterns = [
            r'(\d+\.?\d*)\s*(kg|kilogram)',
            r'(\d+\.?\d*)\s*(g|gram)',
            r'(\d+\.?\d*)\s*(l|liter|litre)',
            r'(\d+\.?\d*)\s*(ml|milliliter)',
            r'(\d+\.?\d*)\s*(oz|ounce)',
            r'(\d+\.?\d*)\s*(lb|pound)',
            r'(\d+\.?\d*)\s*(piece|pieces|pcs|pc)',
            r'(\d+\.?\d*)\s*(slice|slices)',
            r'(\d+\.?\d*)\s*(dozen)',
            r'(\d+\.?\d*)\s*x',  # e.g., "2x Milk"
            r'(\d+\.?\d*)',  # Just a number
        ]
    
    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """Preprocess image for better OCR results"""
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding to get better contrast
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return thresh
    
    def extract_text(self, image_bytes: bytes) -> List[Dict]:
        """Extract all text from image using EasyOCR"""
        # Preprocess image
        processed_img = self.preprocess_image(image_bytes)
        
        # Perform OCR
        results = self.reader.readtext(processed_img)
        
        # Format results
        extracted = []
        for (bbox, text, confidence) in results:
            extracted.append({
                'text': text,
                'confidence': confidence,
                'bbox': bbox
            })
        
        return extracted
    
    def parse_quantity_unit(self, text: str) -> Optional[Dict]:
        """Parse quantity and unit from text"""
        text_lower = text.lower().strip()
        
        for pattern in self.quantity_patterns:
            match = re.search(pattern, text_lower)
            if match:
                groups = match.groups()
                quantity = float(groups[0])
                unit = groups[1] if len(groups) > 1 else 'piece'
                
                return {
                    'quantity': quantity,
                    'unit': unit
                }
        
        return None
    
    def clean_ingredient_name(self, text: str) -> str:
        """Clean ingredient name by removing prices, quantities, etc."""
        # Remove common price patterns
        text = re.sub(r'\$?\d+[,.]?\d*', '', text)
        text = re.sub(r'đ', '', text)  # Vietnamese dong
        text = re.sub(r'₫', '', text)
        
        # Remove quantity patterns
        for pattern in self.quantity_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        # Clean up whitespace
        text = ' '.join(text.split())
        text = text.strip()
        
        return text
    
    def detect_ingredients(self, image_bytes: bytes) -> List[Dict]:
        """
        Main detection function - extracts ingredients from bill/receipt
        
        Returns:
            List of detected items with name, quantity, unit
        """
        # Extract all text
        extracted_texts = self.extract_text(image_bytes)
        
        print(f"\n🔍 OCR Extracted {len(extracted_texts)} text items from image")
        
        detected_items = []
        
        for item in extracted_texts:
            text = item['text']
            confidence = item['confidence']
            
            # Skip if confidence too low
            if confidence < 0.5:
                continue
            
            # Skip common receipt headers/footers
            skip_words = ['total', 'subtotal', 'tax', 'receipt', 'thank you', 
                         'date', 'time', 'cashier', 'change', 'payment']
            if any(word in text.lower() for word in skip_words):
                continue
            
            # Try to parse quantity and unit
            qty_unit = self.parse_quantity_unit(text)
            
            # Clean the ingredient name
            ingredient_name = self.clean_ingredient_name(text)
            
            # Skip if name is too short or empty
            if len(ingredient_name) < 2:
                continue
            
            # DEBUG: Print what was detected
            if qty_unit:
                print(f"   ✅ '{text}' -> {ingredient_name} | Qty: {qty_unit['quantity']} {qty_unit['unit']}")
            else:
                print(f"   ⚠️  '{text}' -> {ingredient_name} | No quantity pattern matched, defaulting to 1 piece")
            
            # Create detected item
            detected_item = {
                'name': ingredient_name,
                'quantity': qty_unit['quantity'] if qty_unit else 1,
                'unit': qty_unit['unit'] if qty_unit else 'piece',
                'confidence': confidence,
                'raw_text': text
            }
            
            detected_items.append(detected_item)
        
        print(f"\n📦 Total detected items: {len(detected_items)}\n")
        return detected_items
    
    def merge_similar_items(self, items: List[Dict]) -> List[Dict]:
        """Merge items that appear to be the same ingredient"""
        from fuzzywuzzy import fuzz
        
        merged = []
        used_indices = set()
        
        for i, item1 in enumerate(items):
            if i in used_indices:
                continue
            
            # Start with this item
            merged_item = item1.copy()
            used_indices.add(i)
            
            # Look for similar items
            for j, item2 in enumerate(items[i+1:], start=i+1):
                if j in used_indices:
                    continue
                
                # Check similarity
                similarity = fuzz.ratio(
                    item1['name'].lower(), 
                    item2['name'].lower()
                )
                
                if similarity > 80:  # Very similar
                    # Merge by adding quantities (if same unit)
                    if item1['unit'] == item2['unit']:
                        merged_item['quantity'] += item2['quantity']
                    used_indices.add(j)
            
            merged.append(merged_item)
        
        return merged


# Example usage
if __name__ == "__main__":
    detector = BillDetector()
    
    # Test with a sample image
    with open('test_receipt.jpg', 'rb') as f:
        image_bytes = f.read()
    
    results = detector.detect_ingredients(image_bytes)
    
    print("\n🔍 Detected Ingredients:")
    for item in results:
        print(f"  - {item['name']}: {item['quantity']}{item['unit']}")
