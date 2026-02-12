from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from models import db, User, Shop

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    shop_name = data.get('shop_name')
    
    if not all([name, email, password, shop_name]):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409
        
    try:
        # Create User
        hashed_password = generate_password_hash(password)
        new_user = User(
            name=name,
            email=email,
            password_hash=hashed_password
        )
        db.session.add(new_user)
        db.session.flush() # Flush to get user ID
        
        # Create Shop
        new_shop = Shop(
            user_id=new_user.id,
            shop_name=shop_name
        )
        db.session.add(new_shop)
        
        db.session.commit()
        
        return jsonify({'message': 'Registration successful'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Missing credentials'}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    # Generate Token
    token = jwt.encode({
        'user_id': user.id,
        'email': user.email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': user.to_dict(),
        'shops': [shop.to_dict() for shop in user.shops] if user.shops else []
    }), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    # Middleware placeholder (Implement proper JWT middleware later)
    # For now, just a stub
    return jsonify({'message': 'Protected route placeholder'}), 200
