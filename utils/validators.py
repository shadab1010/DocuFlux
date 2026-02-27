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
    """Validate and parse page range format (e.g., '1-5' or '1,3,5-7')"""
    try:
        ranges = []
        parts = page_range_str.split(',')
        for part in parts:
            part = part.strip()
            if '-' in part:
                range_parts = part.split('-')
                if len(range_parts) != 2:
                    return False, f"Invalid format in part: {part}"
                start, end = int(range_parts[0]), int(range_parts[1])
                if start < 1 or end > total_pages or start > end:
                    return False, f"Invalid range in part {part}. Must be between 1-{total_pages}"
                ranges.append((start, end))
            elif part.isdigit():
                val = int(part)
                if val < 1 or val > total_pages:
                    return False, f"Invalid page number {val}. Must be between 1-{total_pages}"
                ranges.append((val, val))
            else:
                return False, f"Invalid character in range: {part}"
        
        return True, ranges
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
