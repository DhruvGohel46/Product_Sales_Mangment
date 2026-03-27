import uuid
from flask import Blueprint, jsonify, request
from models import db, Inventory, func

# We will define Expense and ExpenseItem in models.py
from models import Expense, ExpenseItem

expenses_bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')

@expenses_bp.route('', methods=['GET'])
def get_expenses():
    """Get all expenses"""
    try:
        limit = request.args.get('limit', 100, type=int)
        expenses = Expense.query.order_by(Expense.created_at.desc()).limit(limit).all()
        
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
        if not data.get('category') or not data.get('total_amount'):
            return jsonify({
                'success': False,
                'message': 'Category and total amount are required'
            }), 400
            
        # Create Expense
        new_expense = Expense(
            id=str(uuid.uuid4()),
            supplier_name=data.get('supplier_name'),
            category=data.get('category'),
            total_amount=float(data.get('total_amount')),
            payment_method=data.get('payment_method', 'Cash'),
            expense_date=data.get('expense_date') or func.now(),
            notes=data.get('notes', '')
        )
        
        db.session.add(new_expense)
        
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
            if new_expense.category == 'Inventory Purchase' and product_id:
                # Try to parse quantity as float for inventory update
                try:
                    # Remove all non-numeric characters except decimal point for basic parsing?
                    # Or just try direct float conversion. Let's try direct first.
                    # If it's something like "5 kg", it will fail, which is correct (can't auto-update stock with text).
                    quantity_float = float(quantity_str.split()[0]) # Try taking the first part if it's "5 kg"
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
        expense.supplier_name = data.get('supplier_name', expense.supplier_name)
        expense.category = data.get('category', expense.category)
        expense.total_amount = float(data.get('total_amount', expense.total_amount))
        expense.payment_method = data.get('payment_method', expense.payment_method)
        if data.get('expense_date'):
            expense.expense_date = data.get('expense_date')
        expense.notes = data.get('notes', expense.notes)
        
        # Update Items (Simplified system: usually just one item)
        items_data = data.get('items', [])
        if items_data:
            # Clear old items and add new ones
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
        
        return jsonify({'success': True, 'message': 'Expense deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Delete failed: {str(e)}'}), 500
