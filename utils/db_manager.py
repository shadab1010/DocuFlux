"""
Database utilities for user management
"""
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash


class DatabaseManager:
    def __init__(self, db_path):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """Initialize database with required tables and handle migrations"""
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''')
            
            # Migration: Add auth_provider and google_id columns if they don't exist
            try:
                c.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'")
            except sqlite3.OperationalError:
                pass # Column likely exists

            try:
                c.execute("ALTER TABLE users ADD COLUMN google_id TEXT")
            except sqlite3.OperationalError:
                pass # Column likely exists

            try:
                c.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")
            except sqlite3.OperationalError:
                pass # Column likely exists

            try:
                c.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'")
            except sqlite3.OperationalError:
                pass # Column likely exists

            # Activity Logs Table
            c.execute('''CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT NOT NULL,
                details TEXT,
                ip_address TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''')

            # Processed Files Table (Analytics & Monitoring)
            c.execute('''CREATE TABLE IF NOT EXISTS processed_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                tool_name TEXT NOT NULL,
                status TEXT NOT NULL,
                file_size INTEGER,
                duration REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''')

            # Tools Configuration Table
            c.execute('''CREATE TABLE IF NOT EXISTS tools_config (
                tool_name TEXT PRIMARY KEY,
                is_enabled INTEGER DEFAULT 1,
                maintenance_mode INTEGER DEFAULT 0,
                max_file_size INTEGER DEFAULT 10485760,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''')

            # System Settings Table
            c.execute('''CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                category TEXT DEFAULT 'general',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''')

            # Support Tickets Table
            c.execute('''CREATE TABLE IF NOT EXISTS support_tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                email TEXT,
                subject TEXT,
                message TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )''')

            conn.commit()
    
    def create_user(self, email, name, password):
        """
        Create new user
        Returns: (success: bool, user_id: int or error: str)
        """
        try:
            hashed_pw = generate_password_hash(password)
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                # Use default 'local' for auth_provider
                c.execute("INSERT INTO users (email, name, password, auth_provider) VALUES (?, ?, ?, 'local')", 
                         (email, name, hashed_pw))
                conn.commit()
                
                c.execute("SELECT id FROM users WHERE email = ?", (email,))
                user_id = c.fetchone()[0]
                return True, user_id
        except sqlite3.IntegrityError:
            return False, "Email already registered"
        except Exception as e:
            return False, str(e)
    
    def authenticate_user(self, email, password):
        """
        Authenticate user
        Returns: (success: bool, user_id: int or name: str or error: str)
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                c.execute("SELECT id, name, password FROM users WHERE email = ?", (email,))
                user = c.fetchone()
            
            if user and check_password_hash(user[2], password):
                return True, user[0], user[1]
            else:
                return False, None, "Invalid email or password"
        except Exception as e:
            return False, None, str(e)
    
    def get_or_create_google_user(self, email, name, google_id):
        """
        Get existing user or create new one via Google OAuth
        Returns: (success: bool, user_id: int or error: str)
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                
                # Check if user exists
                c.execute("SELECT id, auth_provider FROM users WHERE email = ?", (email,))
                row = c.fetchone()
                
                if row:
                    user_id, provider = row
                    # If existing user logs in with Google, we can link it
                    if provider == 'local':
                        c.execute("UPDATE users SET auth_provider = 'google', google_id = ? WHERE id = ?", (google_id, user_id))
                        conn.commit()
                    return True, user_id
                
                # Create new Google user
                # Generate a random password since it won't be used but schema requires it
                random_pw = generate_password_hash(f"google_auth_{google_id}")
                
                c.execute("INSERT INTO users (email, name, password, auth_provider, google_id) VALUES (?, ?, ?, ?, ?)", 
                         (email, name, random_pw, 'google', google_id))
                conn.commit()
                
                return True, c.lastrowid
        except Exception as e:
            return False, str(e)

    def get_user_by_id(self, user_id):
        """
        Fetch user details by ID
        Returns: (success: bool, user: dict or error: str)
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
                user = c.fetchone()
                if user:
                    return True, dict(user)
                return False, "User not found"
        except Exception as e:
            return False, str(e)

    def update_user(self, user_id, name=None, password=None):
        """
        Update user profile
        Returns: (success: bool, message: str)
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                
                updates = []
                params = []
                
                if name:
                    updates.append("name = ?")
                    params.append(name)
                
                if password:
                    hashed_pw = generate_password_hash(password)
                    updates.append("password = ?")
                    params.append(hashed_pw)
                
                if not updates:
                    return False, "No changes provided"
                
                params.append(user_id)
                query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
                
                c.execute(query, tuple(params))
                conn.commit()
                
                if c.rowcount > 0:
                    return True, "Profile updated successfully"
                else:
                    return False, "User not found"
                    
        except Exception as e:
            return False, str(e)

    def delete_user(self, user_id):
        """
        Delete user account
        Returns: (success: bool, message: str)
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                c.execute("DELETE FROM users WHERE id = ?", (user_id,))
                conn.commit()
                
                if c.rowcount > 0:
                    return True, "Account deleted successfully"
                else:
                    return False, "User not found"
        except Exception as e:
            return False, str(e)

    def log_activity(self, user_id, action, details=None, ip_address=None):
        """Log administrative or user activity"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                c.execute("INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
                         (user_id, action, details, ip_address))
                conn.commit()
                return True
        except Exception as e:
            print(f"Log error: {e}")
            return False

    def log_processed_file(self, user_id, tool_name, status, file_size=0, duration=0.0):
        """Track file processing for analytics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                c.execute("INSERT INTO processed_files (user_id, tool_name, status, file_size, duration) VALUES (?, ?, ?, ?, ?)",
                         (user_id, tool_name, status, file_size, duration))
                conn.commit()
                return True
        except Exception as e:
            print(f"Stats log error: {e}")
            return False

    def get_admin_stats(self):
        """Get overview statistics for the admin dashboard"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                
                stats = {}
                
                # Total Users
                c.execute("SELECT COUNT(*) FROM users")
                stats['total_users'] = c.fetchone()[0]
                
                # Total Files Processed
                c.execute("SELECT COUNT(*) FROM processed_files")
                stats['total_files'] = c.fetchone()[0]
                
                # Files today
                c.execute("SELECT COUNT(*) FROM processed_files WHERE date(created_at) = date('now')")
                stats['files_today'] = c.fetchone()[0]
                
                # Failed Jobs
                c.execute("SELECT COUNT(*) FROM processed_files WHERE status = 'failed'")
                stats['failed_jobs'] = c.fetchone()[0]
                
                # Most used tools
                c.execute("SELECT tool_name, COUNT(*) as count FROM processed_files GROUP BY tool_name ORDER BY count DESC LIMIT 5")
                stats['popular_tools'] = [dict(row) for row in c.fetchall()]
                
                return True, stats
        except Exception as e:
            return False, str(e)

    def get_all_users(self, limit=100, offset=0, role=None):
        """Fetch users for admin list with optional role filtering"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                query = "SELECT id, email, name, role, status, created_at FROM users"
                params = []
                
                if role:
                    query += " WHERE role = ?"
                    params.append(role)
                
                query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
                params.extend([limit, offset])
                
                c.execute(query, tuple(params))
                users = [dict(row) for row in c.fetchall()]
                return True, users
        except Exception as e:
            return False, str(e)

    def update_user_status_role(self, user_id, status=None, role=None):
        """Ban/Unban users or change permissions"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                updates = []
                params = []
                if status:
                    updates.append("status = ?")
                    params.append(status)
                if role:
                    updates.append("role = ?")
                    params.append(role)
                
                if not updates: return False, "No updates"
                
                params.append(user_id)
                c.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", tuple(params))
                conn.commit()
                return True, "User updated"
        except Exception as e:
            return False, str(e)

    def get_user_by_id(self, user_id):
        """Fetch user details by ID"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT id, email, name, role, status, created_at FROM users WHERE id = ?", (user_id,))
                user = c.fetchone()
                if user:
                    return True, dict(user)
                return False, "User not found"
        except Exception as e:
            return False, str(e)

    def create_support_ticket(self, user_id, email, subject, message):
        """Create a new support inquiry"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                c.execute("INSERT INTO support_tickets (user_id, email, subject, message) VALUES (?, ?, ?, ?)",
                         (user_id, email, subject, message))
                conn.commit()
                return True, "Ticket created"
        except Exception as e:
            return False, str(e)

    def get_system_settings(self):
        """Fetch all system configuration"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT key, value, category FROM system_settings")
                return {row['key']: row['value'] for row in c.fetchall()}
        except Exception as e:
            return {}

    def update_system_setting(self, key, value, category='general'):
        """Update or create a system setting"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                c.execute('''INSERT INTO system_settings (key, value, category) 
                           VALUES (?, ?, ?) 
                           ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP''', 
                         (key, value, category))
                conn.commit()
                return True
        except Exception as e:
            return False

    def get_activity_logs(self, limit=100, offset=0):
        """Fetch system activity logs"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute('''SELECT l.*, u.name as user_name 
                           FROM activity_logs l 
                           LEFT JOIN users u ON l.user_id = u.id 
                           ORDER BY l.timestamp DESC LIMIT ? OFFSET ?''', (limit, offset))
                return True, [dict(row) for row in c.fetchall()]
        except Exception as e:
            return False, str(e)

    def get_processed_files(self, limit=100, offset=0):
        """Fetch file processing history"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute('''SELECT f.*, u.email as user_email 
                           FROM processed_files f 
                           LEFT JOIN users u ON f.user_id = u.id 
                           ORDER BY f.created_at DESC LIMIT ? OFFSET ?''', (limit, offset))
                return True, [dict(row) for row in c.fetchall()]
        except Exception as e:
            return False, str(e)

    def delete_processed_file(self, file_id):
        """Delete a processed file log"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                c = conn.cursor()
                c.execute("DELETE FROM processed_files WHERE id = ?", (file_id,))
                conn.commit()
                if c.rowcount > 0:
                    return True, "Log deleted successfully"
                else:
                    return False, "Log not found"
        except Exception as e:
            return False, str(e)
