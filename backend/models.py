from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.sql import func
import json

db = SQLAlchemy()

class Settings(db.Model):
    __tablename__ = 'settings'
    key = db.Column(db.String(255), primary_key=True)
    value = db.Column(db.Text)
    group_name = db.Column(db.String(50))
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

class Product(db.Model):
    __tablename__ = 'products'
    product_id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    category = db.Column(db.String(255)) # Legacy field support
    image_filename = db.Column(db.String(255))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    category_rel = db.relationship('Category', backref='products')

class Inventory(db.Model):
    __tablename__ = 'inventory'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'DIRECT_SALE' or 'RAW_MATERIAL'
    unit = db.Column(db.String(20), nullable=False) # 'piece', 'packet', 'kg', 'liter'
    stock = db.Column(db.Float, default=0.0)
    unit_price = db.Column(db.Float, default=0.0) # Cost per unit for raw materials
    alert_threshold = db.Column(db.Float, default=0.0)
    max_stock_history = db.Column(db.Float, default=10.0) # Track highest stock level
    product_id = db.Column(db.String(50), db.ForeignKey('products.product_id'), nullable=True)
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    product = db.relationship('Product', backref=db.backref('inventory', uselist=False))

class Bill(db.Model):
    __tablename__ = 'bills'
    id = db.Column(db.Integer, primary_key=True)
    bill_no = db.Column(db.Integer, nullable=False)
    customer_name = db.Column(db.String(255))
    total_amount = db.Column(db.Float, nullable=False)
    today_token = db.Column(db.Integer, default=0) # For daily token number if needed
    payment_method = db.Column(db.String(50), default='CASH')
    items = db.Column(db.Text, nullable=False) # Stored as JSON string to maintain compatibility
    status = db.Column(db.String(50), default='CONFIRMED')
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        db.UniqueConstraint('bill_no', 'created_at', name='idx_daily_bill_unique'), # Note: This might need adjustment for ONLY date part. SQLA handling of functional index is complex, so we might skip the unique constraint enforcing via SQLA and rely on app logic or raw SQL index creation if needed. 
        # Actually, Postgres supports functional indexes but SQLA `UniqueConstraint` on `func.date` is tricky.
        # Let's rely on the migration script or manual index creation for the "daily bill no" constraint if strictly needed at DB level.
        # For now, simplistic definition.
    )

