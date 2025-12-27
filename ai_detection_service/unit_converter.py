"""
Unit Converter - Converts between different units
"""

# Unit conversion mapping (all to base units)
UNIT_CONVERSIONS = {
    # Weight conversions (to grams)
    'kg': 1000,
    'g': 1,
    'mg': 0.001,
    'lb': 453.592,
    'oz': 28.3495,
    
    # Volume conversions (to ml)
    'l': 1000,
    'liter': 1000,
    'litre': 1000,
    'ml': 1,
    'cl': 10,
    'dl': 100,
    'gal': 3785.41,
    'qt': 946.353,
    'pt': 473.176,
    'cup': 236.588,
    'tbsp': 14.787,
    'tablespoon': 14.787,
    'tsp': 4.929,
    'teaspoon': 4.929,
    
    # Count conversions (to pieces)
    'piece': 1,
    'pieces': 1,
    'pcs': 1,
    'pc': 1,
    'slice': 1,
    'slices': 1,
    'dozen': 12,
    'pair': 2,
}

# Unit categories
WEIGHT_UNITS = ['kg', 'g', 'mg', 'lb', 'oz']
VOLUME_UNITS = ['l', 'liter', 'litre', 'ml', 'cl', 'dl', 'gal', 'qt', 'pt', 'cup', 'tbsp', 'tablespoon', 'tsp', 'teaspoon']
COUNT_UNITS = ['piece', 'pieces', 'pcs', 'pc', 'slice', 'slices', 'dozen', 'pair']


def get_unit_category(unit: str) -> str:
    """Get the category of a unit (weight, volume, count)"""
    unit_lower = unit.lower().strip()
    
    if unit_lower in WEIGHT_UNITS:
        return 'weight'
    elif unit_lower in VOLUME_UNITS:
        return 'volume'
    elif unit_lower in COUNT_UNITS:
        return 'count'
    else:
        return 'unknown'


def convert_unit(quantity: float, from_unit: str, to_unit: str) -> dict:
    """
    Convert quantity from one unit to another
    
    Args:
        quantity: The amount to convert
        from_unit: The unit to convert from
        to_unit: The unit to convert to
    
    Returns:
        dict with converted_quantity and success status
    """
    from_unit = from_unit.lower().strip()
    to_unit = to_unit.lower().strip()
    
    # If same unit, no conversion needed
    if from_unit == to_unit:
        return {
            'converted_quantity': quantity,
            'original_quantity': quantity,
            'original_unit': from_unit,
            'converted_unit': to_unit,
            'success': True,
            'message': 'No conversion needed'
        }
    
    # Check if units are in our conversion table
    if from_unit not in UNIT_CONVERSIONS:
        return {
            'converted_quantity': quantity,
            'original_quantity': quantity,
            'original_unit': from_unit,
            'converted_unit': to_unit,
            'success': False,
            'message': f'Unknown unit: {from_unit}'
        }
    
    if to_unit not in UNIT_CONVERSIONS:
        return {
            'converted_quantity': quantity,
            'original_quantity': quantity,
            'original_unit': from_unit,
            'converted_unit': to_unit,
            'success': False,
            'message': f'Unknown unit: {to_unit}'
        }
    
    # Check if units are compatible (same category)
    from_category = get_unit_category(from_unit)
    to_category = get_unit_category(to_unit)
    
    if from_category != to_category:
        return {
            'converted_quantity': quantity,
            'original_quantity': quantity,
            'original_unit': from_unit,
            'converted_unit': to_unit,
            'success': False,
            'message': f'Cannot convert {from_category} to {to_category}'
        }
    
    # Perform conversion
    # Convert to base unit, then to target unit
    from_ratio = UNIT_CONVERSIONS[from_unit]
    to_ratio = UNIT_CONVERSIONS[to_unit]
    
    converted = quantity * (from_ratio / to_ratio)
    
    # Round to 2 decimal places
    converted = round(converted, 2)
    
    return {
        'converted_quantity': converted,
        'original_quantity': quantity,
        'original_unit': from_unit,
        'converted_unit': to_unit,
        'success': True,
        'message': f'Converted {quantity}{from_unit} to {converted}{to_unit}'
    }


# Example usage
if __name__ == "__main__":
    # Test conversions
    tests = [
        (2, 'kg', 'g'),      # 2000g
        (1.5, 'l', 'ml'),    # 1500ml
        (1, 'dozen', 'piece'), # 12 pieces
        (500, 'g', 'kg'),    # 0.5kg
    ]
    
    for qty, from_u, to_u in tests:
        result = convert_unit(qty, from_u, to_u)
        print(f"{qty}{from_u} → {result['converted_quantity']}{to_u}")
