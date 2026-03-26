from flask import Flask, request, send_file, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
import warnings
from cryptography.utils import CryptographyDeprecationWarning
warnings.filterwarnings("ignore", category=CryptographyDeprecationWarning)

# Monkey patch for pdf2docx compatibility with Python 3.10+
import collections
import collections.abc
if not hasattr(collections, 'Iterable'):
    collections.Iterable = collections.abc.Iterable

import io
import csv
import zipfile
import sqlite3
import fitz  # PyMuPDF for PDF editing
import re  # Regular expressions for color parsing
from pypdf import PdfReader, PdfWriter
import img2pdf
from pdf2image import convert_from_bytes
from docx2pdf import convert
from pptx import Presentation
import pandas as pd
from datetime import datetime
from functools import wraps
import threading
import time
import shutil

# Import utilities
# Assuming these exist in your project structure, otherwise we can inline them or keep them if they are pure python
from utils import (
    DatabaseManager, secure_upload_file, cleanup_files,
    merge_pdfs, split_pdf, compress_pdf,
    pdf_to_word, word_to_pdf, pdf_to_excel, pdf_to_jpg, pdf_to_png,
    create_image_zip, add_text_to_pdf, rotate_pdf_pages, delete_pdf_pages, extract_pdf_page,
    validate_email, validate_password, validate_page_range, validate_form_data,
    convert_url_to_pdf
)
from utils.pdf_converter import (
    add_watermark_to_pdf, add_page_numbers_to_pdf, add_image_to_pdf,
    draw_rectangle_on_pdf, draw_circle_on_pdf, highlight_text_in_pdf,
    blank_page_in_pdf, draw_line_on_pdf, apply_multiple_edits,
    pdf_to_images, pdf_to_powerpoint
)
from libreoffice_converter import LibreOfficeConverter

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default-insecure-key-for-dev-only")

# Session Config for Cross-Domain (Vercel <-> Render) vs Local
# Require "None" and "Secure" for cross-site (prod), but "Lax" and "False" for local http
is_production = os.getenv("FLASK_ENV") == "production" or not os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "t")

app.config.update(
    SESSION_COOKIE_SAMESITE="None" if is_production else "Lax",
    SESSION_COOKIE_SECURE=True if is_production else False,
)

# Start ProxyFix
# This fixes request.scheme to be 'https' when running behind a proxy (like Render)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000", "http://127.0.0.1:3000"] if not is_production else [
        "https://docuflux.in",
        "https://www.docuflux.in",
        "https://docu-flux.vercel.app",
        "https://docuflux-frontend.onrender.com",
    ]
)

# Configure Upload Folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Background thread for cleaning up old files (older than 5 minutes)
def cleanup_old_files():
    while True:
        try:
            now = time.time()
            max_age = 5 * 60  # 5 minutes
            
            for filename in os.listdir(UPLOAD_FOLDER):
                if filename in ['.gitkeep', '.gitignore']:
                    continue
                    
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                mtime = os.path.getmtime(file_path)
                
                if now - mtime > max_age:
                    try:
                        if os.path.isdir(file_path):
                            shutil.rmtree(file_path)
                        else:
                            os.remove(file_path)
                        print(f"[BACKGROUND CLEANUP] Deleted old file/folder: {filename}")
                    except Exception as e:
                        print(f"[BACKGROUND CLEANUP] Failed to delete {filename}: {str(e)}")
        except Exception as e:
            print(f"[BACKGROUND CLEANUP] Thread exception: {str(e)}")
        
        # Check every 1 minute
        time.sleep(60)


# Start the cleanup daemon thread
cleanup_thread = threading.Thread(target=cleanup_old_files, daemon=True)
cleanup_thread.start()

# Database Setup
DB_PATH = os.path.join(BASE_DIR, "users.db")
db = DatabaseManager(DB_PATH)

# --- ADMIN SEEDER ---
# Automatically create or promote ADMIN_EMAIL to super_admin on startup
def seed_super_admin():
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD") or "admin_shadab9262" # Default if not in env
    
    if not admin_email:
        print("[ADMIN SEEDER] Skipping: ADMIN_EMAIL not set in environment.", flush=True)
        return
        
    try:
        hashed_password = generate_password_hash(admin_password)
        
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            # Check if user exists
            row = c.execute("SELECT id, role, password FROM users WHERE email = ?", (admin_email,)).fetchone()
            
            if not row:
                # Create user if doesn't exist
                c.execute("""
                    INSERT INTO users (email, name, password, auth_provider, role, status) 
                    VALUES (?, ?, ?, 'local', 'super_admin', 'active')
                """, (admin_email, "Super Admin", hashed_password))
                conn.commit()
                print(f"[ADMIN SEEDER] Created new super_admin: {admin_email}", flush=True)
            else:
                user_id, role, current_pw = row
                # Update role if not super_admin
                if role != "super_admin":
                    c.execute("UPDATE users SET role = 'super_admin' WHERE id = ?", (user_id,))
                    print(f"[ADMIN SEEDER] Promoted {admin_email} to super_admin", flush=True)
                
                # Update password if it doesn't match the one in ENV (idempotent update)
                # We can't easily check hash equality, but we can force update if ADMIN_PASSWORD is set explicitly
                if os.getenv("ADMIN_PASSWORD"):
                    c.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, user_id))
                    print(f"[ADMIN SEEDER] Updated password for {admin_email}", flush=True)
                
                conn.commit()
    except Exception as e:
        print(f"[ADMIN SEEDER] Error: {e}", flush=True)

seed_super_admin()

@app.route("/debug-admin", methods=["GET"])
def debug_admin():
    """Check if the admin user exists in the database (simple status check)"""
    admin_email = os.getenv("ADMIN_EMAIL")
    if not admin_email:
        return jsonify({"status": "error", "message": "ADMIN_EMAIL not set"}), 400
        
    try:
        with sqlite3.connect(DB_PATH) as conn:
            row = conn.execute("SELECT id, role FROM users WHERE email = ?", (admin_email,)).fetchone()
            if row:
                return jsonify({
                    "status": "ok",
                    "admin_found": True,
                    "email": admin_email,
                    "role": row[1]
                })
            else:
                return jsonify({
                    "status": "ok",
                    "admin_found": False,
                    "email": admin_email
                })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Check for LibreOffice at startup
try:
    from libreoffice_converter import LibreOfficeConverter
    if not LibreOfficeConverter.is_available():
        print("\n" + "!"*60)
        print("WARNING: LibreOffice not found!")
        print("Scanned PDF conversion will fall back to image-mode (non-editable).")
        print("To enable full OCR/Conversion, please install LibreOffice:")
        print("https://www.libreoffice.org/download/download/")
        print("!"*60 + "\n")
    else:
        print(f"\n[INFO] LibreOffice detected at: {LibreOfficeConverter.find_libreoffice()}\n")
except Exception as e:
    print(f"\n[WARNING] Could not verify LibreOffice status: {e}\n")

# --- AUTH ROUTES ---

@app.route("/signup", methods=["POST"])
def signup():
    """Register new user"""
    try:
        data = request.get_json()
        email = data.get("email", "").strip()
        name = data.get("name", "").strip()
        password = data.get("password", "").strip()
        
        if not email or not name or not password:
            return jsonify({"error": "All fields are required"}), 400
        
        if not validate_email(email):
            return jsonify({"error": "Invalid email format"}), 400
        
        is_valid, msg = validate_password(password)
        if not is_valid:
            return jsonify({"error": msg}), 400
        
        success, result = db.create_user(email, name, password)
        if success:
            session['user_id'] = result
            session['user_name'] = name
            return jsonify({"success": True, "message": "Account created successfully"})
        else:
            return jsonify({"error": result}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    """Login user"""
    try:
        data = request.get_json()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400
        
        success, user_id, result = db.authenticate_user(email, password)
        if success:
            session['user_id'] = user_id
            session['user_name'] = result
            return jsonify({"success": True, "message": "Logged in successfully", "user": {"name": result}})
        else:
            return jsonify({"error": result}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out"})

@app.route("/me", methods=["GET"])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"authenticated": False}), 200
    
    success, result = db.get_user_by_id(user_id)
    if success:
        return jsonify({"authenticated": True, "user": result})
    return jsonify({"authenticated": False}), 200

# --- ADMIN DECORATORS & ROUTES ---

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        
        user_id = session.get('user_id')
        success, user = db.get_user_by_id(user_id)
        
        if not success or user['role'] not in ['admin', 'super_admin']:
            return jsonify({"error": "Admin access required"}), 403
            
        return f(*args, **kwargs)
    return decorated_function

def super_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        
        user_id = session.get('user_id')
        success, user = db.get_user_by_id(user_id)
        
        if not success or user['role'] != 'super_admin':
            return jsonify({"error": "Super Admin access required"}), 403
            
        return f(*args, **kwargs)
    return decorated_function

@app.route("/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    """Get dashboard overview stats"""
    success, stats = db.get_admin_stats()
    if success:
        return jsonify(stats)
    return jsonify({"error": stats}), 500

@app.route("/admin/users", methods=["GET"])
@admin_required
def admin_users():
    """List and search users"""
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    role = request.args.get('role')
    success, users = db.get_all_users(limit, offset, role)
    if success:
        return jsonify({"users": users})
    return jsonify({"error": users}), 500

@app.route("/admin/users/<int:user_id>", methods=["PATCH", "DELETE"])
@admin_required
def admin_handle_user(user_id):
    """Update or delete user account"""
    if request.method == "DELETE":
        # Check if user is trying to delete an admin/super_admin (only super_admins should do this, but standard admins can't even see them now)
        success, user_to_delete = db.get_user_by_id(user_id)
        if success and user_to_delete['role'] in ['admin', 'super_admin']:
             return jsonify({"error": "Admin accounts must be managed through the Admin Management section"}), 403
             
        success, message = db.delete_user(user_id)
        if success:
            db.log_activity(session.get('user_id'), "DELETE_USER", f"Permanently deleted user {user_id}")
            return jsonify({"success": True, "message": message})
        return jsonify({"error": message}), 400
        
    data = request.get_json()
    status = data.get('status')
    role = data.get('role')
    
    success, message = db.update_user_status_role(user_id, status, role)
    if success:
        db.log_activity(session.get('user_id'), "UPDATE_USER", f"Updated user {user_id}: {data}")
        return jsonify({"success": True, "message": message})
    return jsonify({"error": message}), 400

@app.route("/admin/files", methods=["GET"])
@admin_required
def admin_files():
    """List processed files history"""
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    success, files = db.get_processed_files(limit, offset)
    if success:
        return jsonify({"files": files})
    return jsonify({"error": files}), 500

@app.route("/update-profile", methods=["POST"])
def update_profile():
    """Update user profile"""
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
            
        data = request.get_json()
        user_id = session['user_id']
        name = data.get("name", "").strip()
        password = data.get("password", "").strip()
        
        if not name:
            return jsonify({"error": "Name is required"}), 400
            
        # Optional: Validate password strength if provided
        if password:
            is_valid, msg = validate_password(password)
            if not is_valid:
                return jsonify({"error": msg}), 400
        else:
            password = None # Don't update if empty
            
        success, msg = db.update_user(user_id, name, password)
        
        if success:
            session['user_name'] = name # Update session
            return jsonify({"success": True, "message": msg})
        else:
            return jsonify({"error": msg}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/delete-account", methods=["POST"])
def delete_account():
    """Delete user account with password verification"""
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
            
        data = request.get_json()
        password = data.get("password", "").strip()
        user_id = session['user_id']
        
        if not password:
            return jsonify({"error": "Password required to confirm deletion"}), 400
            
        # Fetch user email by ID
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute("SELECT email FROM users WHERE id = ?", (user_id,))
            row = c.fetchone()
            
        if not row:
            session.clear()
            return jsonify({"error": "User not found"}), 404
            
        email = row[0]
        
        # Verify password
        success, _, _ = db.authenticate_user(email, password)
        if not success:
             return jsonify({"error": "Incorrect password"}), 401
             
        # Proceed to delete
        success, msg = db.delete_user(user_id)
        
        if success:
            session.clear()
            return jsonify({"success": True, "message": "Account deleted permanently"})
        else:
            return jsonify({"error": msg}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        return jsonify({"error": str(e)}), 500

# --- SOCIAL AUTH ROUTES ---

# --- OAUTH CONFIGURATION ---
from authlib.integrations.flask_client import OAuth

oauth = OAuth(app)
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    access_token_url='https://oauth2.googleapis.com/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',  # This is only for OpenID Connect compliant
    client_kwargs={'scope': 'email profile'},
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration'
)


# --- SOCIAL AUTH ROUTES ---

@app.route("/auth/google", methods=["GET"])
def auth_google():
    """Redirect to Google OAuth"""
    # Store the referrer (frontend URL) in session to redirect back correctly
    frontend_url = request.args.get('next') or request.headers.get('Referer')
    if frontend_url:
        session['frontend_url'] = frontend_url
        
    redirect_uri = url_for('auth_google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@app.route("/auth/google/callback", methods=["GET"])
def auth_google_callback():
    """Handle Google OAuth Callback"""
    try:
        # Debug: Check if environment variables are loaded
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            return jsonify({"error": "GOOGLE_CLIENT_ID not configured"}), 500
        
        print(f"[DEBUG] Using Client ID: {client_id[:20]}...")  # Log first 20 chars
        
        token = oauth.google.authorize_access_token()
        user_info = oauth.google.userinfo()
        
        email = user_info.get('email')
        name = user_info.get('name', 'Google User')
        google_id = user_info.get('sub') # 'sub' is the unique ID in OIDC
        
        if not email:
            return jsonify({"error": "Google did not return an email address."}), 400
            
        success, result = db.get_or_create_google_user(email, name, google_id)
        
        if success:
            user_id = result
            session['user_id'] = user_id
            session['user_name'] = name
            
            # Redirect to Dashboard based on stored session or default logic
            frontend_url = session.pop('frontend_url', None)
            
            if frontend_url:
                 # simplistic check to ensure we don't redirect to google or weird places if referer was weird
                 # but for now, trusting it if it matches our known domains or is localhost
                 return redirect(frontend_url)
            
            # Fallback Logic
            if "localhost" in request.host:
                return redirect("http://localhost:3000/")
            else:
                return redirect("https://www.docuflux.in/")
        else:
            return jsonify({"error": f"Database error: {result}"}), 500
            
    except Exception as e:
        print(f"[ERROR] OAuth Exception: {type(e).__name__}: {str(e)}")
        return jsonify({"error": f"OAuth failed: {str(e)}"}), 500

@app.route("/auth/facebook", methods=["GET"])
def auth_facebook():
    """Redirect to Facebook OAuth"""
    # TODO: Replace with your actual App ID and Redirect URI
    FB_CLIENT_ID = os.getenv("FACEBOOK_APP_ID", "YOUR_FB_APP_ID_HERE")
    REDIRECT_URI = "http://localhost:3000/auth/callback/facebook"
    
    oauth_url = (
        f"https://www.facebook.com/v12.0/dialog/oauth"
        f"?client_id={FB_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope=email"
    )
    return redirect(oauth_url)

@app.route("/auth/apple", methods=["GET"])
def auth_apple():
    """Redirect to Apple OAuth"""
    # TODO: Replace with your actual Service ID and Redirect URI
    APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID", "YOUR_APPLE_SERVICE_ID_HERE")
    REDIRECT_URI = "http://localhost:3000/auth/callback/apple"
    
    oauth_url = (
        f"https://appleid.apple.com/auth/authorize"
        f"?client_id={APPLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=name%20email"
        f"&response_mode=form_post"
    )
    return redirect(oauth_url)

# --- API ROUTES ---

@app.route('/')
def api_root():
    return jsonify({"status": "API Running", "message": "Please use the Next.js Frontend"})

@app.route('/merge-pdf', methods=['POST'])
def merge_pdf_route():
    try:
        if 'pdfs' not in request.files:
            return jsonify({"error": "No files uploaded"}), 400
        
        files = request.files.getlist('pdfs')
        if not files or len(files) < 2:
            return jsonify({"error": "Please upload at least 2 PDF files"}), 400

        pdf_paths = []
        for file in files:
            success, path = secure_upload_file(file, UPLOAD_FOLDER)
            if success:
                pdf_paths.append(path)
        
        output_path = os.path.join(UPLOAD_FOLDER, f"merged_{os.urandom(4).hex()}.pdf")
        success, result = merge_pdfs(pdf_paths, output_path)
        
        if success:
            db.log_processed_file(session.get('user_id'), "merge", "success")
            cleanup_files(pdf_paths) # Clean inputs
            return send_file(output_path, as_attachment=True, download_name="merged.pdf")
        else:
            db.log_processed_file(session.get('user_id'), "merge", "failed")
            cleanup_files(pdf_paths)
            return jsonify({"error": result}), 500
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "merge", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/split-pdf', methods=['POST'])
def split_pdf_route():
    try:
        if 'pdf' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['pdf']
        page_ranges_str = request.form.get('pageRanges')
        
        success, pdf_path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success: return jsonify({"error": "Upload failed"}), 400

        # Get total pages to validate ranges
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)

        # If no range provided, split every page
        print(f"[DEBUG] Split PDF request. Total pages in PDF: {total_pages}")
        
        # Robust check for "split all"
        is_split_all = not page_ranges_str or page_ranges_str.strip() == "" or page_ranges_str.lower() in ("null", "undefined", "none")
        
        if is_split_all:
            ranges = [(i, i) for i in range(1, total_pages + 1)]
            print(f"[DEBUG] No ranges or falsy ranges provided. Splitting every page: {len(ranges)} files")
        else:
            print(f"[DEBUG] Parsing ranges from: {page_ranges_str}")
            success_val, ranges = validate_page_range(page_ranges_str, total_pages)
            if not success_val:
                print(f"[DEBUG] Validation failed: {ranges}")
                cleanup_files([pdf_path])
                return jsonify({"error": ranges}), 400
            print(f"[DEBUG] Validated ranges: {ranges}")

        output_dir = os.path.join(UPLOAD_FOLDER, f"split_{os.urandom(4).hex()}")
        os.makedirs(output_dir, exist_ok=True)
        
        success_split, result = split_pdf(pdf_path, ranges, output_dir)
        print(f"[DEBUG] split_pdf success: {success_split}, result files: {len(result) if success_split else result}")
        
        if success_split:
            db.log_processed_file(session.get('user_id'), "split", "success")
            cleanup_files([pdf_path])
            
            # If only one file was created, send it directly
            if len(result) == 1:
                return send_file(result[0], as_attachment=True, download_name="split.pdf")
            
            # Otherwise, ZIP them up
            zip_path = output_dir + ".zip"
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for f in result:
                    zipf.write(f, os.path.basename(f))
            
            # Cleanup the individual files and directory after zipping
            cleanup_files(result)
            try:
                os.rmdir(output_dir)
            except: pass
            
            return send_file(zip_path, as_attachment=True, download_name="split_files.zip")
        else:
            db.log_processed_file(session.get('user_id'), "split", "failed")
            cleanup_files([pdf_path])
            return jsonify({"error": result}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/compress-pdf', methods=['POST'])
def compress_pdf_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        
        reader = PdfReader(path)
        writer = PdfWriter()
        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)
        writer.add_metadata({})
        
        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
        cleanup_files([path])
        db.log_processed_file(session.get('user_id'), "compress", "success")
        return send_file(out, as_attachment=True, download_name="compressed.pdf", mimetype="application/pdf")
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "compress", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/convert-pdf-to-word', methods=['POST'])
def convert_p2w():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success: return jsonify({"error": "Upload failed"}), 400
        
        output_path = os.path.splitext(path)[0] + ".docx"
        success, result = pdf_to_word(path, output_path)
        
        if success:
            db.log_processed_file(session.get('user_id'), "pdf_to_word", "success", os.path.getsize(output_path))
            cleanup_files([path])
            return send_file(output_path, as_attachment=True, download_name="converted.docx")
        else:
            db.log_processed_file(session.get('user_id'), "pdf_to_word", "failed")
            cleanup_files([path])
            return jsonify({"error": result}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/convert-word-to-pdf', methods=['POST'])
def convert_w2p():
    try:
        if 'word' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['word']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success: return jsonify({"error": "Upload failed"}), 400
        
        output_path = os.path.splitext(path)[0] + ".pdf"
        success, result = word_to_pdf(path, output_path)
        
        if success:
            db.log_processed_file(session.get('user_id'), "word_to_pdf", "success", os.path.getsize(output_path))
            cleanup_files([path])
            return send_file(output_path, as_attachment=True, download_name="converted.pdf")
        else:
            db.log_processed_file(session.get('user_id'), "word_to_pdf", "failed")
            cleanup_files([path])
            return jsonify({"error": result}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/convert-pdf-to-excel', methods=['POST'])
def convert_p2e():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success: return jsonify({"error": "Upload failed"}), 400
        
        output_path = os.path.splitext(path)[0] + ".xlsx"
        success, result = pdf_to_excel(path, output_path)
        
        if success:
            db.log_processed_file(session.get('user_id'), "pdf_to_excel", "success")
            cleanup_files([path])
            return send_file(output_path, as_attachment=True, download_name="converted.xlsx")
        else:
            db.log_processed_file(session.get('user_id'), "pdf_to_excel", "failed")
            cleanup_files([path])
            return jsonify({"error": result}), 500
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "pdf_to_excel", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/convert-pdf-to-powerpoint', methods=['POST'])
def convert_p2ppt():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success: return jsonify({"error": "Upload failed"}), 400
        
        output_path = os.path.splitext(path)[0] + ".pptx"
        success, result_path = pdf_to_powerpoint(path, output_path)
        
        if success:
            db.log_processed_file(session.get('user_id'), "pdf_to_powerpoint", "success")
            cleanup_files([path])
            return send_file(output_path, as_attachment=True, download_name="converted.pptx")
        else:
            db.log_processed_file(session.get('user_id'), "pdf_to_powerpoint", "failed")
            cleanup_files([path])
            return jsonify({"error": "Conversion failed"}), 500
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "pdf_to_powerpoint", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/convert-excel-to-pdf', methods=['POST'])
def convert_e2p():
    try:
        if 'excel' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['excel']
        success, path = secure_upload_file(file, UPLOAD_FOLDER, allowed_exts={'xlsx', 'xls'})
        if not success: return jsonify({"error": "Upload failed"}), 400
        
        output_path = os.path.splitext(path)[0] + ".pdf"
        success = LibreOfficeConverter.convert(path, output_path, output_format="pdf")
        
        if success:
            db.log_processed_file(session.get('user_id'), "excel_to_pdf", "success")
            cleanup_files([path])
            return send_file(output_path, as_attachment=True, download_name="converted.pdf")
        else:
            db.log_processed_file(session.get('user_id'), "excel_to_pdf", "failed")
            cleanup_files([path])
            return jsonify({"error": "Conversion failed"}), 500
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "excel_to_pdf", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/convert-powerpoint-to-pdf', methods=['POST'])
def convert_ppt2p():
    try:
        if 'powerpoint' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['powerpoint']
        success, path = secure_upload_file(file, UPLOAD_FOLDER, allowed_exts={'pptx', 'ppt'})
        if not success: return jsonify({"error": "Upload failed"}), 400
        
        output_path = os.path.splitext(path)[0] + ".pdf"
        success = LibreOfficeConverter.convert(path, output_path, output_format="pdf")
        
        if success:
            db.log_processed_file(session.get('user_id'), "powerpoint_to_pdf", "success")
            cleanup_files([path])
            return send_file(output_path, as_attachment=True, download_name="converted.pdf")
        else:
            db.log_processed_file(session.get('user_id'), "powerpoint_to_pdf", "failed")
            cleanup_files([path])
            return jsonify({"error": "Conversion failed"}), 500
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "powerpoint_to_pdf", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/convert-jpg-to-pdf', methods=['POST'])
def convert_j2p():
    try:
        if 'images' not in request.files: return jsonify({"error": "No files"}), 400
        files = request.files.getlist('images')
        
        paths = []
        for file in files:
            success, path = secure_upload_file(file, UPLOAD_FOLDER, allowed_exts={'jpg', 'jpeg', 'png'})
            if success: paths.append(path)
            
        if not paths: return jsonify({"error": "No valid images"}), 400
        
        output_path = os.path.join(UPLOAD_FOLDER, f"converted_{os.urandom(4).hex()}.pdf")
        with open(output_path, "wb") as f:
            f.write(img2pdf.convert(paths))
            
        db.log_processed_file(session.get('user_id'), "jpg_to_pdf", "success")
        cleanup_files(paths)
        return send_file(output_path, as_attachment=True, download_name="converted.pdf")
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "jpg_to_pdf", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/watermark-pdf', methods=['POST'])
def watermark_pdf_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        
        options = {
            'type': request.form.get('type', 'text'),
            'text': request.form.get('text', 'DocuFlux'),
            'position': request.form.get('position', 'center'),
            'mosaic': request.form.get('mosaic', 'false'),
            'transparency': request.form.get('transparency', 50),
            'rotation': request.form.get('rotation', 0),
            'color': request.form.get('color', '#000000'),
            'fontSize': request.form.get('fontSize', 48)
        }
        
        if options['type'] == 'image' and 'image' in request.files:
            img_file = request.files['image']
            success_img, img_path = secure_upload_file(img_file, UPLOAD_FOLDER, allowed_exts={'png', 'jpg', 'jpeg'})
            if success_img:
                options['image_path'] = img_path
        
        file = request.files['pdf']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        
        output_path = os.path.join(UPLOAD_FOLDER, f"watermarked_{os.urandom(4).hex()}.pdf")
        success, result = add_watermark_to_pdf(path, output_path, options)
        
        # Cleanup
        files_to_cleanup = [path]
        if options.get('image_path') and os.path.exists(options['image_path']):
            files_to_cleanup.append(options['image_path'])
            
        if success:
            db.log_processed_file(session.get('user_id'), "watermark", "success")
            cleanup_files(files_to_cleanup)
            return send_file(output_path, as_attachment=True, download_name="watermarked.pdf")
        else:
            db.log_processed_file(session.get('user_id'), "watermark", "failed")
            cleanup_files(files_to_cleanup)
            return jsonify({"error": result}), 500
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "watermark", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/rotate-pdf', methods=['POST'])
def rotate_pdf_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        angle = int(request.form.get('angle', 90))
        
        file = request.files['pdf']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        
        reader = PdfReader(path)
        writer = PdfWriter()
        for page in reader.pages:
            page.rotate(angle)
            writer.add_page(page)
            
        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
        cleanup_files([path])
        db.log_processed_file(session.get('user_id'), "rotate", "success")
        return send_file(out, as_attachment=True, download_name="rotated.pdf", mimetype="application/pdf")
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "rotate", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/protect-pdf', methods=['POST'])
def protect_pdf_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        password = request.form.get('password')
        if not password: return jsonify({"error": "Password required"}), 400
        
        file = request.files['pdf']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        
        reader = PdfReader(path)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        writer.encrypt(password)
        
        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
        cleanup_files([path])
        db.log_processed_file(session.get('user_id'), "protect", "success")
        return send_file(out, as_attachment=True, download_name="protected.pdf", mimetype="application/pdf")
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "protect", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/unlock-pdf', methods=['POST'])
def unlock_pdf_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        password = request.form.get('password', '')
        
        file = request.files['pdf']
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        
        doc = fitz.open(path)
        
        if doc.needs_pass:
            is_unlocked = False
            
            # 1. Try provided password
            if password and doc.authenticate(password):
                is_unlocked = True
            # 2. Try empty password (bypasses owner protection)
            elif doc.authenticate(""):
                is_unlocked = True
            else:
                # 3. Simple dictionary attack with common passwords
                common_passwords = [
                    "1234", "123456", "password", "test", "0000", "1111",
                    "admin", "123123", "qwerty", "pdf", "123", "12345"
                ]
                for cp in common_passwords:
                    if doc.authenticate(cp):
                        is_unlocked = True
                        break
                        
            if not is_unlocked:
                doc.close()
                cleanup_files([path])
                return jsonify({"error": "Could not crack the PDF. Please provide the correct password."}), 400
                
        output_path = os.path.join(UPLOAD_FOLDER, f"unlocked_{os.urandom(4).hex()}.pdf")
        doc.save(output_path)
        doc.close()
        
        with open(output_path, "rb") as f:
            out = io.BytesIO(f.read())
        out.seek(0)
        
        cleanup_files([path, output_path])
        db.log_processed_file(session.get('user_id'), "unlock", "success")
        return send_file(out, as_attachment=True, download_name="unlocked.pdf", mimetype="application/pdf")
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "unlock", "failed")
        return jsonify({"error": str(e)}), 500

@app.route('/organize-pdf', methods=['POST'])
def organize_pdf_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        
        # Expecting a comma-separated list of 0-based page indices
        # representing the new order.
        # e.g., "0,2,1" means: keep page 0, then page 2, then page 1.
        page_order_str = request.form.get('pageOrder', '')
        if not page_order_str:
            return jsonify({"error": "No page order provided"}), 400
            
        try:
            page_order = [int(x.strip()) for x in page_order_str.split(',')]
        except ValueError:
            return jsonify({"error": "Invalid page order format"}), 400
            
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success:
            return jsonify({"error": "Upload failed"}), 400
            
        src_doc = fitz.open(path)
        
        # Verify indices
        for idx in page_order:
            if idx < 0 or idx >= src_doc.page_count:
                src_doc.close()
                cleanup_files([path])
                return jsonify({"error": f"Invalid page index: {idx}"}), 400
                
        # select() efficiently reorders and deletes pages in place
        src_doc.select(page_order)
        
        output_path = os.path.join(UPLOAD_FOLDER, f"organized_{os.urandom(4).hex()}.pdf")
        src_doc.save(output_path)
        
        src_doc.close()
        
        with open(output_path, "rb") as f:
            out = io.BytesIO(f.read())
        out.seek(0)
        
        cleanup_files([path, output_path])
        db.log_processed_file(session.get('user_id'), "organize", "success")
        return send_file(out, as_attachment=True, download_name=f"organized_{file.filename}")
        
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "organize", "failed")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

import subprocess

@app.route('/pdf-to-pdfa', methods=['POST'])
def pdf_to_pdfa_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success:
            return jsonify({"error": "Upload failed"}), 400
            
        output_path = os.path.join(UPLOAD_FOLDER, f"pdfa_{os.urandom(4).hex()}.pdf")
        
        # Priority to manual local installation, then system PATH
        local_gs = r"D:\DocuFlux\gs\bin\gswin64c.exe"
        if os.path.exists(local_gs):
            gs_cmd = local_gs
        else:
            gs_cmd = "gswin64c" if os.name == 'nt' else "gs"
        
        cmd = [
            gs_cmd,
            "-dPDFA=2",
            "-dBATCH",
            "-dNOPAUSE",
            "-dNOOUTERSAVE",
            "-sColorConversionStrategy=UseDeviceIndependentColor",
            "-sDEVICE=pdfwrite",
            "-dPDFACompatibilityPolicy=1",
            f"-sOutputFile={output_path}",
            path
        ]
        
        try:
            # Run Ghostscript silently and block until finished
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)
            
            if result.returncode != 0:
                print("Ghostscript Error:", result.stderr)
                cleanup_files([path])
                return jsonify({"error": f"Failed to convert to PDF/A. GS Error: {result.stderr[:200]}"}), 500
        except subprocess.TimeoutExpired:
            cleanup_files([path])
            return jsonify({"error": "Conversion timed out"}), 500
        except FileNotFoundError:
            cleanup_files([path])
            return jsonify({"error": "Ghostscript (gs) is not found. Please install it or ensure it is in the path."}), 500
            
        # Send the PDF/A file back
        with open(output_path, "rb") as f:
            out = io.BytesIO(f.read())
        out.seek(0)
        
        cleanup_files([path, output_path])
        
        # Determine strict name
        fname = file.filename
        if fname.lower().endswith(".pdf"):
            fname = fname[:-4] + "_PDFA.pdf"
        else:
            fname = "archive_PDFA.pdf"
            
        return send_file(out, as_attachment=True, download_name=fname, mimetype="application/pdf")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/repair-pdf', methods=['POST'])
def repair_pdf_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success:
            return jsonify({"error": "Upload failed"}), 400
            
        output_path = os.path.join(UPLOAD_FOLDER, f"repaired_{os.urandom(4).hex()}.pdf")
        
        # Method 1: PyMuPDF auto-repair (works for structure issues)
        found_method1 = False
        try:
            doc = fitz.open(path)
            # Saving with garbage collection and clean can fix many issues
            # We use liberal flags here
            doc.save(output_path, garbage=4, deflate=True, clean=True, linear=True)
            doc.close()
            found_method1 = True
        except Exception as e:
            print(f"PyMuPDF repair failed: {e}")

        # Method 2: Ghostscript re-distillation (the industry standard for "fixing" broken PDFs)
        gs_output_path = os.path.join(UPLOAD_FOLDER, f"gs_repaired_{os.urandom(4).hex()}.pdf")
        
        local_gs = r"D:\DocuFlux\gs\bin\gswin64c.exe"
        gs_cmd = local_gs if os.path.exists(local_gs) else ("gswin64c" if os.name == 'nt' else "gs")
        
        # Use more aggressive "ignore errors" flags for Ghostscript
        cmd = [
            gs_cmd,
            "-dBATCH",
            "-dNOPAUSE",
            "-dQUIET",
            "-dPDFSTOPONERROR=false",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            "-dPDFSETTINGS=/prepress",
            f"-sOutputFile={gs_output_path}",
            path
        ]
        
        temp_to_clean = []
        final_output = None

        try:
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=90)
            if result.returncode == 0 and os.path.exists(gs_output_path) and os.path.getsize(gs_output_path) > 1000:
                final_output = gs_output_path
                if found_method1: temp_to_clean.append(output_path)
            else:
                print(f"Ghostscript might have failed or produced empty file. Code: {result.returncode}")
                if found_method1:
                    final_output = output_path
                    temp_to_clean.append(gs_output_path)
        except Exception as gs_err:
            print(f"Ghostscript subprocess failed: {gs_err}")
            if found_method1:
                final_output = output_path
            else:
                return jsonify({"error": "Failed to repair PDF. The file structure is too severely damaged for recovery."}), 500

        if not final_output or not os.path.exists(final_output):
            cleanup_files([path])
            return jsonify({"error": "Unable to reconstruct the PDF archive."}), 500

        # Send the repaired file
        with open(final_output, "rb") as f:
            out = io.BytesIO(f.read())
        out.seek(0)
        
        temp_to_clean.append(path)
        temp_to_clean.append(final_output)
        cleanup_files(temp_to_clean)
        
        db.log_processed_file(session.get('user_id'), "repair", "success")
        return send_file(out, as_attachment=True, download_name=f"repaired_{file.filename}", mimetype="application/pdf")
    except Exception as e:
        db.log_processed_file(session.get('user_id'), "repair", "failed")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/page-numbers', methods=['POST'])
def add_page_numbers_route():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        
        # Extract options
        options = {
            'firstNumber': request.form.get('firstNumber', 1),
            'fromPage': request.form.get('fromPage', 1),
            'toPage': request.form.get('toPage', 999999),
            'position': request.form.get('position', 'bottom-right'),
            'margin': request.form.get('margin', 'Recommended'),
            'pageMode': request.form.get('pageMode', 'single'),
            'fontSize': request.form.get('fontSize', 12),
            'fontColor': request.form.get('fontColor', '#000000'),
            'format': request.form.get('format', '{n}')
        }
        
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success: return jsonify({"error": "Upload failed"}), 400
        
        output_path = os.path.join(UPLOAD_FOLDER, f"numbered_{os.urandom(4).hex()}.pdf")
        success, result = add_page_numbers_to_pdf(path, output_path, options)
        
        if success:
            db.log_processed_file(session.get('user_id'), "page_numbers", "success")
            cleanup_files([path])
            return send_file(output_path, as_attachment=True, download_name=f"numbered_{file.filename}")
        else:
            db.log_processed_file(session.get('user_id'), "page_numbers", "failed")
            cleanup_files([path])
            return jsonify({"error": result}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/convert-pdf-to-image', methods=['POST'])
def convert_p2img():
    try:
        if 'pdf' not in request.files: return jsonify({"error": "No file"}), 400
        file = request.files['pdf']
        image_format = request.form.get('format', 'png').lower()
        if image_format not in ['png', 'jpg', 'jpeg']:
            image_format = 'png'
            
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success: return jsonify({"error": "Upload failed"}), 400
        
        # Create a subfolder for images
        output_folder_name = f"images_{os.urandom(4).hex()}"
        output_folder = os.path.join(UPLOAD_FOLDER, output_folder_name)
        os.makedirs(output_folder, exist_ok=True)
        
        success, result = pdf_to_images(path, output_folder, image_format=image_format)
            
        if success:
            image_files = result
            zip_path = os.path.join(UPLOAD_FOLDER, f"{output_folder_name}.zip")
            success_zip, zip_result = create_image_zip(image_files, zip_path)
            
            if success_zip:
                cleanup_files([path])
                return send_file(zip_result, as_attachment=True, download_name="images.zip")
            else:
                cleanup_files([path])
                return jsonify({"error": "Failed to zip images"}), 500
        else:
            cleanup_files([path])
            return jsonify({"error": result}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/convert-html-to-pdf', methods=['POST'])
def convert_html_to_pdf_route():
    try:
        data = request.json
        if not data or not data.get('url'):
            return jsonify({"error": "URL is required"}), 400
            
        url = data.get('url')
        
        # Parse page size
        page_size_str = data.get('pageSize', 'A4')
        if 'A4' in page_size_str:
            page_size = 'A4'
        elif 'A3' in page_size_str:
            page_size = 'A3'
        elif 'A5' in page_size_str:
            page_size = 'A5'
        elif 'US Letter' in page_size_str:
            page_size = 'Letter'
        else:
            page_size = 'A4'
            
        # Build options dictionary
        orientation_str = data.get('orientation', 'Portrait').lower()
        margins_str = data.get('margins', 'No margin')
        
        options = {
            'page_size': page_size,
            'one_long_page': data.get('oneLongPage', False),
            'orientation': orientation_str,
            'margins': margins_str,
            'block_ads': data.get('blockAds', False),
            'remove_popups': data.get('removePopups', False)
        }
        
        # Parse screen size
        screen_size_str = data.get('screenSize', '1536px')
        width = 1536
        if '1920px' in screen_size_str:
            width = 1920
        elif '1440px' in screen_size_str:
            width = 1440
        elif '768px' in screen_size_str:
            width = 768
        elif '320px' in screen_size_str:
            width = 320
        
        # Assuming 16:9 ratio approximately for height unless mobile
        height = int(width * 9/16) if width > 768 else int(width * 16/9)
        options['screen_size'] = (width, height)
        
        output_path = os.path.join(UPLOAD_FOLDER, f"html_{os.urandom(4).hex()}.pdf")
        
        success, result = convert_url_to_pdf(url, output_path, options)
        
        if success:
            # We don't need cleanup_files for input since it's a URL
            # but we should ideally serve it and maybe delete later. The background thread handles old files.
            return send_file(output_path, as_attachment=True, download_name="webpage.pdf")
        else:
            return jsonify({"error": result}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/edit-pdf', methods=['POST'])
def edit_pdf_route():
    """Edit PDF text - Sejda-style reconstruction"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        edits_json = request.form.get('edits', '[]')
        elements_json = request.form.get('elements', '[]')
        
        import json
        edits = json.loads(edits_json)
        elements = json.loads(elements_json)
        
        # Save uploaded file
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success:
            return jsonify({"error": "Failed to upload file"}), 400
        
        # Open PDF with PyMuPDF for editing
        pdf_doc = fitz.open(path)
        
        # Process text edits - hide original and add new text
        for edit in edits:
            page_num = edit.get('page', 1) - 1  # Convert to 0-based index
            
            if 0 <= page_num < len(pdf_doc):
                page = pdf_doc[page_num]
                
                # Get edit properties with preserved styling
                x = float(edit.get('x', 0))
                y = float(edit.get('y', 0))
                width = float(edit.get('width', 100))
                height = float(edit.get('height', 20))
                text = edit.get('text', '')
                font_size = float(edit.get('fontSize', 12))
                font_family = edit.get('fontFamily', 'helv')
                font_weight = edit.get('fontWeight', 'normal')
                color_str = edit.get('color', 'rgb(0, 0, 0)')
                
                # Convert color to RGB tuple (0-1 range)
                # Handle both hex (#000000) and rgb(r, g, b) formats
                if color_str.startswith('#'):
                    color_hex = color_str.lstrip('#')
                    r = int(color_hex[0:2], 16) / 255.0
                    g = int(color_hex[2:4], 16) / 255.0
                    b = int(color_hex[4:6], 16) / 255.0
                    color = (r, g, b)
                elif color_str.startswith('rgb'):
                    # Parse "rgb(r, g, b)" or "rgba(r, g, b, a)"
                    import re
                    rgb_values = re.findall(r'\d+', color_str)
                    if len(rgb_values) >= 3:
                        r = int(rgb_values[0]) / 255.0
                        g = int(rgb_values[1]) / 255.0
                        b = int(rgb_values[2]) / 255.0
                        color = (r, g, b)
                    else:
                        color = (0, 0, 0)
                else:
                    color = (0, 0, 0)
                
                # Step 1: Draw white rectangle over original text
                rect = fitz.Rect(x, y, x + width, y + height)
                page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
                
                # Step 2: Insert new text at the same position with preserved styling
                # Adjust y position for baseline (PyMuPDF uses baseline, not top-left)
                text_point = fitz.Point(x + 2, y + font_size)
                
                # Map CSS font-family to PyMuPDF base font names
                raw_font = str(font_family).lower()
                # Use the first family name in a CSS list and strip quotes
                base_family = raw_font.split(',')[0].strip().strip('"\'')

                if any(name in base_family for name in ['helv', 'helvetica', 'arial', 'sans']):
                    fontname = 'helv'
                elif any(name in base_family for name in ['times', 'serif']):
                    fontname = 'times-roman'
                elif any(name in base_family for name in ['cour', 'courier', 'mono']):
                    fontname = 'cour'
                else:
                    fontname = 'helv'

                # Map font weight to PyMuPDF font names (helv, helv-bold, etc.)
                if 'bold' in font_weight.lower() or (font_weight.isdigit() and int(font_weight) >= 700):
                    if 'helv' in fontname:
                        fontname = 'helv-bold'
                    elif 'times' in fontname:
                        fontname = 'times-bold'
                    elif 'cour' in fontname:
                        fontname = 'cour-bold'
                else:
                    if 'helv' in fontname:
                        fontname = 'helv'
                    elif 'times' in fontname:
                        fontname = 'times-roman'
                    elif 'cour' in fontname:
                        fontname = 'cour'
                
                page.insert_text(
                    text_point,
                    text,
                    fontsize=font_size,
                    color=color,
                    fontname=fontname
                )
        
        # Process additional elements (shapes, images, whiteout, etc.)
        for element in elements:
            elem_type = element.get('type')
            page_num = 0  # Assuming elements are for current page
            
            if elem_type == 'whiteout':
                if 0 <= page_num < len(pdf_doc):
                    page = pdf_doc[page_num]
                    x = float(element.get('x', 0))
                    y = float(element.get('y', 0))
                    width = float(element.get('width', 100))
                    height = float(element.get('height', 40))
                    rect = fitz.Rect(x, y, x + width, y + height)
                    page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
            
            elif elem_type == 'text':
                if 0 <= page_num < len(pdf_doc):
                    page = pdf_doc[page_num]
                    x = float(element.get('x', 0))
                    y = float(element.get('y', 0))
                    text = element.get('text', '')
                    font_size = float(element.get('fontSize', 16))
                    color_str = element.get('color', '#000000')
                    
                    color_hex = color_str.lstrip('#')
                    r = int(color_hex[0:2], 16) / 255.0
                    g = int(color_hex[2:4], 16) / 255.0
                    b = int(color_hex[4:6], 16) / 255.0
                    color = (r, g, b)
                    
                    text_point = fitz.Point(x, y + font_size)
                    page.insert_text(text_point, text, fontsize=font_size, color=color)
            
            elif elem_type == 'shape':
                if 0 <= page_num < len(pdf_doc):
                    page = pdf_doc[page_num]
                    shape_type = element.get('shapeType', 'rectangle')
                    x = float(element.get('x', 0))
                    y = float(element.get('y', 0))
                    width = float(element.get('width', 100))
                    height = float(element.get('height', 50))
                    stroke_width = float(element.get('strokeWidth', 2))
                    color_str = element.get('color', '#000000')
                    
                    color_hex = color_str.lstrip('#')
                    r = int(color_hex[0:2], 16) / 255.0
                    g = int(color_hex[2:4], 16) / 255.0
                    b = int(color_hex[4:6], 16) / 255.0
                    color = (r, g, b)
                    
                    if shape_type == 'rectangle':
                        rect = fitz.Rect(x, y, x + width, y + height)
                        page.draw_rect(rect, color=color, width=stroke_width)
                    elif shape_type == 'circle':
                        cx = x + width / 2
                        cy = y + height / 2
                        radius = min(width, height) / 2
                        page.draw_circle((cx, cy), radius, color=color, width=stroke_width)
                    elif shape_type == 'line':
                        page.draw_line((x, y), (x + width, y + height), color=color, width=stroke_width)
        
        # Save edited PDF
        output_path = os.path.join(UPLOAD_FOLDER, f"edited_{os.urandom(4).hex()}.pdf")
        pdf_doc.save(output_path)
        pdf_doc.close()
        
        # Clean up original file
        cleanup_files([path])
        
        return send_file(output_path, as_attachment=True, download_name=f"edited_{file.filename}")
        
    except Exception as e:
        cleanup_files([path] if 'path' in locals() else [])
        return jsonify({"error": str(e)}), 500

@app.route('/sign-pdf', methods=['POST'])
def sign_pdf_route():
    """Add signatures to PDF document"""
    try:
        if 'pdf' not in request.files:
            return jsonify({"error": "No PDF file uploaded"}), 400
        
        file = request.files['pdf']
        signatures_json = request.form.get('signatures', '[]')
        
        import json
        import base64
        signatures = json.loads(signatures_json)
        
        print(f"Received {len(signatures)} signature(s)")
        for i, sig in enumerate(signatures):
            print(f"Signature {i}: x={sig.get('x')}, y={sig.get('y')}, w={sig.get('width')}, h={sig.get('height')}, page={sig.get('page')}")
        
        if not signatures:
            return jsonify({"error": "No signatures provided"}), 400
        
        # Save uploaded PDF
        success, path = secure_upload_file(file, UPLOAD_FOLDER)
        if not success:
            return jsonify({"error": "Failed to upload file"}), 400
        
        # Open PDF with PyMuPDF
        pdf_doc = fitz.open(path)
        print(f"PDF has {len(pdf_doc)} pages")
        
        # Process each signature
        for sig in signatures:
            page_num = sig.get('page', 1) - 1  # Convert to 0-based index
            print(f"Processing signature for page {page_num + 1}")
            
            if 0 <= page_num < len(pdf_doc):
                page = pdf_doc[page_num]
                
                # Get signature properties
                x = float(sig.get('x', 0))
                y = float(sig.get('y', 0))
                width = float(sig.get('width', 200))
                height = float(sig.get('height', 75))
                sig_data = sig.get('data', '')
                
                print(f"Inserting signature at ({x}, {y}) size ({width}x{height})")
                
                # Decode base64 image data
                try:
                    # Remove data:image/png;base64, prefix if present
                    if 'base64,' in sig_data:
                        sig_data = sig_data.split('base64,')[1]
                    
                    image_bytes = base64.b64decode(sig_data)
                    print(f"Decoded {len(image_bytes)} bytes of signature image")
                    
                    # Save temporary image file
                    temp_img_path = os.path.join(UPLOAD_FOLDER, f"sig_{os.urandom(4).hex()}.png")
                    with open(temp_img_path, 'wb') as img_file:
                        img_file.write(image_bytes)
                    
                    # Ensure coordinates are valid
                    x = max(0, x)
                    y = max(0, y)
                    
                    # Insert image into PDF at the specified coordinates
                    # fitz.Rect creates rectangle: (x1, y1, x2, y2)
                    rect = fitz.Rect(x, y, x + width, y + height)
                    print(f"Inserting at rect: {rect}")
                    page.insert_image(rect, filename=temp_img_path)
                    print("Signature inserted successfully")
                    
                    # Clean up temporary image
                    cleanup_files([temp_img_path])
                    
                except Exception as e:
                    print(f"Error processing signature: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    continue
            else:
                print(f"Page {page_num + 1} out of range (PDF has {len(pdf_doc)} pages)")
        
        # Save signed PDF
        output_path = os.path.join(UPLOAD_FOLDER, f"signed_{os.urandom(4).hex()}.pdf")
        pdf_doc.save(output_path)
        pdf_doc.close()
        
        # Clean up original file
        cleanup_files([path])
        
        print(f"Signed PDF saved to {output_path}")
        return send_file(output_path, as_attachment=True, download_name=f"signed_{file.filename}")
        
    except Exception as e:
        cleanup_files([path] if 'path' in locals() else [])
        print(f"Error in sign_pdf_route: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/admin/logs', methods=['GET'])
@admin_required
def admin_logs():
    """View administrative activity logs"""
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)
    success, logs = db.get_activity_logs(limit, offset)
    if success:
        return jsonify({"logs": logs})
    return jsonify({"error": logs}), 500

@app.route('/admin/files', methods=['GET'])
@admin_required
def admin_processed_files():
    """View file processing history"""
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)
    success, files = db.get_processed_files(limit, offset)
    if success:
        return jsonify({"files": files})
    return jsonify({"error": files}), 500

@app.route('/admin/files/<int:file_id>', methods=['DELETE'])
@admin_required
def admin_delete_processed_file(file_id):
    """Delete a file processing log"""
    success, message = db.delete_processed_file(file_id)
    if success:
        db.log_activity(session.get('user_id'), "DELETE_FILE_LOG", f"Deleted processing log {file_id}")
        return jsonify({"success": True, "message": message})
    return jsonify({"error": message}), 400

@app.route('/admin/tools', methods=['GET', 'PATCH'])
@admin_required
def admin_tool_management():
    """Manage tool availability and maintenance modes"""
    if request.method == 'GET':
        # Default tools list
        tools_list = ["merge", "split", "compress", "pdf_to_word", "word_to_pdf", "repair", "page_numbers"]
        settings = db.get_system_settings()
        
        tools = []
        for t in tools_list:
            tools.append({
                "name": t,
                "enabled": settings.get(f"tool_{t}_enabled", "1") == "1",
                "maintenance": settings.get(f"tool_{t}_maintenance", "0") == "1"
            })
        return jsonify({"tools": tools})
    
    data = request.get_json()
    tool_name = data.get('name')
    if not tool_name: return jsonify({"error": "Missing tool name"}), 400
    
    if 'enabled' in data:
        db.update_system_setting(f"tool_{tool_name}_enabled", "1" if data['enabled'] else "0", "tools")
    if 'maintenance' in data:
        db.update_system_setting(f"tool_{tool_name}_maintenance", "1" if data['maintenance'] else "0", "tools")
        
    db.log_activity(session.get('user_id'), "UPDATE_TOOL", f"Updated {tool_name} config")
    return jsonify({"success": True})

@app.route('/admin/support', methods=['GET', 'PATCH'])
@admin_required
def admin_support_tickets():
    """Manage user messages and support tickets"""
    if request.method == 'GET':
        success, tickets = db.get_activity_logs() # We repurpose for now or add get_support_tickets
        # Let's add get_support_tickets to DatabaseManager
        with sqlite3.connect(db.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM support_tickets ORDER BY created_at DESC")
            tickets = [dict(row) for row in c.fetchall()]
        return jsonify({"tickets": tickets})
    
    data = request.get_json()
    ticket_id = data.get('id')
    status = data.get('status')
    if ticket_id and status:
        with sqlite3.connect(db.db_path) as conn:
            conn.cursor().execute("UPDATE support_tickets SET status = ? WHERE id = ?", (status, ticket_id))
            conn.commit()
    return jsonify({"success": True})

@app.route('/admin/support/<int:ticket_id>', methods=['DELETE'])
@admin_required
def admin_delete_support_ticket(ticket_id):
    with sqlite3.connect(db.db_path) as conn:
        conn.cursor().execute("DELETE FROM support_tickets WHERE id = ?", (ticket_id,))
        conn.commit()
    db.log_activity(session.get('user_id'), "DELETE_TICKET", f"Deleted support ticket {ticket_id}")
    return jsonify({"success": True})

@app.route('/admin/support/<int:ticket_id>/reply', methods=['POST'])
@admin_required
def admin_reply_support_ticket(ticket_id):
    data = request.get_json()
    reply_message = data.get('message')
    # Simulate sending email
    with sqlite3.connect(db.db_path) as conn:
        conn.cursor().execute("UPDATE support_tickets SET status = 'resolved' WHERE id = ?", (ticket_id,))
        conn.commit()
    db.log_activity(session.get('user_id'), "REPLY_TICKET", f"Replied to support ticket {ticket_id}")
    return jsonify({"success": True, "message": "Reply sent successfully"})

@app.route('/admin/settings', methods=['GET', 'PATCH'])
@admin_required
def admin_system_settings():
    """Manage system settings"""
    if request.method == 'GET':
        settings = db.get_system_settings()
        return jsonify({"settings": settings})
        
    data = request.get_json()
    for key, value in data.items():
        db.update_system_setting(key, str(value), 'settings')
    db.log_activity(session.get('user_id'), "UPDATE_SETTINGS", "Updated system settings")
    return jsonify({"success": True, "message": "Settings updated"})

from flask import make_response

@app.route('/admin/files/export', methods=['GET'])
@admin_required
def export_files_history():
    with sqlite3.connect(db.db_path) as conn:
        c = conn.cursor()
        c.execute('''SELECT f.id, u.email, f.tool_name, f.status, f.file_size, f.duration, f.created_at 
                   FROM processed_files f LEFT JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC''')
        rows = c.fetchall()
        
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['Job ID', 'User Email', 'Tool Name', 'Status', 'Size', 'Duration', 'Timestamp'])
    cw.writerows(rows)
    
    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=files_history.csv"
    output.headers["Content-type"] = "text/csv"
    return output

@app.route('/admin/stats/export', methods=['GET'])
@admin_required
def export_stats_usage():
    with sqlite3.connect(db.db_path) as conn:
        c = conn.cursor()
        c.execute('''SELECT tool_name, status, COUNT(*) as count 
                   FROM processed_files GROUP BY tool_name, status ORDER BY tool_name''')
        rows = c.fetchall()
        
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['Tool Name', 'Status', 'Count'])
    cw.writerows(rows)
    
    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=stats_usage.csv"
    output.headers["Content-type"] = "text/csv"
    return output

@app.route('/contact', methods=['POST'])
def public_contact():
    """Public endpoint for submitting contact form"""
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')
    
    if not email or not message:
        return jsonify({"error": "Email and message are required"}), 400
        
    success, msg = db.create_support_ticket(session.get('user_id'), email, subject, message)
    if success:
        return jsonify({"success": True, "message": "Message sent successfully!"})
    return jsonify({"error": msg}), 500

@app.route('/admin/admins', methods=['GET', 'POST', 'DELETE'])
@super_admin_required
def manage_admins():
    """Endpoints for super_admins to manage administrative staff"""
    if request.method == 'GET':
        with sqlite3.connect(db.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT id, email, name, role, status, created_at FROM users WHERE role IN ('admin', 'super_admin')")
            admins = [dict(row) for row in c.fetchall()]
        return jsonify({"admins": admins})
    
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', 'Staff Admin')
        role = data.get('role', 'admin')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
            
        try:
            # Check if already exists
            with sqlite3.connect(db.db_path) as conn:
                c = conn.cursor()
                c.execute("SELECT id FROM users WHERE email = ?", (email,))
                if c.fetchone():
                    return jsonify({"error": "User with this email already exists"}), 400
            
            # Create user
            hashed_password = generate_password_hash(password)
            with sqlite3.connect(db.db_path) as conn:
                c = conn.cursor()
                c.execute("INSERT INTO users (email, name, password, role, status) VALUES (?, ?, ?, ?, 'active')",
                         (email, name, hashed_password, role))
                conn.commit()
                
            db.log_activity(session.get('user_id'), "CREATE_ADMIN", f"Created admin account for {email}")
            return jsonify({"success": True, "message": f"Admin {email} created successfully"})
        except Exception as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500

    if request.method == 'DELETE':
        admin_id = request.args.get('id')
        if not admin_id:
            return jsonify({"error": "Admin ID is required"}), 400
            
        # Cannot delete yourself
        if str(admin_id) == str(session.get('user_id')):
            return jsonify({"error": "You cannot delete your own account"}), 400
            
        with sqlite3.connect(db.db_path) as conn:
            c = conn.cursor()
            c.execute("DELETE FROM users WHERE id = ? AND role IN ('admin', 'super_admin')", (admin_id,))
            conn.commit()
            
        db.log_activity(session.get('user_id'), "DELETE_ADMIN", f"Deleted admin ID {admin_id}")
        return jsonify({"success": True})

if __name__ == '__main__':
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "t")
    port = int(os.getenv("PORT", 5000))
    app.run(debug=debug_mode, port=port, host='0.0.0.0')
