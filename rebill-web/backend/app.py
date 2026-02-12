from flask import Flask, jsonify
from flask_cors import CORS
from config import DevelopmentConfig
from models import db

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    
    # Register blueprints (routes)
    from routes.auth import auth_bp
    from routes.shop import shop_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(shop_bp, url_prefix='/api')
    
    @app.route('/')
    def index():
        return jsonify({"message": "ReBill SaaS Backend Running"})

    # Create tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=8000)
