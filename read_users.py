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
        
        # Query users - get all columns dynamically or list them
        # Getting all columns to be safe with schema changes
        cursor.execute("SELECT * FROM users")
        rows = cursor.fetchall()
        
        # Get column names
        column_names = [description[0] for description in cursor.description]
        
        # Simple print
        print(f"Total Users: {len(rows)}\n")
        print(f"{'ID':<5} {'Name':<20} {'Email':<30} {'Provider':<10} {'Google ID':<25} {'Created At'}")
        print("-" * 110)
        
        for row in rows:
            # zip column names with row data to safely access fields by name
            row_dict = dict(zip(column_names, row))
            
            uid = row_dict.get('id', 'N/A')
            name = row_dict.get('name', 'N/A')
            email = row_dict.get('email', 'N/A')
            provider = row_dict.get('auth_provider', 'local') # Default to local if column missing
            gid = row_dict.get('google_id', '-')
            created = row_dict.get('created_at', '')
            
            gid_display = str(gid) if gid else "-"
            
            print(f"{uid:<5} {name[:20]:<20} {email[:30]:<30} {provider:<10} {gid_display[:25]:<25} {created}")
            
        conn.close()
    except Exception as e:
        print(f"Error reading database: {e}")
