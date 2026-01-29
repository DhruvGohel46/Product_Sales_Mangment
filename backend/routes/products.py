from flask import Blueprint, request, jsonify
from services.sqlite_db_service import SQLiteDatabaseService
import os


products_bp = Blueprint('products', __name__, url_prefix='/api/products')
db = SQLiteDatabaseService()
RESET_PASSWORD = "Karam2@15"


@products_bp.route('', methods=['POST'])
def create_product():
    """Create a new product"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['name', 'price', 'category']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields: name, price, category'
            }), 400
        
        name = data['name']
        price = float(data['price'])
        category = data['category']
        active = data.get('active', True)
        
        # Validate category
        if category not in ['coldrink', 'paan', 'other']:
            return jsonify({
                'success': False,
                'message': 'Invalid category. Must be: coldrink, paan, or other'
            }), 400
        
        # Create product with auto-generated ID
        product_data = {
            'product_id': data['product_id'],
            'name': name,
            'price': price,
            'category': category,
            'active': active
        }
        
        success = db.create_product(product_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Product created successfully',
                'product': product_data
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Product ID already exists'
            }), 400
            
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': f'Invalid price format: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creating product: {str(e)}'
        }), 500


@products_bp.route('', methods=['GET'])
def get_all_products():
    """Get all active products"""
    try:
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        include_deleted = request.args.get('include_deleted', 'false').lower() == 'true'
        
        products = db.get_all_products(include_inactive=include_inactive)
        
        return jsonify({
            'success': True,
            'products': products
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching products: {str(e)}'
        }), 500


@products_bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product"""
    try:
        data = request.get_json()
        
        # Validate at least one field to update
        if not any(key in data for key in ['name', 'price', 'category', 'active']):
            return jsonify({
                'success': False,
                'message': 'No fields to update. Provide at least one: name, price, category, active'
            }), 400
        
        # Extract and validate update data
        update_data = {}
        
        if 'name' in data:
            update_data['name'] = data['name']
        
        if 'price' in data:
            price = float(data['price'])
            if price <= 0:
                return jsonify({
                    'success': False,
                    'message': 'Price must be greater than 0'
                }), 400
            update_data['price'] = price
        
        if 'category' in data:
            category = data['category']
            if category not in ['coldrink', 'paan', 'other']:
                return jsonify({
                    'success': False,
                    'message': 'Invalid category. Must be: coldrink, paan, or other'
                }), 400
            update_data['category'] = category
        
        if 'active' in data:
            active = data['active']
            if isinstance(active, str):
                active = active.lower() in ['true', '1', 'yes']
            update_data['active'] = bool(active)
        
        # Update product
        success = db.update_product(product_id, update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Product updated successfully',
                'product_id': product_id,
                'updated_fields': list(update_data.keys())
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Product with ID {product_id} not found'
            }), 404
            
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': f'Invalid data format: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        product = db.get_product(product_id)
        
        if product:
            return jsonify({
                'success': True,
                'product': product
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Product with ID {product_id} not found'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@products_bp.route('/reset-database', methods=['POST'])
def reset_database():
    """Reset the entire database - requires password authentication"""
    try:
        data = request.get_json()
        
        # Validate password
        if not data or 'password' not in data:
            return jsonify({
                'success': False,
                'message': 'Password is required'
            }), 400
        
        if data['password'] != RESET_PASSWORD:
            return jsonify({
                'success': False,
                'message': 'Invalid password'
            }), 401
        
        # Clear all bills
        bills_cleared = db.clear_all_bills()
        
        # Clear all products
        products_cleared = db.clear_all_products()
        
        if bills_cleared and products_cleared:
            return jsonify({
                'success': True,
                'message': 'Database reset successfully - all products and bills have been cleared'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to reset database'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error resetting database: {str(e)}'
        }), 500
