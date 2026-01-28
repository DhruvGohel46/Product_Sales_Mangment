from flask import Blueprint, request, jsonify
from services.xml_db_service import XMLDatabaseService
from services.printer_service import PrinterService


billing_bp = Blueprint('billing', __name__, url_prefix='/api/bill')
xml_db = XMLDatabaseService()
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
            all_products = xml_db.get_all_products()
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
        
        # Get next bill number
        bill_no = xml_db.get_next_bill_number()
        
        # Create bill in database
        success = xml_db.create_bill(bill_no, validated_products, total)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Failed to create bill in database'
            }), 500
        
        # Prepare bill data for response and printing
        bill_data = {
            'bill_no': bill_no,
            'date': xml_db._get_today_bills_file().split('\\')[-1].replace('.xml', ''),
            'time': xml_db.get_bill(bill_no)['time'] if xml_db.get_bill(bill_no) else 'Unknown',
            'products': validated_products,
            'total': total
        }
        
        # Print bill (non-blocking - don't fail if printer doesn't work)
        try:
            printer_service.print_bill(bill_data)
        except Exception as e:
            print(f"Printer error (non-critical): {e}")
        
        return jsonify({
            'success': True,
            'message': 'Bill created successfully',
            'bill': bill_data
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
        bill = xml_db.get_bill(bill_no)
        
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
        bills = xml_db.get_today_bills()
        
        return jsonify({
            'success': True,
            'bills': bills,
            'count': len(bills),
            'date': xml_db._get_today_bills_file().split('\\')[-1].replace('.xml', '')
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
        next_bill_no = xml_db.get_next_bill_number()
        
        return jsonify({
            'success': True,
            'next_bill_number': next_bill_no
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@billing_bp.route('/print/<int:bill_no>', methods=['POST'])
def print_bill(bill_no):
    """Print an existing bill"""
    try:
        bill = xml_db.get_bill(bill_no)
        
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
