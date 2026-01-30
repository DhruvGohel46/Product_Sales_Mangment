import sqlite3
import os
from datetime import datetime

def reset_daily_bill_numbers():
    """Reset today's bill numbers to start from 1"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'data', 'products.db')
    
    if not os.path.exists(db_path):
        print("Database not found!")
        return
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get today's date
        today = datetime.now().strftime('%Y-%m-%d')
        print(f"Resetting bill numbers for: {today}")
        
        # Get all bills for today
        cursor.execute('''
            SELECT id, bill_no, created_at FROM bills 
            WHERE date(created_at) = ?
            ORDER BY created_at ASC
        ''', (today,))
        
        today_bills = cursor.fetchall()
        
        if not today_bills:
            print("No bills found for today!")
            return
        
        print(f"Found {len(today_bills)} bills for today")
        
        # Reset bill numbers starting from 1
        for i, (bill_id, old_bill_no, created_at) in enumerate(today_bills, 1):
            new_bill_no = i
            cursor.execute('''
                UPDATE bills 
                SET bill_no = ? 
                WHERE id = ?
            ''', (new_bill_no, bill_id))
            
            print(f"Bill {old_bill_no} -> Bill {new_bill_no} (ID: {bill_id})")
        
        # Commit changes
        conn.commit()
        
        # Verify the changes
        cursor.execute('''
            SELECT bill_no, created_at FROM bills 
            WHERE date(created_at) = ?
            ORDER BY bill_no ASC
        ''', (today,))
        
        updated_bills = cursor.fetchall()
        print(f"\nUpdated bill numbers for today:")
        for bill_no, created_at in updated_bills:
            print(f"  Bill #{bill_no} at {created_at}")
        
        conn.close()
        print(f"\n✅ Successfully reset {len(today_bills)} bill numbers for today!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reset_daily_bill_numbers()
