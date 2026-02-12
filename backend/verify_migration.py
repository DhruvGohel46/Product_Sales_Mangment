from app import create_app
from models import db, Product, Bill, Category, Settings
from sqlalchemy import text

def verify_data():
    app = create_app('default')
    with app.app_context():
        print("--- Verification Results ---")
        
        # Check counts
        p_count = Product.query.count()
        b_count = Bill.query.count()
        c_count = Category.query.count()
        s_count = Settings.query.count()
        
        print(f"Products: {p_count}")
        print(f"Bills: {b_count}")
        print(f"Categories: {c_count}")
        print(f"Settings: {s_count}")
        
        if p_count == 0 and b_count == 0:
             print("⚠️  WARNING: Database appears empty!")
        else:
             print("✅ Database populated.")
             
        # Check a specific bill details
        if b_count > 0:
            last_bill = Bill.query.order_by(Bill.id.desc()).first()
            print(f"\nLast Bill ID: {last_bill.id}")
            print(f"Bill No: {last_bill.bill_no}")
            print(f"Total: {last_bill.total_amount}")
            print(f"Payment Method: {last_bill.payment_method}")
            print(f"Date: {last_bill.created_at}")

if __name__ == "__main__":
    verify_data()
