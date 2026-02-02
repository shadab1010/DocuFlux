# MyPDF - Code Structure & Refactoring Guide

## Overview
This document explains the refactored code structure of the MyPDF application. The application has been reorganized into modular components for better maintainability, scalability, and readability.

## Project Structure

```
MyPDF/
├── app.py                      # Main Flask application (refactored)
├── app_old.py                  # Backup of original app.py
├── libreoffice_converter.py    # LibreOffice conversion utilities
├── requirements.txt            # Python dependencies
│
├── utils/                      # Utility modules (NEW)
│   ├── __init__.py
│   ├── file_handler.py         # File upload & validation
│   ├── db_manager.py           # Database operations
│   ├── pdf_converter.py        # PDF conversion functions
│   └── validators.py           # Input validation functions
│
├── static/                     # Frontend assets
│   ├── style.css
│   └── script.js
│
├── templates/                  # HTML templates
│   ├── base.html
│   ├── home.html
│   ├── merge.html
│   ├── split.html
│   ├── compress.html
│   ├── preview.html
│   ├── pdf_to_image.html
│   ├── pdf_to_word.html
│   ├── pdf_to_excel.html
│   ├── pdf_to_powerpoint.html
│   ├── pdf_to_jpg.html         # NEW
│   ├── pdf_to_png.html         # NEW
│   └── word_to_pdf.html
│
├── uploads/                    # Temporary file storage
├── users.db                    # User database
└── README.md                   # Project documentation
```

## Key Improvements

### 1. **Modular Architecture**
The monolithic `app.py` has been split into focused utility modules:
- **file_handler.py**: Handles file uploads, validation, and cleanup
- **db_manager.py**: Manages database operations for users
- **pdf_converter.py**: Contains all PDF conversion logic
- **validators.py**: Input validation functions

### 2. **Better Code Organization**
The refactored `app.py` is organized into logical sections:
- Configuration
- Decorators
- Authentication Routes
- PDF Manipulation Routes (Merge, Split, Compress)
- Conversion Routes (PDF to Word, Excel, PowerPoint, JPG, PNG)
- Error Handlers

### 3. **Removed Redundancies**
- Eliminated duplicate PDF file handling code
- Consolidated validation logic
- Centralized file cleanup operations
- Removed unused imports

### 4. **Enhanced Error Handling**
- Consistent error response format
- Input validation before processing
- Proper file cleanup on errors
- Detailed error messages

### 5. **Improved Security**
- Secure file upload with validation
- File size limits (50MB)
- Sanitized filenames using UUID
- Input validation for all user data

## Module Details

### utils/file_handler.py
Handles file upload and management operations.

**Key Functions:**
- `allowed_file()` - Check if file extension is allowed
- `secure_upload_file()` - Validate and save uploaded file
- `cleanup_file()` - Safely remove a file
- `cleanup_files()` - Remove multiple files

**Constants:**
- `ALLOWED_PDF_EXTENSIONS` - Allowed PDF file types
- `ALLOWED_WORD_EXTENSIONS` - Allowed Word file types
- `MAX_FILE_SIZE` - Maximum file size (50MB)

### utils/db_manager.py
Manages database operations for user authentication.

**DatabaseManager Class Methods:**
- `init_db()` - Initialize database tables
- `create_user()` - Register new user
- `authenticate_user()` - Login user
- `get_or_create_user()` - OAuth user management

### utils/pdf_converter.py
Contains all PDF conversion operations.

**Functions:**
- `merge_pdfs()` - Merge multiple PDFs
- `split_pdf()` - Split PDF by page ranges
- `compress_pdf()` - Compress PDF file
- `pdf_to_images()` - Convert PDF to images
- `pdf_to_word()` - Convert PDF to Word
- `pdf_to_excel()` - Extract tables to Excel
- `pdf_to_jpg()` - Convert PDF to JPG
- `pdf_to_png()` - Convert PDF to PNG
- `create_image_zip()` - Create ZIP of images

### utils/validators.py
Input validation utilities.

**Functions:**
- `validate_email()` - Check email format
- `validate_password()` - Check password requirements
- `validate_page_range()` - Validate page range format
- `validate_form_data()` - Check required fields

## App.py Structure

### Configuration Section
```python
app = Flask(__name__)
app.secret_key = 'mypdf_secret_key_2026'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
DB_PATH = os.path.join(BASE_DIR, "users.db")
```

### Authentication Routes
- `/signup` (POST) - Register new user
- `/login` (POST) - Login user
- `/oauth-google` (POST) - Google OAuth login
- `/oauth-facebook` (POST) - Facebook OAuth login
- `/logout` - Logout user

### PDF Manipulation Routes
- `/merge` & `/merge-pdf` - Merge multiple PDFs
- `/split` & `/split-pdf` - Split PDF by pages
- `/compress` & `/compress-pdf` - Compress PDF

### Conversion Routes
- `/pdf-to-word` & `/convert-pdf-to-word` - PDF to Word
- `/pdf-to-excel` & `/convert-pdf-to-excel` - PDF to Excel
- `/pdf-to-powerpoint` & `/convert-pdf-to-powerpoint` - PDF to PowerPoint
- `/pdf-to-jpg` & `/convert-pdf-to-jpg` - PDF to JPG
- `/pdf-to-png` & `/convert-pdf-to-png` - PDF to PNG
- `/word-to-pdf` & `/convert-word-to-pdf` - Word to PDF

### Download Routes
- `/download-word` - Download converted Word
- `/download-excel` - Download converted Excel
- `/download-powerpoint` - Download converted PowerPoint
- `/download-word-to-pdf` - Download converted PDF

## Best Practices Implemented

### 1. **File Management**
```python
# Always clean up files after sending
try:
    return send_file(output_path, ...)
finally:
    cleanup_files([pdf_path, output_path])
```

### 2. **Error Handling**
```python
success, result = pdf_to_word(pdf_path, output_path)
if not success:
    return jsonify({"error": result}), 500
```

### 3. **Input Validation**
```python
success, path = secure_upload_file(file, UPLOAD_FOLDER)
if not success:
    return jsonify({"error": path}), 400
```

### 4. **Database Operations**
```python
db = DatabaseManager(DB_PATH)
success, user_id = db.create_user(email, name, password)
```

## Adding New Features

### To add a new PDF conversion:

1. **Create converter function** in `utils/pdf_converter.py`:
```python
def pdf_to_new_format(pdf_path, output_path):
    try:
        # conversion logic here
        return True, output_path
    except Exception as e:
        return False, str(e)
```

2. **Add routes** in `app.py`:
```python
@app.route("/pdf-to-new")
def pdf_to_new_page():
    return render_template("pdf_to_new.html", title="PDF to New", active="convert")

@app.route("/convert-pdf-to-new", methods=["POST"])
def convert_pdf_to_new_route():
    # Handle conversion
```

3. **Create template** in `templates/pdf_to_new.html`

4. **Update home.html** to add tool card

## Dependencies

### Core Libraries
- **Flask** - Web framework
- **PyPDF** - PDF manipulation
- **PyMuPDF (fitz)** - PDF rendering
- **pdf2docx** - PDF to Word conversion
- **python-docx** - Word document handling
- **python-pptx** - PowerPoint handling
- **openpyxl** - Excel handling
- **pdfplumber** - PDF table extraction
- **Pillow** - Image processing
- **reportlab** - PDF generation
- **werkzeug** - Security utilities

## Performance Considerations

1. **File Size Limits**: Maximum 50MB per file
2. **Temporary Files**: Cleaned up after download
3. **Database Connections**: Closed properly
4. **Memory Usage**: Large PDFs processed page by page

## Security Features

1. **File Upload Validation**
   - Extension checking
   - Size limits
   - Content verification

2. **Database Security**
   - Password hashing
   - SQL injection protection
   - Input sanitization

3. **Session Management**
   - Secret key protection
   - Proper logout handling
   - OAuth integration

## Testing the Application

1. **Start the app:**
```bash
python app.py
```

2. **Access at:** http://localhost:5000

3. **Test conversions:**
   - Upload a PDF file
   - Select conversion format
   - Download result

## Troubleshooting

### Import Errors
If you see `ImportError` for utils modules, ensure:
- You're in the correct directory
- `utils/__init__.py` exists
- All module files are in the `utils/` folder

### File Not Found Errors
- Check if `uploads/` folder exists
- Verify file permissions
- Check disk space

### Conversion Failures
- Validate PDF file format
- Check file isn't corrupted
- Review application logs

## Future Improvements

1. **Database**: Migrate to SQLAlchemy ORM
2. **Async Processing**: Use Celery for long operations
3. **Caching**: Add Redis for session management
4. **API**: Create REST API endpoints
5. **Testing**: Add comprehensive unit tests
6. **Logging**: Implement structured logging
7. **Monitoring**: Add error tracking (Sentry)
8. **Docker**: Create containerized deployment
9. **Cloud Storage**: Support AWS S3 or similar
10. **Batch Processing**: Handle multiple file conversions

## Support & Maintenance

For issues or questions:
1. Check the logs in the terminal
2. Review error messages in the web interface
3. Test with simple PDF files first
4. Verify all dependencies are installed

---

**Last Updated**: January 29, 2026
**Version**: 2.0 (Refactored)
