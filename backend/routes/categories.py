from flask import Blueprint, request, jsonify
from services.db_service import DatabaseService
from config import config

categories_bp = Blueprint('categories', __name__, url_prefix='/api/categories')
db = DatabaseService()

@categories_bp.route('', methods=['GET'])
def get_categories():
    """Get all categories"""
    try:
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        categories = db.get_all_categories(include_inactive=include_inactive)
        return jsonify({
            'success': True,
            'categories': categories
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@categories_bp.route('', methods=['POST'])
def create_category():
    """Create a new category"""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({
                'success': False,
                'message': 'Category name is required'
            }), 400
            
        name = data['name'].strip()
        
        # Check if category already exists
        existing = db.get_category_by_name(name)
        if existing:
            return jsonify({
                'success': False,
                'message': f'Category "{name}" already exists'
            }), 400
            
        category_id = db.create_category({
            'name': name,
            'description': data.get('description', ''),
            'active': data.get('active', True)
        })
        
        if category_id:
            return jsonify({
                'success': True,
                'message': 'Category created successfully',
                'category_id': category_id
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to create category'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@categories_bp.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """Update a category"""
    try:
        data = request.get_json()
        
        if 'name' in data:
            # Check for duplicate name if name is changing
            existing = db.get_category_by_name(data['name'].strip())
            if existing and existing['id'] != category_id:
                return jsonify({
                    'success': False,
                    'message': f'Category "{data["name"]}" already exists'
                }), 400
        
        success = db.update_category(category_id, data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Category updated successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Category not found or no changes made'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """Securely remove or deactivate a category"""
    try:
        # Check usage
        usage = db.is_category_used(category_id)
        
        if usage['used']:
            # Force deactivation instead of removal
            db.update_category(category_id, {'active': False})
            return jsonify({
                'success': True,
                'message': f'Category is {usage["reason"]} and cannot be removed. It has been deactivated instead.',
                'action': 'deactivated'
            }), 200
        else:
            # Physical removal
            success = db.delete_category(category_id)
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Category removed successfully',
                    'action': 'removed'
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Category not found'
                }), 404
                
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@categories_bp.route('/<int:category_id>/usage', methods=['GET'])
def check_category_usage(category_id):
    """Check if category is used"""
    try:
        usage = db.is_category_used(category_id)
        return jsonify({
            'success': True,
            'usage': usage
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
