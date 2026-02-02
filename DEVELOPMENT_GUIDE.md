# MyPDF - Quick Start & Development Guide

## Quick Start

### 1. **Installation**
```bash
cd d:\MyPDF
pip install -r requirements.txt
```

### 2. **Run Application**
```bash
python app.py
```

### 3. **Access Website**
Open browser: `http://localhost:5000`

## Project Features

### ✅ Implemented Features

**PDF Tools:**
- ✅ Merge multiple PDFs
- ✅ Split PDF by page ranges
- ✅ Compress PDF files
- ✅ Convert PDF to Word
- ✅ Convert PDF to Excel
- ✅ Convert PDF to PowerPoint
- ✅ Convert PDF to JPG images
- ✅ Convert PDF to PNG images
- ✅ Convert Word to PDF
- ✅ Preview PDF files

**User Management:**
- ✅ User registration
- ✅ User login
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ User logout
- ✅ Session management

### 🚀 Recently Added

1. **PDF to JPG Converter**
   - Converts all PDF pages to JPG images
   - Single page downloads as JPG
   - Multiple pages download as ZIP

2. **PDF to PNG Converter**
   - Converts all PDF pages to PNG images
   - Single page downloads as PNG
   - Multiple pages download as ZIP

3. **Code Refactoring**
   - Modular architecture with utils packages
   - Improved code organization
   - Better error handling
   - Enhanced security
   - Comprehensive documentation

## Directory Structure

```
MyPDF/
├── app.py                    # Main Flask app (refactored, ~420 lines)
├── requirements.txt          # Python dependencies
├── users.db                  # User database
│
├── utils/                    # Utility modules (NEW)
│   ├── __init__.py
│   ├── file_handler.py       # File operations
│   ├── db_manager.py         # Database management
│   ├── pdf_converter.py      # PDF conversions
│   └── validators.py         # Input validation
│
├── static/                   # Frontend files
│   ├── style.css
│   └── script.js
│
├── templates/                # HTML templates
│   ├── home.html
│   ├── merge.html
│   ├── split.html
│   ├── compress.html
│   ├── pdf_to_jpg.html       # NEW
│   ├── pdf_to_png.html       # NEW
│   └── ... (other templates)
│
├── uploads/                  # Temporary files (auto-created)
│
├── CODE_STRUCTURE.md         # Architecture documentation (NEW)
├── REFACTORING_SUMMARY.md    # Changes documentation (NEW)
└── README.md                 # General documentation
```

## Using the Utilities

### File Handler
```python
from utils import secure_upload_file, cleanup_file

# Upload a file
success, path = secure_upload_file(request.files['file'], UPLOAD_FOLDER)
if success:
    print(f"File saved to: {path}")
    cleanup_file(path)  # Remove when done
```

### PDF Converter
```python
from utils import pdf_to_word, pdf_to_jpg, merge_pdfs

# Convert PDF to Word
success, output = pdf_to_word(input_pdf, output_docx)

# Convert PDF to JPG
success, images = pdf_to_jpg(input_pdf, output_folder)

# Merge PDFs
success, merged = merge_pdfs([pdf1, pdf2], output_pdf)
```

### Database Manager
```python
from utils import DatabaseManager

db = DatabaseManager('path/to/db.db')

# Create user
success, user_id = db.create_user('user@example.com', 'John', 'password')

# Authenticate user
success, user_id, name = db.authenticate_user('user@example.com', 'password')

# OAuth user
user_id = db.get_or_create_user('user@example.com', 'John')
```

### Validators
```python
from utils import validate_email, validate_password, validate_page_range

# Validate email
if validate_email('user@example.com'):
    print("Valid email")

# Validate password
is_valid, message = validate_password('mypassword')
if not is_valid:
    print(f"Error: {message}")

# Validate page range
is_valid, pages = validate_page_range('1-5', total_pages=100)
if is_valid:
    start, end = pages
```

## Adding New Features

### Example: Add PDF to DOCX Conversion

**Step 1: Create converter function** (`utils/pdf_converter.py`)
```python
def pdf_to_docx(pdf_path, output_path):
    """Convert PDF to DOCX format"""
    try:
        # Your conversion logic here
        return True, output_path
    except Exception as e:
        return False, str(e)
```

**Step 2: Add to exports** (`utils/__init__.py`)
```python
from .pdf_converter import pdf_to_docx
__all__ = [..., 'pdf_to_docx']
```

**Step 3: Create routes** (`app.py`)
```python
@app.route("/pdf-to-docx")
def pdf_to_docx_page():
    return render_template("pdf_to_docx.html", title="PDF to DOCX")

@app.route("/convert-pdf-to-docx", methods=["POST"])
def convert_pdf_to_docx_route():
    success, pdf_path = secure_upload_file(request.files['pdf'], UPLOAD_FOLDER)
    if not success:
        return jsonify({"error": pdf_path}), 400
    
    output_path = os.path.join(UPLOAD_FOLDER, f"converted_{uuid.uuid4().hex}.docx")
    success, result = pdf_to_docx(pdf_path, output_path)
    
    if success:
        return send_file(output_path, as_attachment=True, download_name="converted.docx")
    else:
        return jsonify({"error": result}), 500
```

**Step 4: Create template** (`templates/pdf_to_docx.html`)
```html
{% extends "base.html" %}
{% block content %}
<div class="merge-hero">
    <h1>PDF to DOCX</h1>
    <input type="file" id="pdfInput" accept="application/pdf">
    <button onclick="convertToDocx()">Convert</button>
</div>
{% endblock %}
```

**Step 5: Add to homepage** (`templates/home.html`)
```html
<div class="tool-card" data-category="convert">
    <i class="fas fa-file-word"></i>
    <h3>PDF to DOCX</h3>
    <a href="/pdf-to-docx">Open Tool</a>
</div>
```

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'utils'"
**Solution:**
- Ensure you're running from the MyPDF directory
- Check that `utils/__init__.py` exists
- Try running: `python -m app`

### Issue: "Cannot convert PDF"
**Solution:**
- Check if PDF file is valid
- Check if it's not corrupted
- Review the error message in the response
- Try with a different PDF file

### Issue: "File not found after conversion"
**Solution:**
- Files are automatically cleaned up
- Check if download completed
- Try the conversion again

### Issue: "Database locked"
**Solution:**
- Restart the application
- Check for multiple running instances
- Remove `users.db` and it will be recreated

## Performance Tips

1. **For Large PDFs (>10MB)**
   - Convert in chunks if possible
   - Monitor memory usage
   - Consider async processing in future

2. **For Batch Operations**
   - Process files one at a time
   - Implement queue system for multiple uploads

3. **For Production**
   - Use Gunicorn instead of Flask dev server
   - Add Nginx as reverse proxy
   - Implement caching with Redis

## Development Workflow

### 1. **Make Changes**
```bash
# Edit files in your editor
# Changes auto-reload in development mode
```

### 2. **Test Changes**
```bash
# App auto-reloads on save
# Test in browser: http://localhost:5000
```

### 3. **Check Errors**
```bash
# View terminal output for error messages
# Check browser console (F12) for frontend errors
```

### 4. **Deploy Changes**
```bash
# When ready for production
# Update requirements.txt if needed
# Test thoroughly before deploying
```

## Useful Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run application
python app.py

# Run with production server
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Clean up test files
rm -r uploads/*

# Database management
sqlite3 users.db  # Open database shell
```

## Frontend Structure

### HTML Templates (`templates/`)
- **base.html**: Base template with navigation
- **home.html**: Homepage with all tools
- **Conversion pages**: Tool-specific pages (pdf_to_jpg.html, etc.)

### CSS Styling (`static/style.css`)
- Responsive design
- Dark/light mode support
- Professional styling

### JavaScript (`static/script.js`)
- File drag & drop
- Form submission
- Download handling
- Theme switching

## API Endpoints

### Authentication
```
POST /signup           - Register new user
POST /login            - Login user
POST /oauth-google     - Google OAuth
POST /oauth-facebook   - Facebook OAuth
GET  /logout           - Logout user
```

### PDF Tools
```
GET  /merge            - Merge page
POST /merge-pdf        - Perform merge
GET  /split            - Split page
POST /split-pdf        - Perform split
GET  /compress         - Compress page
POST /compress-pdf     - Perform compression
```

### Conversions
```
GET  /pdf-to-word      - PDF to Word page
POST /convert-pdf-to-word

GET  /pdf-to-excel     - PDF to Excel page
POST /convert-pdf-to-excel

GET  /pdf-to-jpg       - PDF to JPG page
POST /convert-pdf-to-jpg

GET  /pdf-to-png       - PDF to PNG page
POST /convert-pdf-to-png

GET  /word-to-pdf      - Word to PDF page
POST /convert-word-to-pdf

GET  /pdf-to-powerpoint - PDF to PowerPoint page
POST /convert-pdf-to-powerpoint
```

### Downloads
```
GET /download-word          - Download Word document
GET /download-excel         - Download Excel file
GET /download-powerpoint    - Download PowerPoint file
GET /download-word-to-pdf   - Download converted PDF
```

## Resources

- **Flask Documentation**: https://flask.palletsprojects.com
- **PyPDF**: https://pypdf.org
- **PyMuPDF**: https://pymupdf.readthedocs.io
- **Python-PPTX**: https://python-pptx.readthedocs.io

## Support

For issues or improvements:
1. Check the error logs
2. Review CODE_STRUCTURE.md
3. Check REFACTORING_SUMMARY.md
4. Test with simple files first

---

**Last Updated**: January 29, 2026
**Version**: 2.0 Refactored
**Status**: Production Ready ✅
