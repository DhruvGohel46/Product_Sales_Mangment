import os


class Config:
    """Configuration class for POS system"""
    
    # Base directory paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    
    # XML file paths
    PRODUCTS_FILE = os.path.join(DATA_DIR, "products.xml")
    BILLS_DIR = os.path.join(DATA_DIR, "bills")
    ARCHIVE_DIR = os.path.join(DATA_DIR, "archive")
    
    # Export directory
    EXPORT_DIR = os.path.join(DATA_DIR, "exports")
    
    # Reports directory for automated reports
    REPORTS_FOLDER = os.environ.get('REPORTS_FOLDER') or r"D:\Sales Data of other product"
    
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'pos-secret-key-for-local-development'
    DEBUG = True
    
    # Printer configuration
    PRINTER_NAME = os.environ.get('PRINTER_NAME') or 'Default Printer'
    MAX_CHARS_PER_LINE = 32
    
    # Shop information
    SHOP_NAME = os.environ.get('SHOP_NAME') or 'FAST FOOD SHOP'
    SHOP_ADDRESS = os.environ.get('SHOP_ADDRESS') or 'Your Address Here'
    SHOP_PHONE = os.environ.get('SHOP_PHONE') or 'Phone: XXXXXXXXXX'
    
    # Business configuration
    DEFAULT_CURRENCY = '₹'
    TAX_RATE = float(os.environ.get('TAX_RATE', 0.0))  # Tax rate as decimal (0.18 for 18%)
    
    # Security configuration
    RESET_PASSWORD = os.environ.get('RESET_PASSWORD') or 'Karam2@15'


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
