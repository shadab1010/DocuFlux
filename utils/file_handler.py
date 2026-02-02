"""
File handling and upload utilities
"""
import os
import uuid
from werkzeug.utils import secure_filename
from flask import jsonify

ALLOWED_PDF_EXTENSIONS = {'pdf'}
ALLOWED_WORD_EXTENSIONS = {'docx', 'doc'}
ALLOWED_EXTENSIONS = ALLOWED_PDF_EXTENSIONS | ALLOWED_WORD_EXTENSIONS
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


def allowed_file(filename, allowed_exts=None):
    """Check if file extension is allowed"""
    if allowed_exts is None:
        allowed_exts = ALLOWED_EXTENSIONS
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts


def secure_upload_file(file, upload_folder, allowed_exts=None):
    """
    Securely upload and validate file
    Returns: (success: bool, file_path: str or error_message: str)
    """
    if allowed_exts is None:
        allowed_exts = ALLOWED_EXTENSIONS
    
    if not file:
        return False, "No file provided"
    
    if file.filename == "":
        return False, "No file selected"
    
    if not allowed_file(file.filename, allowed_exts):
        return False, f"File type not allowed. Allowed: {', '.join(allowed_exts)}"
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return False, f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.0f}MB"
    
    if file_size == 0:
        return False, "File is empty"
    
    # Generate secure filename
    file_id = uuid.uuid4().hex
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    secure_name = f"{file_id}.{file_ext}"
    file_path = os.path.join(upload_folder, secure_name)
    
    try:
        file.save(file_path)
        
        # Verify file was saved
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            return False, "Failed to save file"
        
        return True, file_path
    except Exception as e:
        return False, f"Error saving file: {str(e)}"


def cleanup_file(file_path):
    """Safely remove a file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass


def cleanup_files(file_paths):
    """Safely remove multiple files"""
    if isinstance(file_paths, str):
        file_paths = [file_paths]
    
    for file_path in file_paths:
        cleanup_file(file_path)
