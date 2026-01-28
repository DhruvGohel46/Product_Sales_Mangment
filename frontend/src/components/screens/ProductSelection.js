import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import { productsAPI } from '../../utils/api';
import { PRODUCT_CATEGORIES, CATEGORY_NAMES, CATEGORY_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

const ProductSelection = ({ onProductSelect, selectedProducts = [] }) => {
  const { currentTheme } = useTheme();
  const { cardVariants, staggerContainer, staggerItem } = useAnimation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAllProducts();
      setProducts(response.data.products || []);
      
      // Initialize quantities
      const initialQuantities = {};
      response.data.products?.forEach(product => {
        initialQuantities[product.product_id] = 1;
      });
      setQuantities(initialQuantities);
      
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Get product quantity
  const getProductQuantity = (productId) => {
    return quantities[productId] || 1;
  };

  // Update product quantity
  const updateQuantity = (productId, quantity) => {
    const validQuantity = Math.max(1, Math.min(999, quantity));
    setQuantities(prev => ({
      ...prev,
      [productId]: validQuantity
    }));
  };

  // Add product to bill
  const handleAddProduct = (product) => {
    const quantity = getProductQuantity(product.product_id);
    onProductSelect({
      ...product,
      quantity
    });
    
    // Reset quantity after adding
    setQuantities(prev => ({
      ...prev,
      [product.product_id]: 1
    }));
  };

  // Check if product is already in selected products
  const isProductSelected = (productId) => {
    return selectedProducts.some(p => p.product_id === productId);
  };

  // Get selected quantity for a product
  const getSelectedQuantity = (productId) => {
    const selected = selectedProducts.find(p => p.product_id === productId);
    return selected ? selected.quantity : 0;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: currentTheme.spacing[4]
      }}>
        <motion.div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid ' + currentTheme.colors.primary[200],
            borderTop: '3px solid ' + currentTheme.colors.primary[600],
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ color: currentTheme.colors.text.secondary }}>
          Loading products...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="error" padding="lg">
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: currentTheme.colors.error[600], marginBottom: currentTheme.spacing[4] }}>
            Error Loading Products
          </h3>
          <p style={{ color: currentTheme.colors.error[500], marginBottom: currentTheme.spacing[6] }}>
            {error}
          </p>
          <Button onClick={loadProducts} variant="primary">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[6] }}>
      {/* Header */}
      <div>
        <h2 style={{ 
          fontSize: currentTheme.typography.fontSize['2xl'],
          fontWeight: currentTheme.typography.fontWeight.semibold,
          color: currentTheme.colors.text.primary,
          marginBottom: currentTheme.spacing[2]
        }}>
          Select Products
        </h2>
        <p style={{ color: currentTheme.colors.text.secondary }}>
          Choose items to add to the current bill
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[4] }}>
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="lg"
        />
        
        {/* Category Filter */}
        <div style={{ 
          display: 'flex', 
          gap: currentTheme.spacing[3],
          flexWrap: 'wrap'
        }}>
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All ({products.length})
          </Button>
          
          {Object.values(PRODUCT_CATEGORIES).map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              style={{
                backgroundColor: selectedCategory === category 
                  ? CATEGORY_COLORS[category] 
                  : undefined
              }}
            >
              {CATEGORY_NAMES[category]} (
              {products.filter(p => p.category === category).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: currentTheme.spacing[4],
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const isSelected = isProductSelected(product.product_id);
            const selectedQty = getSelectedQuantity(product.product_id);
            const quantity = getProductQuantity(product.product_id);
            
            return (
              <motion.div
                key={product.product_id}
                variants={staggerItem}
                layout
              >
                <Card
                  variant={isSelected ? 'outlined' : 'default'}
                  hover={!isSelected}
                  padding="md"
                  style={{
                    borderLeft: `4px solid ${CATEGORY_COLORS[product.category]}`,
                    opacity: isSelected ? 0.7 : 1,
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: currentTheme.spacing[3]
                  }}>
                    {/* Product Header */}
                    <div>
                      <h3 style={{ 
                        fontSize: currentTheme.typography.fontSize.lg,
                        fontWeight: currentTheme.typography.fontWeight.semibold,
                        color: currentTheme.colors.text.primary,
                        marginBottom: currentTheme.spacing[1]
                      }}>
                        {product.name}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: currentTheme.spacing[2]
                      }}>
                        <span style={{
                          fontSize: currentTheme.typography.fontSize['2xl'],
                          fontWeight: currentTheme.typography.fontWeight.bold,
                          color: currentTheme.colors.primary[600],
                        }}>
                          {formatCurrency(product.price)}
                        </span>
                        <span style={{
                          fontSize: currentTheme.typography.fontSize.sm,
                          color: currentTheme.colors.text.secondary,
                          backgroundColor: CATEGORY_COLORS[product.category] + '20',
                          padding: `${currentTheme.spacing[1]} ${currentTheme.spacing[2]}`,
                          borderRadius: currentTheme.borderRadius.sm,
                        }}>
                          {CATEGORY_NAMES[product.category]}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: currentTheme.spacing[3]
                    }}>
                      <span style={{ 
                        fontSize: currentTheme.typography.fontSize.sm,
                        color: currentTheme.colors.text.secondary,
                        minWidth: '60px'
                      }}>
                        Qty:
                      </span>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: currentTheme.spacing[2],
                        flex: 1
                      }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(product.product_id, quantity - 1)}
                          disabled={quantity <= 1}
                          style={{ minWidth: '32px', padding: '0' }}
                        >
                          -
                        </Button>
                        <span style={{
                          fontSize: currentTheme.typography.fontSize.base,
                          fontWeight: currentTheme.typography.fontWeight.medium,
                          minWidth: '40px',
                          textAlign: 'center',
                        }}>
                          {quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(product.product_id, quantity + 1)}
                          disabled={quantity >= 999}
                          style={{ minWidth: '32px', padding: '0' }}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      variant={isSelected ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleAddProduct(product)}
                      disabled={isSelected}
                      fullWidth
                    >
                      {isSelected ? `Added (${selectedQty})` : `Add ${formatCurrency(product.price * quantity)}`}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card padding="lg" style={{ textAlign: 'center' }}>
          <div style={{ color: currentTheme.colors.text.secondary }}>
            <h3 style={{ marginBottom: currentTheme.spacing[2] }}>
              No products found
            </h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'No products in this category'
              }
            </p>
          </div>
        </Card>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductSelection;
