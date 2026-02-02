"""
Validation utilities
"""
import re


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password, min_length=6):
    """Validate password requirements"""
    if len(password) < min_length:
        return False, f"Password must be at least {min_length} characters"
    
    return True, "Password is valid"


def validate_page_range(page_range_str, total_pages):
    """Validate page range format (e.g., '1-5')"""
    try:
        parts = page_range_str.split('-')
        if len(parts) != 2:
            return False, "Invalid format. Use 'start-end'"
        
        start, end = int(parts[0]), int(parts[1])
        
        if start < 1 or end > total_pages or start > end:
            return False, f"Invalid range. Must be between 1-{total_pages}"
        
        return True, (start, end)
    except ValueError:
        return False, "Invalid page numbers"


def validate_form_data(data, required_fields):
    """Validate required form fields"""
    missing_fields = []
    
    for field in required_fields:
        value = data.get(field, "").strip()
        if not value:
            missing_fields.append(field)
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, "Valid"
