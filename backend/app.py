from flask import Flask, jsonify
from flask_cors import CORS
import os
import threading
from dotenv import load_dotenv
from config import config

# Load environment variables from .env file
load_dotenv()

# Import route blueprints
from routes.products import products_bp
from routes.billing import billing_bp
from routes.summary import summary_bp
from routes.reports import reports_bp
from routes.categories import categories_bp

# Import dashboard refresher
from dashboard_refresher import DashboardRefresher


def start_dashboard_refresher():
    """Start the dashboard refresher in a separate thread"""
    try:
        refresher = DashboardRefresher()
        print("🔄 Dashboard Refresher started - Daily refresh at 12:01 AM")
        print(f"📁 Archive directory: {refresher.archive_dir}")
        refresher.start_scheduler()
    except Exception as e:
        print(f"❌ Failed to start dashboard refresher: {e}")


def create_app(config_name='default'):
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Enable CORS for all routes
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(products_bp)
    app.register_blueprint(billing_bp)
    app.register_blueprint(summary_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(categories_bp)
    
    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'POS Backend API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'products': '/api/products',
                'billing': '/api/bill',
                'summary': '/api/summary',
                'reports': '/api/reports',
                'categories': '/api/categories'
            }
        })
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': str(os.times()),
            'data_directory': app.config['DATA_DIR']
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint not found',
            'error': str(error)
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error': str(error)
        }), 500
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': 'Method not allowed',
            'error': str(error)
        }), 405
    
    return app


if __name__ == '__main__':
    # Create app and run development server
    app = create_app('development')
    
    # Ensure data directory exists
    os.makedirs(app.config['DATA_DIR'], exist_ok=True)
    os.makedirs(app.config['BILLS_DIR'], exist_ok=True)
    os.makedirs(app.config['ARCHIVE_DIR'], exist_ok=True)
    os.makedirs(app.config['EXPORT_DIR'], exist_ok=True)
    
    # Start dashboard refresher in background thread
    refresher_thread = threading.Thread(target=start_dashboard_refresher, daemon=True)
    refresher_thread.start()
    
    print("Starting POS Backend Server...")
    print(f"Data directory: {app.config['DATA_DIR']}")
    print(f"Server running on: http://localhost:5050")
    print("🔄 Dashboard Refresher is running in background")
    
    app.run(
        host='0.0.0.0',
        port=5050,
        debug=app.config['DEBUG'],
        use_reloader=False  # Prevent duplicate refresher threads
    )
