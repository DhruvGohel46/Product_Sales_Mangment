import uuid
from flask import Blueprint, jsonify, request
from models import db, Inventory, func, extract
from datetime import date, timedelta

# We will define Expense and ExpenseItem in models.py
from models import Expense, ExpenseItem

expenses_bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')

@expenses_bp.route('', methods=['GET'])
def get_expenses():
    """Get all expenses with optional filtering"""
    try:
        limit = request.args.get('limit', 100, type=int)
        category = request.args.get('category')
        worker_id = request.args.get('worker_id')
        
        query = Expense.query
        
        range_type = request.args.get('range')
        if range_type:
            today = date.today()
            if range_type == 'today':
                query = query.filter(func.date(Expense.date) == today)
            elif range_type == 'week':
                start_week = today - timedelta(days=today.weekday())
                query = query.filter(Expense.date >= start_week)
            elif range_type == 'month':
                query = query.filter(extract('month', Expense.date) == today.month,
                                     extract('year', Expense.date) == today.year)
            elif range_type == 'year':
                query = query.filter(extract('year', Expense.date) == today.year)

        if category:
            query = query.filter_by(category=category)
        if worker_id:
            query = query.filter_by(worker_id=worker_id)
            
        expenses = query.order_by(Expense.date.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'expenses': [expense.to_dict() for expense in expenses]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching expenses: {str(e)}'
        }), 500

@expenses_bp.route('/<expense_id>', methods=['GET'])
def get_expense(expense_id):
    """Get specific expense details"""
    try:
        expense = Expense.query.filter_by(id=expense_id).first()
        if not expense:
            return jsonify({
                'success': False,
                'message': 'Expense not found'
            }), 404
            
        return jsonify({
            'success': True,
            'expense': expense.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching expense: {str(e)}'
        }), 500

@expenses_bp.route('', methods=['POST'])
def create_expense():
    """Create a new expense"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('title') or not data.get('category') or not data.get('amount'):
            return jsonify({
                'success': False,
                'message': 'Title, category and amount are required'
            }), 400
            
        amount = float(data.get('amount'))
        if amount <= 0:
             return jsonify({
                'success': False,
                'message': 'Amount must be greater than zero'
            }), 400

        # Create Expense
        new_expense = Expense(
            id=str(uuid.uuid4()),
            title=data.get('title'),
            category=data.get('category'),
            amount=amount,
            payment_method=data.get('payment_method', 'Cash'),
            worker_id=data.get('worker_id'),
            date=data.get('date') or func.now(),
            notes=data.get('notes', '')
        )
        
        db.session.add(new_expense)
        
        # Optional: Handle items if provided (backwards compatibility)
        items = data.get('items', [])
        for item in items:
            product_id = item.get('product_id') or item.get('name')
            quantity_str = str(item.get('quantity', '1'))
            
            expense_item = ExpenseItem(
                id=str(uuid.uuid4()),
                expense_id=new_expense.id,
                product_id=product_id,
                quantity=quantity_str,
                purchase_price=float(item.get('purchase_price', 0)),
                subtotal=float(item.get('subtotal', 0))
            )
            db.session.add(expense_item)
            
            # Update inventory if it's an inventory purchase
            if new_expense.category == 'Supplies' and product_id:
                try:
                    quantity_float = float(quantity_str.split()[0])
                except (ValueError, IndexError):
                    quantity_float = 0
                
                if quantity_float > 0:
                    inventory = Inventory.query.filter_by(product_id=product_id).first()
                    if not inventory:
                        inventory = Inventory.query.filter_by(name=product_id).first()
                    
                    if inventory:
                        inventory.stock += quantity_float
                        db.session.add(inventory)
                    
        db.session.commit()
        
        # Update pre-aggregated daily summary
        try:
            from services.aggregation_service import update_daily_summary
            update_daily_summary()
        except Exception as agg_err:
            print(f"Aggregation update warning: {agg_err}")
        
        return jsonify({
            'success': True,
            'message': 'Expense created successfully',
            'expense': new_expense.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to create expense: {str(e)}'
        }), 500

@expenses_bp.route('/<expense_id>', methods=['PUT'])
def update_expense(expense_id):
    """Update an existing expense"""
    try:
        data = request.json
        expense = Expense.query.get(expense_id)
        
        if not expense:
            return jsonify({'success': False, 'message': 'Expense not found'}), 404
            
        # Update Expense fields
        expense.title = data.get('title', expense.title)
        expense.category = data.get('category', expense.category)
        if 'amount' in data:
            expense.amount = float(data.get('amount'))
        expense.payment_method = data.get('payment_method', expense.payment_method)
        expense.worker_id = data.get('worker_id', expense.worker_id)
        if data.get('date'):
            expense.date = data.get('date')
        expense.notes = data.get('notes', expense.notes)
        
        # Update Items (Optional)
        items_data = data.get('items', [])
        if items_data:
            ExpenseItem.query.filter_by(expense_id=expense_id).delete()
            for item in items_data:
                product_id = item.get('product_id') or item.get('name')
                new_item = ExpenseItem(
                    id=str(uuid.uuid4()),
                    expense_id=expense_id,
                    product_id=product_id,
                    quantity=str(item.get('quantity', '1')),
                    purchase_price=float(item.get('purchase_price', 0)),
                    subtotal=float(item.get('subtotal', 0))
                )
                db.session.add(new_item)
                
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Expense updated successfully',
            'expense': expense.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Update failed: {str(e)}'}), 500

@expenses_bp.route('/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Delete an expense"""
    try:
        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({'success': False, 'message': 'Expense not found'}), 404
            
        db.session.delete(expense)
        db.session.commit()
        
        # Update pre-aggregated daily summary
        try:
            from services.aggregation_service import update_daily_summary
            update_daily_summary()
        except Exception:
            pass
        
        return jsonify({'success': True, 'message': 'Expense deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Delete failed: {str(e)}'}), 500
