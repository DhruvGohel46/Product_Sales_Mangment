import sqlite3
import json
import os
from datetime import datetime
from app import create_app
from models import db, Product, Bill, Category, Settings

def migrate_data():
    """Migrate data from SQLite to PostgreSQL"""
    
    # Setup Flask app context
    app = create_app('default')
    
    with app.app_context():
        # Debug connection string
        print(f"Using DB URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # Create tables
        print("Creating PostgreSQL tables...")
        db.create_all()
        
        # Connect to SQLite
        sqlite_db_path = os.path.join(app.config['DATA_DIR'], 'products.db')
        print(f"Connecting to SQLite: {sqlite_db_path}")
        
        if not os.path.exists(sqlite_db_path):
            print("SQLite database not found. Skipping data migration.")
            return

        conn = sqlite3.connect(sqlite_db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 1. Migrate Settings
        print("Migrating Settings...")
        try:
            cursor.execute("SELECT * FROM settings")
            settings = cursor.fetchall()
            for s in settings:
                if not Settings.query.get(s['key']):
                    new_setting = Settings(
                        key=s['key'],
                        value=s['value'],
                        group_name=s['group_name']
                    )
                    db.session.add(new_setting)
            db.session.commit()
            print(f"Migrated {len(settings)} settings.")
        except Exception as e:
            print(f"Error migrating settings: {e}")
            db.session.rollback()

        # 2. Migrate Categories
        print("Migrating Categories...")
        category_map = {} # Old ID -> New ID (if IDs change, but we try to keep them)
        try:
            cursor.execute("SELECT * FROM categories")
            categories = cursor.fetchall()
            for c in categories:
                existing = Category.query.filter_by(name=c['name']).first()
                if not existing:
                    new_cat = Category(
                        id=c['id'], # Keep ID if possible
                        name=c['name'],
                        description=c['description'],
                        active=bool(c['active']),
                        created_at=datetime.strptime(c['created_at'], '%Y-%m-%d %H:%M:%S') if c['created_at'] else datetime.now(),
                        updated_at=datetime.strptime(c['updated_at'], '%Y-%m-%d %H:%M:%S') if c['updated_at'] else datetime.now()
                    )
                    db.session.add(new_cat)
                else:
                    print(f"Category {c['name']} already exists.")
            db.session.commit()
            print(f"Migrated {len(categories)} categories.")
        except Exception as e:
            print(f"Error migrating categories: {e}")
            db.session.rollback()

        # 3. Migrate Products
        print("Migrating Products...")
        try:
            cursor.execute("SELECT * FROM products")
            products = cursor.fetchall()
            for p in products:
                if not Product.query.get(p['product_id']):
                    # Handle timestamp parsing safely
                    created_at = datetime.now()
                    if p['created_at']:
                        try:
                            created_at = datetime.strptime(p['created_at'], '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            pass # Keep default
                            
                    new_prod = Product(
                        product_id=p['product_id'],
                        name=p['name'],
                        price=p['price'],
                        category_id=p['category_id'],
                        category=p['category'],
                        image_filename=p['image_filename'],
                        active=bool(p['active']),
                        created_at=created_at
                    )
                    db.session.add(new_prod)
            db.session.commit()
            print(f"Migrated {len(products)} products.")
        except Exception as e:
            print(f"Error migrating products: {e}")
            db.session.rollback()

        # 4. Migrate Bills
        print("Migrating Bills...")
        try:
            cursor.execute("SELECT * FROM bills")
            bills = cursor.fetchall()
            count = 0
            for b in bills:
                # Check if bill exists (by bill_no AND date? or just ID?)
                # We should use ID to match exactly if we migrate history
                if not Bill.query.get(b['id']):
                    created_at = datetime.now()
                    if b['created_at']:
                        try:
                            created_at = datetime.strptime(b['created_at'], '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            pass

                    new_bill = Bill(
                        id=b['id'],
                        bill_no=b['bill_no'],
                        customer_name=b['customer_name'],
                        total_amount=b['total_amount'],
                        payment_method=b['payment_method'] if 'payment_method' in b.keys() else 'CASH',
                        items=b['items'], # Already JSON string
                        status=b['status'] if b['status'] else 'CONFIRMED',
                        created_at=created_at
                    )
                    db.session.add(new_bill)
                    count += 1
                    
                    # Periodic commit to avoid large transaction
                    if count % 100 == 0:
                        db.session.commit()
                        
            db.session.commit()
            print(f"Migrated {count} bills.")
            
            # Reset sequence for Postgres
            if count > 0:
                # Update sequence for bills_id_seq
                max_id = db.session.query(func.max(Bill.id)).scalar()
                if max_id:
                    db.session.execute(text(f"SELECT setval('bills_id_seq', {max_id})"))
                    db.session.commit()
                    print(f"Reset bills sequence to {max_id}")

        except Exception as e:
            print(f"Error migrating bills: {e}")
            db.session.rollback()

        print("Migration completed successfully!")

from sqlalchemy import text, func

if __name__ == '__main__':
    migrate_data()
