from flask import Blueprint, request, jsonify
from services.sqlite_db_service import SQLiteDatabaseService
from services.printer_service import PrinterService
from config import config


billing_bp = Blueprint('billing', __name__, url_prefix='/api/bill')
db = SQLiteDatabaseService()
printer_service = PrinterService()


@billing_bp.route('/create', methods=['POST'])
def create_bill():
    """Create a new bill"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'products' not in data or not data['products']:
            return jsonify({
                'success': False,
                'message': 'Products list is required and cannot be empty'
            }), 400
        
        products = data['products']
        
        # Validate each product in the bill
        validated_products = []
        total = 0.0
        
        for product_data in products:
            if not all(key in product_data for key in ['product_id', 'quantity']):
                return jsonify({
                    'success': False,
                    'message': 'Each product must have product_id and quantity'
                }), 400
            
            product_id = product_data['product_id']
            quantity = int(product_data['quantity'])
            
            if quantity <= 0:
                return jsonify({
                    'success': False,
                    'message': f'Quantity must be greater than 0 for product {product_id}'
                }), 400
            
            # Get product details from database
            all_products = db.get_all_products()
            product_found = None
            
            for product in all_products:
                if product['product_id'] == product_id:
                    product_found = product
                    break
            
            if not product_found:
                return jsonify({
                    'success': False,
                    'message': f'Product with ID {product_id} not found'
                }), 404
            
            # Add to validated products
            line_total = product_found['price'] * quantity
            validated_products.append({
                'product_id': product_id,
                'name': product_found['name'],
                'price': product_found['price'],
                'quantity': quantity
            })
            total += line_total
        
        # Create bill in database
        bill_data = {
            'customer_name': data.get('customer_name', ''),
            'total_amount': total,
            'items': validated_products
        }
        
        bill_no = db.create_bill(bill_data)
        
        if not bill_no:
            return jsonify({
                'success': False,
                'message': 'Failed to create bill in database'
            }), 500
        
        # Get the created bill for response
        created_bill = db.get_bill(bill_no)
        
        # Prepare bill data for response and printing
        bill_response = {
            'bill_no': bill_no,
            'date': created_bill['created_at'].split(' ')[0],
            'time': created_bill['created_at'].split(' ')[1],
            'products': validated_products,
            'total': total
        }
        
        # Check if printing is requested
        should_print = data.get('print', False)
        
        # Print bill only if requested (non-blocking - don't fail if printer doesn't work)
        if should_print:
            try:
                printer_service.print_bill(bill_response)
            except Exception as e:
                print(f"Printer error (non-critical): {e}")
        
        return jsonify({
            'success': True,
            'message': 'Bill created successfully',
            'bill': bill_response
        }), 201
        
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


@billing_bp.route('/<int:bill_no>', methods=['GET'])
def get_bill(bill_no):
    """Get a specific bill by number"""
    try:
        bill = db.get_bill(bill_no)
        
        if bill:
            return jsonify({
                'success': True,
                'bill': bill
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Bill with number {bill_no} not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@billing_bp.route('/today', methods=['GET'])
def get_today_bills():
    """Get all bills for today"""
    try:
        # Use the DB service's specific method for today's bills (already handles local date)
        bills = db.get_todays_bills()
        
        return jsonify({
            'success': True,
            'bills': bills
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@billing_bp.route('/date/<string:date_str>', methods=['GET'])
def get_bills_by_date(date_str):
    """Get all bills for a specific date (YYYY-MM-DD)"""
    try:
        # Validate date format
        import datetime
        try:
            datetime.datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
             return jsonify({
                'success': False,
                'message': 'Invalid date format. Use YYYY-MM-DD'
            }), 400

        # Use the DB service's specific method for date filtering
        bills = db.get_bills_by_date(date_str)
        
        return jsonify({
            'success': True,
            'bills': bills
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@billing_bp.route('/next-number', methods=['GET'])
def get_next_bill_number():
    """Get the next bill number for today"""
    try:
        # Get bills for today ONLY (using the method that respects local time)
        bills = db.get_todays_bills()
        if bills:
            next_bill_no = max(bill['bill_no'] for bill in bills) + 1
        else:
            next_bill_no = 1
        
        return jsonify({
            'success': True,
            'next_bill_number': next_bill_no
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500



@billing_bp.route('/management/all', methods=['GET'])
def get_all_bills_management():
    """Get ALL bills for management (including cancelled)"""
    try:
        # Accept optional date parameter for daily management refresh
        date_param = request.args.get('date')
        
        if date_param:
            bills = db.get_bills_by_date_range(date_param, date_param)
        else:
            # Default to all bills if no date provided
            bills = db.get_all_bills_management()
            
        return jsonify({
            'success': True,
            'bills': bills
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@billing_bp.route('/<int:bill_no>/cancel', methods=['PUT'])
def cancel_bill(bill_no):
    """Cancel a specific bill"""
    try:
        success = db.cancel_bill(bill_no)
        if success:
            return jsonify({
                'success': True,
                'message': f'Bill {bill_no} cancelled successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Failed to cancel bill {bill_no}'
            }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@billing_bp.route('/<int:bill_no>/update', methods=['PUT'])
def update_bill(bill_no):
    """Update an existing bill"""
    try:
        data = request.get_json()
        
        products = data.get('products', [])
        total = 0.0
        validated_products = []
        
        if products:
             for product_data in products:
                product_id = product_data['product_id']
                quantity = int(product_data['quantity'])
                
                # Get product details from database
                product_found = db.get_product(product_id)
                
                if not product_found:
                    return jsonify({
                        'success': False,
                        'message': f'Product with ID {product_id} not found'
                    }), 404
                
                line_total = product_found['price'] * quantity
                validated_products.append({
                    'product_id': product_id,
                    'name': product_found['name'],
                    'price': product_found['price'],
                    'quantity': quantity
                })
                total += line_total
        
        bill_update_data = {
            'customer_name': data.get('customer_name', ''),
            'total_amount': total if products else data.get('total_amount', 0),
            'items': validated_products
        }
        
        success = db.update_bill(bill_no, bill_update_data)
        
        if success:
             return jsonify({
                'success': True,
                'message': f'Bill {bill_no} updated successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to update bill'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@billing_bp.route('/print/<int:bill_no>', methods=['POST'])
def print_bill(bill_no):
    """Print an existing bill"""
    try:
        db = SQLiteDatabaseService()
        bill = db.get_bill(bill_no)
        
        if not bill:
            return jsonify({
                'success': False,
                'message': f'Bill with number {bill_no} not found'
            }), 404
        
        # Print the bill
        success = printer_service.print_bill(bill)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Bill {bill_no} printed successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to print bill'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@billing_bp.route('/clear', methods=['DELETE'])
def clear_all_bills():
    """Clear all bills from the database - requires password authentication"""
    try:
        data = request.get_json()
        
        # Validate password
        if not data or 'password' not in data:
            return jsonify({
                'success': False,
                'message': 'Password is required'
            }), 400
        
        # Use same password as products reset from config
        RESET_PASSWORD = config['default'].RESET_PASSWORD
        
        if data['password'] != RESET_PASSWORD:
            return jsonify({
                'success': False,
                'message': 'Invalid password'
            }), 401
        
        db = SQLiteDatabaseService()
        success = db.clear_all_bills()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'All bills cleared successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to clear bills'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500
