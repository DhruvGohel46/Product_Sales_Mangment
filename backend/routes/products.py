from flask import Blueprint, request, jsonify
from services.xml_db_service import XMLDatabaseService


products_bp = Blueprint('products', __name__, url_prefix='/api/products')
xml_db = XMLDatabaseService()


@products_bp.route('', methods=['POST'])
def create_product():
    """Create a new product"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['product_id', 'name', 'price', 'category']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields: product_id, name, price, category'
            }), 400
        
        product_id = data['product_id']
        name = data['name']
        price = float(data['price'])
        category = data['category']
        
        # Validate category
        if category not in ['coldrink', 'paan', 'other']:
            return jsonify({
                'success': False,
                'message': 'Invalid category. Must be: coldrink, paan, or other'
            }), 400
        
        # Validate price
        if price <= 0:
            return jsonify({
                'success': False,
                'message': 'Price must be greater than 0'
            }), 400
        
        # Add product
        success = xml_db.add_product(product_id, name, price, category)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Product created successfully',
                'product': {
                    'product_id': product_id,
                    'name': name,
                    'price': price,
                    'category': category,
                    'active': True
                }
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Product with this ID already exists'
            }), 409
            
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


@products_bp.route('', methods=['GET'])
def get_all_products():
    """Get all active products"""
    try:
        products = xml_db.get_all_products()
        
        return jsonify({
            'success': True,
            'products': products,
            'count': len(products)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
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
        success = xml_db.update_product(product_id, **update_data)
        
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
        products = xml_db.get_all_products()
        
        for product in products:
            if product['product_id'] == product_id:
                return jsonify({
                    'success': True,
                    'product': product
                }), 200
        
        return jsonify({
            'success': False,
            'message': f'Product with ID {product_id} not found'
        }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500
