import sqlite3
import os
from typing import List, Dict, Optional, Any
import json

class SQLiteDatabaseService:
    def __init__(self, db_path: str = 'data/products.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database with products table"""
        # Ensure data directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create products table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    product_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    price REAL NOT NULL,
                    category TEXT NOT NULL,
                    active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create bills table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS bills (
                    bill_no INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_name TEXT,
                    total_amount REAL NOT NULL,
                    items TEXT NOT NULL, -- JSON string of items
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable dict-like access
        return conn
    
    def get_all_products(self, include_inactive: bool = False) -> List[Dict[str, Any]]:
        """Get all products"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            if include_inactive:
                cursor.execute('SELECT * FROM products ORDER BY name')
            else:
                cursor.execute('SELECT * FROM products WHERE active = 1 ORDER BY name')
            
            products = []
            for row in cursor.fetchall():
                product = dict(row)
                product['active'] = bool(product['active'])
                products.append(product)
            
            return products
    
    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific product by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM products WHERE product_id = ?', (product_id,))
            row = cursor.fetchone()
            
            if row:
                product = dict(row)
                product['active'] = bool(product['active'])
                return product
            return None
    
    def create_product(self, product_data: Dict[str, Any]) -> bool:
        """Create a new product"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO products (product_id, name, price, category, active)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    product_data['product_id'],
                    product_data['name'],
                    float(product_data['price']),
                    product_data['category'],
                    bool(product_data.get('active', True))
                ))
                conn.commit()
                return True
        except sqlite3.IntegrityError:
            return False
    
    def update_product(self, product_id: str, product_data: Dict[str, Any]) -> bool:
        """Update an existing product"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Build dynamic update query
                update_fields = []
                values = []
                
                for field in ['name', 'price', 'category', 'active']:
                    if field in product_data:
                        update_fields.append(f"{field} = ?")
                        if field == 'price':
                            values.append(float(product_data[field]))
                        elif field == 'active':
                            values.append(bool(product_data[field]))
                        else:
                            values.append(product_data[field])
                
                if update_fields:
                    update_fields.append("updated_at = CURRENT_TIMESTAMP")
                    values.append(product_id)
                    
                    cursor.execute(f'''
                        UPDATE products 
                        SET {', '.join(update_fields)}
                        WHERE product_id = ?
                    ''', values)
                    conn.commit()
                    return cursor.rowcount > 0
                return False
        except sqlite3.Error:
            return False
    
    def delete_product(self, product_id: str) -> bool:
        """Delete a product"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM products WHERE product_id = ?', (product_id,))
                conn.commit()
                return cursor.rowcount > 0
        except sqlite3.Error:
            return False
    
    def create_bill(self, bill_data: Dict[str, Any]) -> int:
        """Create a new bill"""
        # Enrich items with product names from database
        enriched_items = []
        for item in bill_data['items']:
            product = self.get_product(item['product_id'])
            enriched_item = {
                'product_id': item['product_id'],
                'name': product['name'] if product else 'Unknown Product',
                'price': item['price'],
                'quantity': item['quantity']
            }
            enriched_items.append(enriched_item)
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO bills (customer_name, total_amount, items)
                VALUES (?, ?, ?)
            ''', (
                bill_data.get('customer_name', ''),
                float(bill_data['total_amount']),
                json.dumps(enriched_items)
            ))
            conn.commit()
            return cursor.lastrowid
    
    def get_bill(self, bill_no: int) -> Optional[Dict[str, Any]]:
        """Get a specific bill by number"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM bills WHERE bill_no = ?', (bill_no,))
            row = cursor.fetchone()
            
            if row:
                bill = dict(row)
                bill['items'] = json.loads(bill['items'])
                return bill
            return None
    
    def get_all_bills(self) -> List[Dict[str, Any]]:
        """Get all bills"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM bills ORDER BY created_at DESC')
            
            bills = []
            for row in cursor.fetchall():
                bill = dict(row)
                bill['items'] = json.loads(bill['items'])
                bills.append(bill)
            
            return bills

    def clear_all_bills(self):
        """Clear all bills from the database"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Delete all bills
            cursor.execute('DELETE FROM bills')
            
            # Reset auto-increment for bills table
            cursor.execute('DELETE FROM sqlite_sequence WHERE name = "bills"')
            
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            print(f"Error clearing bills: {e}")
            return False

    def clear_all_products(self):
        """Clear all products from the database"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Delete all products
            cursor.execute('DELETE FROM products')
            
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            print(f"Error clearing products: {e}")
            return False
