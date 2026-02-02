import sqlite3
import os

# Connect to database
db_path = "users.db"

if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Query users
        cursor.execute("SELECT id, name, email, password, created_at FROM users")
        rows = cursor.fetchall()
        
        print(f"{'ID':<5} {'Name':<20} {'Email':<30} {'Password Hash (Truncated)':<30} {'Created At'}")
        print("-" * 100)
        
        for row in rows:
            uid, name, email, pwd, created = row
            # Truncate hash for display
            pwd_display = pwd[:25] + "..." if len(pwd) > 25 else pwd
            print(f"{uid:<5} {name:<20} {email:<30} {pwd_display:<30} {created}")
            
        conn.close()
    except Exception as e:
        print(f"Error reading database: {e}")
