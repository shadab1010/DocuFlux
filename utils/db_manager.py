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
