from flask import Blueprint, request, jsonify
from models import db, Shop, Subscription, User
from datetime import datetime, timedelta
import jwt
from functools import wraps
from flask import current_app

shop_bp = Blueprint('shop', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@shop_bp.route('/shops', methods=['GET'])
@token_required
def get_shops(current_user):
    shops = Shop.query.filter_by(user_id=current_user.id).all()
    return jsonify([shop.to_dict() for shop in shops]), 200

@shop_bp.route('/shops', methods=['POST'])
@token_required
def create_shop(current_user):
    data = request.get_json()
    if not data.get('shop_name'):
        return jsonify({'message': 'Shop name is required'}), 400
        
    new_shop = Shop(
        user_id=current_user.id,
        shop_name=data['shop_name'],
        city=data.get('city', '')
    )
    db.session.add(new_shop)
    db.session.commit()
    
    return jsonify(new_shop.to_dict()), 201

@shop_bp.route('/shops/<int:shop_id>/subscription', methods=['GET'])
@token_required
def get_subscription(current_user, shop_id):
    shop = Shop.query.get(shop_id)
    if not shop or shop.user_id != current_user.id:
        return jsonify({'message': 'Shop not found or access denied'}), 404
        
    # Get active subscription
    subscription = Subscription.query.filter_by(shop_id=shop_id, status='active').first()
    
    if not subscription:
        return jsonify({'message': 'No active subscription'}), 404
        
    return jsonify(subscription.to_dict()), 200

@shop_bp.route('/shops/<int:shop_id>/subscription', methods=['POST'])
@token_required
def create_subscription(current_user, shop_id):
    shop = Shop.query.get(shop_id)
    if not shop or shop.user_id != current_user.id:
        return jsonify({'message': 'Shop not found or access denied'}), 404
        
    data = request.get_json()
    plan = data.get('plan', 'Basic')
    
    # Check existing active subscription
    existing_sub = Subscription.query.filter_by(shop_id=shop_id, status='active').first()
    if existing_sub:
        existing_sub.status = 'cancelled' # Or handle upgrade logic
    
    # Create new subscription
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=30) # 30 days trial/plan
    
    new_sub = Subscription(
        shop_id=shop_id,
        plan=plan,
        start_date=start_date,
        end_date=end_date,
        status='active'
    )
    
    db.session.add(new_sub)
    db.session.commit()
    
    return jsonify(new_sub.to_dict()), 201
