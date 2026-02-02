import sqlite3
import os

# Configuration
DB_PATH = "users.db"

def delete_user_by_email():
    print("--- Admin Tool: Delete User by Email ---")
    
    # Check DB
    if not os.path.exists(DB_PATH):
        print(f"Error: Database '{DB_PATH}' not found.")
        return

    # Get Input
    email = input("Enter the email address to DELETE: ").strip()
    
    if not email:
        print("Error: Email cannot be empty.")
        return

    # Confirm
    confirm = input(f"Are you sure you want to PERMANENTLY delete user '{email}'? (yes/no): ").strip().lower()
    if confirm != 'yes':
        print("Operation cancelled.")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if user exists first
        cursor.execute("SELECT id, name FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"Error: No user found with email '{email}'.")
            conn.close()
            return
            
        user_id, name = user
        
        # Execute Delete
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"Success! User '{name}' ({email}) has been deleted.")
        else:
            print("Error: Could not delete user (unknown database error).")
            
        conn.close()
        
    except Exception as e:
        print(f"Database Error: {e}")

if __name__ == "__main__":
    delete_user_by_email()
    input("\nPress Enter to exit...")
