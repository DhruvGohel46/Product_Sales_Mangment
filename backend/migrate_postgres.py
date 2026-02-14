
import sys
import os
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db

def migrate_db():
    print("Starting PostgreSQL migration...")
    app = create_app('default')
    
    with app.app_context():
        try:
            # Check if unit_price column exists
            print("Checking inventory table for unit_price column...")
            try:
                # Try to select the column to see if it exists
                db.session.execute(text("SELECT unit_price FROM inventory LIMIT 1"))
                print("Column 'unit_price' already exists.")
            except Exception:
                # If selection fails, column likely doesn't exist
                print("Column 'unit_price' missing. Adding it now...")
                # PostgreSQL syntax for adding column
                db.session.rollback() # Rollback the failed select transaction
                db.session.execute(text("ALTER TABLE inventory ADD COLUMN unit_price FLOAT DEFAULT 0.0"))
                db.session.commit()
                print("Successfully added 'unit_price' column.")

        except Exception as e:
            print(f"Migration failed: {e}")
            db.session.rollback()

if __name__ == "__main__":
    migrate_db()
