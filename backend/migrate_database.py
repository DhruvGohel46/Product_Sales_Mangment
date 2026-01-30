import sqlite3
import os
from datetime import datetime

def migrate_database_schema():
    """Migrate database to support daily bill numbering"""
    
    db_path = os.path.join(os.path.dirname(__file__), 'data', 'products.db')
    
    if not os.path.exists(db_path):
        print("Database not found!")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Starting database migration...")
        
        # Check current schema
        cursor.execute("PRAGMA table_info(bills)")
        columns = cursor.fetchall()
        print("Current bills table structure:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # Check if we need to migrate (old schema has bill_no as primary key)
        has_old_schema = any(col[1] == 'bill_no' and col[5] == 1 for col in columns)
        
        if has_old_schema:
            print("\nMigrating to new schema...")
            
            # Create new bills table with proper schema
            cursor.execute('''
                CREATE TABLE bills_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bill_no INTEGER NOT NULL,
                    customer_name TEXT,
                    total_amount REAL NOT NULL,
                    items TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Copy data from old table to new table
            cursor.execute('''
                INSERT INTO bills_new (bill_no, customer_name, total_amount, items, created_at)
                SELECT bill_no, customer_name, total_amount, items, created_at 
                FROM bills
            ''')
            
            # Drop old table
            cursor.execute('DROP TABLE bills')
            
            # Rename new table to bills
            cursor.execute('ALTER TABLE bills_new RENAME TO bills')
            
            # Create indexes
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_bills_date 
                ON bills (date(created_at))
            ''')
            
            cursor.execute('''
                CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_bill 
                ON bills (bill_no, date(created_at))
            ''')
            
            conn.commit()
            print("✅ Database schema migrated successfully!")
            
        else:
            print("\n✅ Database schema is already up to date!")
        
        # Reset today's bill numbers
        today = datetime.now().strftime('%Y-%m-%d')
        print(f"\nResetting bill numbers for today: {today}")
        
        # Get today's bills ordered by creation time
        cursor.execute('''
            SELECT id, bill_no, created_at FROM bills 
            WHERE date(created_at) = ?
            ORDER BY created_at ASC
        ''', (today,))
        
        today_bills = cursor.fetchall()
        
        if today_bills:
            print(f"Found {len(today_bills)} bills for today")
            
            # Reset bill numbers starting from 1
            for i, (bill_id, old_bill_no, created_at) in enumerate(today_bills, 1):
                new_bill_no = i
                cursor.execute('''
                    UPDATE bills 
                    SET bill_no = ? 
                    WHERE id = ?
                ''', (new_bill_no, bill_id))
                
                print(f"  Bill {old_bill_no} -> Bill {new_bill_no}")
            
            conn.commit()
            print(f"✅ Reset {len(today_bills)} bill numbers for today!")
        else:
            print("No bills found for today")
        
        # Verify the changes
        cursor.execute('''
            SELECT bill_no, created_at FROM bills 
            WHERE date(created_at) = ?
            ORDER BY bill_no ASC
        ''', (today,))
        
        updated_bills = cursor.fetchall()
        if updated_bills:
            print(f"\nToday's bills after reset:")
            for bill_no, created_at in updated_bills:
                print(f"  Bill #{bill_no} at {created_at}")
        
        conn.close()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    migrate_database_schema()
