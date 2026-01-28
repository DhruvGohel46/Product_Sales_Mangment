from flask import Blueprint, jsonify
from services.xml_db_service import XMLDatabaseService
from services.summary_service import SummaryService


summary_bp = Blueprint('summary', __name__, url_prefix='/api/summary')
xml_db = XMLDatabaseService()
summary_service = SummaryService(xml_db)


@summary_bp.route('/today', methods=['GET'])
def get_today_summary():
    """Get today's sales summary"""
    try:
        summary = summary_service.get_today_summary()
        
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@summary_bp.route('/date/<date_str>', methods=['GET'])
def get_summary_for_date(date_str):
    """Get summary for a specific date (YYYY-MM-DD format)"""
    try:
        # Basic date format validation
        if len(date_str) != 10 or date_str[4] != '-' or date_str[7] != '-':
            return jsonify({
                'success': False,
                'message': 'Invalid date format. Use YYYY-MM-DD'
            }), 400
        
        try:
            year, month, day = map(int, date_str.split('-'))
            # Basic validation (not comprehensive)
            if year < 2020 or year > 2030 or month < 1 or month > 12 or day < 1 or day > 31:
                raise ValueError("Invalid date")
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid date values'
            }), 400
        
        summary = summary_service.get_summary_for_date(date_str)
        
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@summary_bp.route('/top-products', methods=['GET'])
def get_top_selling_products():
    """Get top selling products for today"""
    try:
        # Get limit from query parameter (default 10)
        limit = 10
        if 'limit' in request.args:
            try:
                limit = int(request.args.get('limit'))
                if limit <= 0 or limit > 100:
                    limit = 10
            except ValueError:
                limit = 10
        
        top_products = summary_service.get_top_selling_products(limit)
        
        return jsonify({
            'success': True,
            'top_products': top_products,
            'count': len(top_products)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@summary_bp.route('/quick-stats', methods=['GET'])
def get_quick_stats():
    """Get quick statistics for dashboard"""
    try:
        summary = summary_service.get_today_summary()
        
        # Extract key metrics for quick view
        quick_stats = {
            'total_bills': summary.get('total_bills', 0),
            'total_sales': summary.get('total_sales', 0.0),
            'average_bill_value': summary.get('average_bill_value', 0.0),
            'first_bill_time': summary.get('first_bill_time'),
            'last_bill_time': summary.get('last_bill_time'),
            'peak_hour': summary.get('peak_hour'),
            'category_count': len(summary.get('category_totals', {}))
        }
        
        return jsonify({
            'success': True,
            'quick_stats': quick_stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500
