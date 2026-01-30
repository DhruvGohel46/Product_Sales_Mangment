from flask import Blueprint, request, jsonify, send_file
from services.sqlite_db_service import SQLiteDatabaseService
from services.excel_service import ExcelService
from services.excel_xlsx_service import ExcelXLSXService
from services.summary_service import SummaryService
import os
from datetime import date


reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')
db = SQLiteDatabaseService()
excel_service = ExcelService()
excel_xlsx_service = ExcelXLSXService()
summary_service = SummaryService(db)


@reports_bp.route('/excel/today', methods=['GET'])
def export_today_excel():
    """Export today's sales data to Excel (.xlsx format)"""
    try:
        # Get today's bills in ascending order by bill number
        bills = db.get_todays_bills()
        
        if not bills:
            # Return a sample Excel file when no bills exist
            today = date.today().strftime('%Y-%m-%d')
            sample_filepath = excel_xlsx_service.create_sample_report()
            if sample_filepath:
                return send_file(
                    sample_filepath,
                    as_attachment=True,
                    download_name=f"sample_sales_report_{today}.xlsx",
                    mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
            else:
                return jsonify({
                    'success': False,
                    'message': 'No bills found for today and failed to create sample report'
                }), 500
        
        # Get summary data
        summary = summary_service.get_today_summary()
        
        # Create detailed report
        report_type = request.args.get('type', 'detailed')  # detailed, summary, or simple
        
        if report_type == 'summary':
            filepath = excel_xlsx_service.export_summary_report(summary)
        elif report_type == 'simple':
            filepath = excel_xlsx_service.export_simple_sales_report(bills)
        else:  # detailed (default)
            filepath = excel_xlsx_service.export_detailed_sales_report(bills, summary)
        
        if not filepath:
            return jsonify({
                'success': False,
                'message': 'Failed to generate Excel report'
            }), 500
        
        # Send file for download
        return send_file(
            filepath,
            as_attachment=True,
            download_name=os.path.basename(filepath),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@reports_bp.route('/csv/today', methods=['GET'])
def export_today_csv():
    """Export today's bills data as CSV"""
    try:
        # Get today's bills in ascending order by bill number
        bills = db.get_todays_bills()
        
        if not bills:
            return jsonify({
                'success': False,
                'message': 'No bills found for today'
            }), 404
        
        # Create temporary file for download
        today_str = date.today().strftime("%Y-%m-%d")
        temp_filepath = os.path.join(excel_service.export_dir, f"bills_{today_str}.csv")
        
        # Generate CSV content
        csv_content = excel_service.generate_bills_csv(bills)
        
        with open(temp_filepath, 'w', encoding='utf-8') as f:
            f.write(csv_content)
        
        # Send file for download
        return send_file(
            temp_filepath,
            as_attachment=True,
            download_name=f"bills_{today_str}.csv",
            mimetype='text/csv'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@reports_bp.route('/preview/excel', methods=['GET'])
def preview_excel_data():
    """Preview Excel data without downloading"""
    try:
        # Get today's bills in ascending order by bill number
        bills = db.get_todays_bills()
        
        if not bills:
            return jsonify({
                'success': False,
                'message': 'No bills found for today'
            }), 404
        
        # Generate CSV content for preview
        filepath = excel_service.export_today_sales_to_csv(bills)
        
        if not filepath:
            return jsonify({
                'success': False,
                'message': 'Failed to generate preview'
            }), 500
        
        # Read and return content
        content = excel_service.get_csv_content(filepath)
        
        return jsonify({
            'success': True,
            'preview': content,
            'row_count': len(bills),
            'message': 'Preview generated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@reports_bp.route('/preview/xml', methods=['GET'])
def preview_xml_data():
    """Preview XML data without downloading"""
    try:
        # Get today's bills in ascending order by bill number
        bills = db.get_todays_bills()
        
        if not bills:
            return jsonify({
                'success': False,
                'message': 'No bills found for today'
            }), 404
        
        # Generate XML content
        xml_content = excel_service.generate_bills_xml(bills)
        
        return jsonify({
            'success': True,
            'preview': xml_content,
            'message': 'XML preview generated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@reports_bp.route('/available-reports', methods=['GET'])
def get_available_reports():
    """Get list of available reports and their info"""
    try:
        reports_info = {
            'excel_reports': [
                {
                    'name': 'Simple Sales Report',
                    'endpoint': '/api/reports/excel/today?type=simple',
                    'description': 'Basic sales data with bill details',
                    'format': 'CSV'
                },
                {
                    'name': 'Summary Report',
                    'endpoint': '/api/reports/excel/today?type=summary',
                    'description': 'Daily summary with category totals',
                    'format': 'CSV'
                },
                {
                    'name': 'Detailed Sales Report',
                    'endpoint': '/api/reports/excel/today?type=detailed',
                    'description': 'Comprehensive report with summary and detailed bills',
                    'format': 'CSV'
                }
            ],
            'xml_reports': [
                {
                    'name': 'Today\'s Bills XML',
                    'endpoint': '/api/reports/csv/today',
                    'description': 'Raw CSV data of today\'s bills',
                    'format': 'CSV'
                }
            ],
            'preview_endpoints': [
                {
                    'name': 'Excel Preview',
                    'endpoint': '/api/reports/preview/excel',
                    'description': 'Preview Excel data before download'
                },
                {
                    'name': 'XML Preview',
                    'endpoint': '/api/reports/preview/xml',
                    'description': 'Preview XML data before download'
                }
            ]
        }
        
        return jsonify({
            'success': True,
            'reports': reports_info
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500
