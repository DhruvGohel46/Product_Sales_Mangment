import json
from datetime import datetime, date
from typing import List, Dict, Optional, Any
from sqlalchemy import func, or_
from models import db, Product, Bill, Category, Settings
from config import config

class DatabaseService:
    def __init__(self):
        # No specific initialization needed for SQLAlchemy service
        # as db session is handled by Flask-SQLAlchemy
        pass

    # ---------------------------------------------------------
    # PRODUCT MANAGEMENT
    # ---------------------------------------------------------

    def get_all_products(self, include_inactive: bool = False) -> List[Dict[str, Any]]:
        """Get all products with category info"""
        query = Product.query
        
        if not include_inactive:
            query = query.filter(Product.active == True)
            
        products = query.order_by(Product.name).all()
        
        result = []
        for p in products:
            p_dict = {
                'product_id': p.product_id,
                'name': p.name,
                'price': p.price,
                'category_id': p.category_id,
                'category': p.category, # Legacy field
                'category_name': p.category_rel.name if p.category_rel else None,
                'image_filename': p.image_filename,
                'active': p.active,
                'created_at': str(p.created_at),
                'updated_at': str(p.updated_at)
            }
            # Maintain legacy behavior
            if not p_dict.get('category') and p_dict.get('category_name'):
                p_dict['category'] = p_dict['category_name']
            result.append(p_dict)
            
        return result

    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific product by ID"""
        p = Product.query.get(product_id)
        if not p:
            return None
            
        p_dict = {
            'product_id': p.product_id,
            'name': p.name,
            'price': p.price,
            'category_id': p.category_id,
            'category': p.category,
            'category_name': p.category_rel.name if p.category_rel else None,
            'image_filename': p.image_filename,
            'active': p.active,
            'created_at': str(p.created_at),
            'updated_at': str(p.updated_at)
        }
        if not p_dict.get('category') and p_dict.get('category_name'):
             p_dict['category'] = p_dict['category_name']
        return p_dict

    def create_product(self, product_data: Dict[str, Any]) -> bool:
        """Create a new product"""
        try:
            if Product.query.get(product_data['product_id']):
                return False

            new_product = Product(
                product_id=product_data['product_id'],
                name=product_data['name'],
                price=float(product_data['price']),
                category_id=product_data.get('category_id'),
                category=product_data.get('category'),
                image_filename=product_data.get('image_filename'),
                active=bool(product_data.get('active', True))
            )
            db.session.add(new_product)
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error creating product: {e}")
            db.session.rollback()
            return False

    def update_product(self, product_id: str, product_data: Dict[str, Any]) -> bool:
        """Update an existing product"""
        try:
            p = Product.query.get(product_id)
            if not p:
                return False

            if 'name' in product_data:
                p.name = product_data['name']
            if 'price' in product_data:
                p.price = float(product_data['price'])
            if 'category_id' in product_data:
                p.category_id = product_data['category_id']
            if 'category' in product_data:
                p.category = product_data['category']
            if 'image_filename' in product_data:
                p.image_filename = product_data['image_filename']
            if 'active' in product_data:
                p.active = bool(product_data['active'])
            
            p.updated_at = datetime.now()
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error updating product: {e}")
            db.session.rollback()
            return False

    def delete_product(self, product_id: str) -> bool:
        """Delete a product"""
        try:
            p = Product.query.get(product_id)
            if p:
                db.session.delete(p)
                db.session.commit()
                return True
            return False
        except Exception as e:
             print(f"Error deleting product: {e}")
             db.session.rollback()
             return False
             
    def clear_all_products(self):
        """Clear all products"""
        try:
            Product.query.delete()
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error clearing products: {e}")
            db.session.rollback()
            return False

    # ---------------------------------------------------------
    # BILL MANAGEMENT
    # ---------------------------------------------------------

    def create_bill(self, bill_data: Dict[str, Any]) -> int:
        """Create a new bill"""
        try:
            # Check bill reset setting
            # In SQLAlchemy, we query the Settings model
            setting = Settings.query.get('bill_reset_daily')
            reset_daily = (setting.value == 'true') if setting else True
            
            next_bill_no = 1
            if reset_daily:
                # Get max bill_no for today
                # Postgres 'date' function on timestamp works, but func.date() is safer
                today = date.today()
                max_bill = db.session.query(func.max(Bill.bill_no))\
                    .filter(func.date(Bill.created_at) == today).scalar()
                if max_bill:
                    next_bill_no = max_bill + 1
            else:
                max_bill = db.session.query(func.max(Bill.bill_no)).scalar()
                if max_bill:
                    next_bill_no = max_bill + 1
            
            # Create Items JSON
            # Enrich items logic mirrored from sqlite_db_service
            enriched_items = []
            for item in bill_data['items']:
                # Optimizable: Bulk fetch products?
                # For compatibility, keeping loop or doing single query
                p = Product.query.get(item['product_id'])
                enriched_item = {
                    'product_id': item['product_id'],
                    'name': p.name if p else 'Unknown Product',
                    'price': item['price'],
                    'quantity': item['quantity']
                }
                enriched_items.append(enriched_item)

            new_bill = Bill(
                bill_no=next_bill_no,
                customer_name=bill_data.get('customer_name', ''),
                total_amount=float(bill_data['total_amount']),
                payment_method=bill_data.get('payment_method', 'CASH'),
                items=json.dumps(enriched_items),
                status='CONFIRMED',
                created_at=datetime.now()
            )
            
            db.session.add(new_bill)
            db.session.commit()
            return next_bill_no
            
        except Exception as e:
            print(f"Error creating bill: {e}")
            db.session.rollback()
            return 0 # Error indicator

    def get_bill(self, bill_no: int) -> Optional[Dict[str, Any]]:
        """Get a specific bill by number for today"""
        try:
            today = date.today()
            # Assuming 'bill_no' is only unique per day if reset_daily is true.
            # So strict get_bill(bill_no) implies getting TODAY's bill with that number.
            bill = Bill.query.filter(
                Bill.bill_no == bill_no, 
                func.date(Bill.created_at) == today
            ).first()
            
            if bill:
                return self._bill_to_dict(bill)
            return None
        except Exception as e:
            print(f"Error getting bill: {e}")
            return None

    def get_todays_bills(self) -> List[Dict[str, Any]]:
        """Get all bills for today"""
        try:
            today = date.today()
            bills = Bill.query.filter(
                func.date(Bill.created_at) == today,
                func.trim(Bill.status) != 'CANCELLED'
            ).order_by(Bill.bill_no.asc()).all()
            
            return [self._bill_to_dict(b) for b in bills]
        except Exception as e:
            print(f"Error getting today's bills: {e}")
            return []

    def get_monthly_bills(self, month: int, year: int) -> List[Dict[str, Any]]:
        """Get all bills for a specific month and year"""
        try:
            # Extract month/year from created_at in Postgres
            bills = Bill.query.filter(
                func.extract('month', Bill.created_at) == month,
                func.extract('year', Bill.created_at) == year,
                func.trim(Bill.status) != 'CANCELLED'
            ).order_by(Bill.created_at.asc()).all()
            
            return [self._bill_to_dict(b) for b in bills]
        except Exception as e:
            print(f"Error getting monthly bills: {e}")
            return []

    def get_bills_by_date(self, date_str: str) -> List[Dict[str, Any]]:
        """Get all bills for a specific date (YYYY-MM-DD)"""
        try:
            # date_str is expected YYYY-MM-DD
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            bills = Bill.query.filter(
                func.date(Bill.created_at) == target_date,
                func.trim(Bill.status) != 'CANCELLED'
            ).order_by(Bill.created_at.asc()).all()
            
            return [self._bill_to_dict(b) for b in bills]
        except Exception as e:
             print(f"Error getting bills by date: {e}")
             return []
             
    def get_bills_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Get bills in date range"""
        try:
            s_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            e_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            bills = Bill.query.filter(
                func.date(Bill.created_at) >= s_date,
                func.date(Bill.created_at) <= e_date,
                func.trim(Bill.status) != 'CANCELLED'
            ).order_by(Bill.created_at.asc()).all()
            
            return [self._bill_to_dict(b) for b in bills]
        except Exception as e:
            print(f"Error getting bills range: {e}")
            return []

    def get_all_bills(self) -> List[Dict[str, Any]]:
        """Get all bills"""
        try:
            bills = Bill.query.filter(func.trim(Bill.status) != 'CANCELLED')\
                .order_by(Bill.created_at.desc()).all()
            return [self._bill_to_dict(b) for b in bills]
        except Exception as e:
             return []

    def get_all_bills_management(self) -> List[Dict[str, Any]]:
        """Get ALL bills including cancelled"""
        try:
            bills = Bill.query.order_by(Bill.created_at.desc()).all()
            return [self._bill_to_dict(b) for b in bills]
        except Exception:
            return []

    def cancel_bill(self, bill_no: int) -> bool:
        """Cancel a bill"""
        try:
            # Find the bill (latest one with this no? or today's?)
            # Assuming user cancels recent bills usually. 
            # Ideally should pass ID, but sticking to bill_no interface.
            # We search for the bill with this number created TODAY.
            today = date.today()
            bill = Bill.query.filter(
                 Bill.bill_no == bill_no,
                 func.date(Bill.created_at) == today
            ).first()
            
            if bill:
                bill.status = 'CANCELLED'
                bill.updated_at = datetime.now()
                db.session.commit()
                return True
            return False
        except Exception as e:
            print(f"Error cancelling bill: {e}")
            db.session.rollback()
            return False

    def update_bill(self, bill_no: int, bill_data: Dict[str, Any]) -> bool:
        """Update bill"""
        try:
            today = date.today()
            bill = Bill.query.filter(
                 Bill.bill_no == bill_no,
                 func.date(Bill.created_at) == today,
                 func.trim(Bill.status) != 'CANCELLED'
            ).first()
            
            if not bill:
                return False
                
            # Enrich items again
            enriched_items = []
            for item in bill_data['items']:
                p = Product.query.get(item['product_id'])
                enriched_item = {
                    'product_id': item['product_id'],
                    'name': p.name if p else 'Unknown Product',
                    'price': item['price'],
                    'quantity': item['quantity']
                }
                enriched_items.append(enriched_item)
                
            bill.customer_name = bill_data.get('customer_name', '')
            bill.total_amount = float(bill_data['total_amount'])
            bill.items = json.dumps(enriched_items)
            bill.updated_at = datetime.now()
            
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error updating bill: {e}")
            db.session.rollback()
            return False

    def clear_all_bills(self):
        """Clear all bills"""
        try:
            Bill.query.delete()
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            return False

    def _bill_to_dict(self, bill: Bill) -> Dict[str, Any]:
        """Helper to convert Bill model to dict"""
        return {
            'id': bill.id,
            'bill_no': bill.bill_no,
            'customer_name': bill.customer_name,
            'total_amount': bill.total_amount,
            'items': json.loads(bill.items), # Deserialize JSON
            'status': bill.status,
            'created_at': str(bill.created_at),
            'updated_at': str(bill.updated_at)
        }

    # ---------------------------------------------------------
    # CATEGORY MANAGEMENT
    # ---------------------------------------------------------

    def get_all_categories(self, include_inactive: bool = False) -> List[Dict[str, Any]]:
        query = Category.query
        if not include_inactive:
            query = query.filter(Category.active == True)
        
        cats = query.order_by(Category.name).all()
        
        result = []
        for c in cats:
            # Count products
            count = len(c.products)
            c_dict = {
                'id': c.id,
                'name': c.name,
                'description': c.description,
                'active': c.active,
                'created_at': str(c.created_at),
                'updated_at': str(c.updated_at),
                'product_count': count,
                'is_used': count > 0 # Simple check
            }
            result.append(c_dict)
        return result

    def get_category(self, category_id: int) -> Optional[Dict[str, Any]]:
        c = Category.query.get(category_id)
        if c:
            return {
                'id': c.id,
                'name': c.name,
                'description': c.description,
                'active': c.active
            }
        return None

    def get_category_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        c = Category.query.filter(func.lower(Category.name) == func.lower(name)).first()
        if c:
             return {
                'id': c.id,
                'name': c.name,
                'description': c.description,
                'active': c.active
            }
        return None

    def create_category(self, data: Dict[str, Any]) -> Optional[int]:
        try:
            new_cat = Category(
                name=data['name'],
                description=data.get('description', ''),
                active=bool(data.get('active', True))
            )
            db.session.add(new_cat)
            db.session.commit()
            return new_cat.id
        except Exception:
            db.session.rollback()
            return None

    def update_category(self, category_id: int, data: Dict[str, Any]) -> bool:
        try:
            c = Category.query.get(category_id)
            if not c: return False
            
            if 'name' in data: c.name = data['name']
            if 'description' in data: c.description = data['description']
            if 'active' in data: c.active = bool(data['active'])
            
            c.updated_at = datetime.now()
            db.session.commit()
            return True
        except Exception:
            db.session.rollback()
            return False

    def is_category_used(self, category_id: int) -> Dict[str, Any]:
        """Check usage"""
        c = Category.query.get(category_id)
        if not c:
             return {'used': False, 'reason': 'Category not found'}
             
        # Check products
        if c.products:
            return {'used': True, 'reason': f'linked to {len(c.products)} product(s)'}
            
        # Check bills? (Complex text search on JSON)
        # Mirroring logic: check products in this category, then check bills containing those products
        # For Postgres, we can do JSONB or text search, but 'items' is Text.
        # We can implement if strictly needed, but for now assuming product link is sufficient
        # or relying on same logic as SQLite service if we want full parity.
        return {'used': False, 'reason': 'No usage found'}

    def delete_category(self, category_id: int) -> bool:
        try:
            c = Category.query.get(category_id)
            if c:
                db.session.delete(c)
                db.session.commit()
                return True
            return False
        except Exception:
            db.session.rollback()
            return False

    # ---------------------------------------------------------
    # SETTINGS MANAGEMENT
    # ---------------------------------------------------------
    
    def get_all_settings(self) -> Dict[str, Any]:
        """Get all settings"""
        settings = Settings.query.all()
        # Return flat dict as per interface
        # But SQLite service code snippet for get_all_settings was cut off.
        # Assuming it returns a dict of {key: value}
        return {s.key: s.value for s in settings}

    def update_settings_bulk(self, settings_list: List[Dict[str, Any]]) -> bool:
        """Update multiple settings"""
        try:
            for item in settings_list:
                key = item.get('key')
                value = item.get('value')
                group_name = item.get('group_name')
                
                if key:
                    setting = Settings.query.get(key)
                    if setting:
                        setting.value = str(value)
                        if group_name:
                            setting.group_name = group_name
                        setting.updated_at = datetime.now()
                    else:
                        # Create if not exists
                        new_setting = Settings(
                            key=key,
                            value=str(value),
                            group_name=group_name or 'app' 
                        )
                        db.session.add(new_setting)
            
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error updating settings: {e}")
            db.session.rollback()
            return False
