from flask import Blueprint, request, jsonify
from services.sqlite_db_service import SQLiteDatabaseService
from config import config
import os
import re
from werkzeug.utils import secure_filename
from rembg import remove, new_session
from PIL import Image

# Initialize rembg session with u2netp (fastest) as requested
# Loading it globally prevents reloading on every request
bg_session = new_session("u2netp")


products_bp = Blueprint('products', __name__, url_prefix='/api/products')
db = SQLiteDatabaseService()


@products_bp.route('', methods=['POST'])
def create_product():
    """Create a new product"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['product_id', 'name', 'price', 'category']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields: product_id, name, price, category'
            }), 400
        
        name = data['name']
        price = float(data['price'])
        category_id = data.get('category_id')
        category_name = data.get('category')
        active = data.get('active', True)
        
        # If category_id is not provided but name is, find the ID
        if not category_id and category_name:
            cat = db.get_category_by_name(category_name)
            if cat:
                category_id = cat['id']
            else:
                # Create category on the fly if it doesn't exist?
                # For safety, let's keep it restricted or use 'other'
                other_cat = db.get_category_by_name('other')
                category_id = other_cat['id'] if other_cat else None
        
        # Create product data
        product_data = {
            'product_id': data['product_id'],
            'name': name,
            'price': price,
            'category_id': category_id,
            'category': category_name, # Legacy field
            'active': active
        }
        
        success = db.create_product(product_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Product created successfully',
                'product': product_data
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Product ID already exists'
            }), 400
            
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': f'Invalid price format: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creating product: {str(e)}'
        }), 500


@products_bp.route('', methods=['GET'])
def get_all_products():
    """Get all active products"""
    try:
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        include_deleted = request.args.get('include_deleted', 'false').lower() == 'true'
        
        products = db.get_all_products(include_inactive=include_inactive)
        
        return jsonify({
            'success': True,
            'products': products
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching products: {str(e)}'
        }), 500


@products_bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product"""
    try:
        data = request.get_json()
        
        # Validate at least one field to update
        if not any(key in data for key in ['name', 'price', 'category', 'active']):
            return jsonify({
                'success': False,
                'message': 'No fields to update. Provide at least one: name, price, category, active'
            }), 400
        
        # Extract and validate update data
        update_data = {}
        
        if 'name' in data:
            update_data['name'] = data['name']
        
        if 'price' in data:
            price = float(data['price'])
            if price <= 0:
                return jsonify({
                    'success': False,
                    'message': 'Price must be greater than 0'
                }), 400
            update_data['price'] = price
        
        if 'category_id' in data:
            update_data['category_id'] = data['category_id']
            
        if 'category' in data: # Legacy name update
            category_name = data['category']
            update_data['category'] = category_name
            # Also update category_id if name matches
            cat = db.get_category_by_name(category_name)
            if cat:
                update_data['category_id'] = cat['id']
        
        if 'active' in data:
            active = data['active']
            if isinstance(active, str):
                active = active.lower() in ['true', '1', 'yes']
            update_data['active'] = bool(active)

        # Handle product name change -> Rename image
        if 'name' in update_data:
            product = db.get_product(product_id)
            if product and product.get('image_filename'):
                old_filename = product['image_filename']
                ext = os.path.splitext(old_filename)[1]
                new_safe_name = get_safe_filename(update_data['name'])
                new_filename = f"{new_safe_name}{ext}"
                
                if old_filename != new_filename:
                    images_dir = os.path.join(config['default'].DATA_DIR, 'images')
                    old_path = os.path.join(images_dir, old_filename)
                    new_path = os.path.join(images_dir, new_filename)
                    
                    if os.path.exists(old_path):
                        try:
                            # Check if target exists (rare collision), remove it?
                            # For now just rename
                            os.rename(old_path, new_path)
                            update_data['image_filename'] = new_filename
                        except Exception as e:
                            print(f"Error renaming image: {e}")
        
        # Update product
        success = db.update_product(product_id, update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Product updated successfully',
                'product_id': product_id,
                'updated_fields': list(update_data.keys())
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Product with ID {product_id} not found'
            }), 404
            
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


@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        product = db.get_product(product_id)
        
        if product:
            return jsonify({
                'success': True,
                'product': product
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Product with ID {product_id} not found'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@products_bp.route('/reset-database', methods=['POST'])
def reset_database():
    """Reset the entire database - requires password authentication"""
    try:
        data = request.get_json()
        
        # Validate password
        if not data or 'password' not in data:
            return jsonify({
                'success': False,
                'message': 'Password is required'
            }), 400
        
        # Use password from config
        RESET_PASSWORD = config['default'].RESET_PASSWORD
        
        if data['password'] != RESET_PASSWORD:
            return jsonify({
                'success': False,
                'message': 'Invalid password'
            }), 401
        
        # Clear all bills
        bills_cleared = db.clear_all_bills()
        
        # Clear all products
        products_cleared = db.clear_all_products()
        
        if bills_cleared and products_cleared:
            return jsonify({
                'success': True,
                'message': 'Database reset successfully - all products and bills have been cleared'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to reset database'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error resetting database: {str(e)}'
        }), 500


# IMAGE MANAGEMENT ROUTES

def get_safe_filename(product_name):
    """Convert product name to safe filename (lowercase, hyphens)"""
    # Remove special chars, replace spaces with hyphens, lowercase
    s = str(product_name).lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s-]+', '-', s)
    return s

@products_bp.route('/<product_id>/image', methods=['POST'])
def upload_product_image(product_id):
    """Upload product image"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image file provided'}), 400
            
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'}), 400
            
        if file:
            # Get product to get the name
            product = db.get_product(product_id)
            if not product:
                return jsonify({'success': False, 'message': 'Product not found'}), 404
                
            # Generate safe filename from product name
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                return jsonify({'success': False, 'message': 'Invalid image format'}), 400
                
            safe_name = get_safe_filename(product['name'])
            # Force PNG for background-removed images (supports transparency)
            filename = f"{safe_name}.png"
            
            # Save file
            images_dir = os.path.join(config['default'].DATA_DIR, 'images')
            os.makedirs(images_dir, exist_ok=True)
            
            # Remove old image if exists (check for same name with diff ext, or previous image)
            # Actually, let's trust we overwrite if name is same. 
            # But if extension changes, we might have orphans. 
            # Ideally we check product['image_filename'] and delete it if it's different.
            if product.get('image_filename'):
                old_path = os.path.join(images_dir, product['image_filename'])
                if os.path.exists(old_path) and product['image_filename'] != filename:
                    try:
                        os.remove(old_path)
                    except:
                        pass

            # Define file path
            file_path = os.path.join(images_dir, filename)

            # Process image with rembg (u2netp)
            try:
                # Load image with PIL
                img = Image.open(file).convert('RGB')
                
                # Process image using the global session (returns RGBA with transparency)
                output = remove(img, session=bg_session)
                
                # Save as PNG to preserve transparency
                output.save(file_path, format='PNG')
                
            except Exception as e:
                print(f"Background removal failed: {e}")
                # Fallback: Save original file if processing fails
                file.seek(0)
                img = Image.open(file)
                img.save(file_path, format='PNG')
            
            # Update DB
            success = db.update_product(product_id, {'image_filename': filename})
            
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Image uploaded successfully (Background removed)',
                    'image_filename': filename
                })
            else:
                return jsonify({'success': False, 'message': 'Failed to update database'}), 500
                
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error uploading image: {str(e)}'}), 500

@products_bp.route('/<product_id>/image', methods=['DELETE'])
def delete_product_image(product_id):
    """Delete product image"""
    try:
        product = db.get_product(product_id)
        if not product:
            return jsonify({'success': False, 'message': 'Product not found'}), 404
            
        filename = product.get('image_filename')
        if filename:
            images_dir = os.path.join(config['default'].DATA_DIR, 'images')
            file_path = os.path.join(images_dir, filename)
            
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error removing file: {e}")
            
            # Update DB
            db.update_product(product_id, {'image_filename': None})
            
        return jsonify({
            'success': True,
            'message': 'Image deleted successfully'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error deleting image: {str(e)}'}), 500

@products_bp.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product and its associated image"""
    try:
        product = db.get_product(product_id)
        if not product:
            return jsonify({
                'success': False,
                'message': f'Product with ID {product_id} not found'
            }), 404
            
        # Delete image file if exists
        filename = product.get('image_filename')
        if filename:
            images_dir = os.path.join(config['default'].DATA_DIR, 'images')
            file_path = os.path.join(images_dir, filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error removing image file during product delete: {e}")

        # Delete from DB
        success = db.delete_product(product_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Product deleted successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to delete product'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500
