from flask import Blueprint, jsonify, request
from services.sqlite_db_service import SQLiteDatabaseService

settings_bp = Blueprint('settings', __name__)
db_service = SQLiteDatabaseService()

@settings_bp.route('/api/settings', methods=['GET'])
def get_settings():
    """Get all settings"""
    try:
        settings = db_service.get_all_settings()
        return jsonify(settings)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching settings: {str(e)}'
        }), 500

@settings_bp.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update settings (bulk or single)"""
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Check if it's a list or a dict
        if isinstance(data, list):
            # Expect list of {key, value, group_name}
            success = db_service.update_settings_bulk(data)
        elif isinstance(data, dict):
            # Convert dict {key: value} to list format for bulk update, 
            # OR handle single update if structure matches {key, value, group}
            # Simplest approach: Treat input as {key: value} map for bulk update
            settings_list = []
            for k, v in data.items():
                settings_list.append({'key': k, 'value': v})
            success = db_service.update_settings_bulk(settings_list)
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid data format'
            }), 400

        if success:
            return jsonify({
                'success': True,
                'message': 'Settings updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to update settings'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error updating settings: {str(e)}'
        }), 500
