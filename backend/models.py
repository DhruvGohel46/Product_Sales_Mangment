from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.sql import func
import json
import uuid

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
        db.UniqueConstraint('bill_no', 'created_at', name='idx_daily_bill_unique'), 
    )

# ==========================================
# WORKER MANAGEMENT SYSTEM MODELS
# Schema: worker
# ==========================================

class Worker(db.Model):
    __tablename__ = 'workers'
    __table_args__ = {'schema': 'worker'}

    worker_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(15))
    email = db.Column(db.String(255))
    role = db.Column(db.String(100)) # e.g., 'Chef', 'Waiter', 'Manager'
    salary = db.Column(db.Float, default=0.0)
    join_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='active') # 'active', 'inactive'
    photo = db.Column(db.Text) # Base64 string or URL
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    advances = db.relationship('Advance', backref='worker', lazy=True)
    salary_payments = db.relationship('SalaryPayment', backref='worker', lazy=True)
    attendance_records = db.relationship('Attendance', backref='worker', lazy=True)

class Advance(db.Model):
    __tablename__ = 'advances'
    __table_args__ = {'schema': 'worker'}

    advance_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_id = db.Column(db.String(36), db.ForeignKey('worker.workers.worker_id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    reason = db.Column(db.Text)
    date = db.Column(db.Date, default=func.current_date())
    created_at = db.Column(db.DateTime, default=func.now())

class SalaryPayment(db.Model):
    __tablename__ = 'salary_payments'
    __table_args__ = {'schema': 'worker'}

    payment_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_id = db.Column(db.String(36), db.ForeignKey('worker.workers.worker_id'), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    base_salary = db.Column(db.Float, default=0.0)
    advance_deduction = db.Column(db.Float, default=0.0)
    final_salary = db.Column(db.Float, nullable=False)
    paid = db.Column(db.Boolean, default=False)
    paid_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=func.now())

class Attendance(db.Model):
    __tablename__ = 'attendance'
    __table_args__ = {'schema': 'worker'}

    attendance_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_id = db.Column(db.String(36), db.ForeignKey('worker.workers.worker_id'), nullable=False)
    date = db.Column(db.Date, default=func.current_date())
    status = db.Column(db.String(20), nullable=False) # 'Present', 'Absent', 'Half-day'
    check_in = db.Column(db.Time, nullable=True)
    check_out = db.Column(db.Time, nullable=True)
    created_at = db.Column(db.DateTime, default=func.now())


