from flask import Blueprint, request, jsonify
from services.db_service import DatabaseService

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')
db = DatabaseService()

@inventory_bp.route('', methods=['GET'])
def get_all_inventory():
    """Get all inventory with status"""
    try:
        items = db.get_all_inventory()
        return jsonify({
            'success': True,
            'inventory': items
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching inventory: {str(e)}'
        }), 500

@inventory_bp.route('/low-stock', methods=['GET'])
def get_low_stock():
    """Get low stock items for notifications"""
    try:
        items = db.get_low_stock_products()
        return jsonify({
            'success': True,
            'low_stock_items': items,
            'count': len(items)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching low stock: {str(e)}'
        }), 500

@inventory_bp.route('/<int:item_id>', methods=['GET'])
def get_inventory_item(item_id):
    """Get specific inventory item"""
    try:
        item = db.get_inventory_item(item_id)
        if item:
            return jsonify({
                'success': True,
                'item': item
            })
        return jsonify({
            'success': False,
            'message': 'Item not found'
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching item: {str(e)}'
        }), 500

@inventory_bp.route('/create', methods=['POST'])
def create_inventory():
    """Create new inventory item"""
    try:
        data = request.get_json()
        
        # Validation
        if not all(k in data for k in ['name', 'type', 'unit']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
            
        item_id = db.create_inventory_item(data)
        
        if item_id:
            return jsonify({
                'success': True,
                'message': 'Inventory item created',
                'id': item_id
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to create item (Product may already be linked or is inactive)'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creating item: {str(e)}'
        }), 500

@inventory_bp.route('/<int:item_id>', methods=['PUT'])
def update_inventory(item_id):
    """Update inventory item details"""
    try:
        existing = db.get_inventory_item(item_id)
        if existing and existing.get('is_locked'):
            return jsonify({
                'success': False,
                'message': 'Product is inactive. Reactivate from Management before editing inventory.'
            }), 409

        data = request.get_json()
        success = db.update_inventory(item_id, data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Inventory updated successfully'
            })
        return jsonify({
            'success': False,
            'message': 'Item not found or update failed'
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error updating item: {str(e)}'
        }), 500

@inventory_bp.route('/adjust', methods=['POST'])
def adjust_stock():
    """Adjust stock level (+/-)"""
    try:
        data = request.get_json()
        item_id = data.get('id')
        adjustment = float(data.get('adjustment', 0))
        
        if not item_id:
             return jsonify({
                'success': False,
                'message': 'Item ID required'
            }), 400

        item = db.get_inventory_item(item_id)
        if item and item.get('is_locked'):
            return jsonify({
                'success': False,
                'message': 'Product is inactive. Reactivate from Management before adjusting stock.'
            }), 409
            
        success = db.adjust_inventory_stock(item_id, adjustment)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Stock adjusted successfully'
            })
        return jsonify({
            'success': False,
            'message': 'Item not found'
        }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error adjusting stock: {str(e)}'
        }), 500

@inventory_bp.route('/<int:item_id>', methods=['DELETE'])
def delete_inventory(item_id):
    """Delete inventory item"""
    try:
        existing = db.get_inventory_item(item_id)
        if existing and existing.get('is_locked'):
            return jsonify({
                'success': False,
                'message': 'Inactive product inventory is locked and cannot be deleted.'
            }), 409

        success = db.delete_inventory_item(item_id)
        if success:
            return jsonify({
                'success': True,
                'message': 'Item deleted successfully'
            })
        return jsonify({
            'success': False,
            'message': 'Item not found'
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error deleting item: {str(e)}'
        }), 500
