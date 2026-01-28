import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import { productsAPI } from '../../utils/api';
import { handleAPIError, formatCurrency } from '../../utils/api';
import { PRODUCT_CATEGORIES, CATEGORY_NAMES, CATEGORY_COLORS } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

const ProductManagement = () => {
  const { currentTheme } = useTheme();
  const { cardVariants, staggerContainer, staggerItem } = useAnimation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    price: '',
    category: PRODUCT_CATEGORIES.OTHER,
    active: true
  });

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await productsAPI.getAllProducts();
      setProducts(response.data.products || []);
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      product_id: '',
      name: '',
      price: '',
      category: PRODUCT_CATEGORIES.OTHER,
      active: true
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.name || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      
      const productData = {
        product_id: formData.product_id,
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        active: formData.active
      };

      if (editingProduct) {
        // Update existing product
        await productsAPI.updateProduct(editingProduct.product_id, productData);
      } else {
        // Create new product
        await productsAPI.createProduct(productData);
      }

      resetForm();
      loadProducts();
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setFormData({
      product_id: product.product_id,
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      active: product.active
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  // Toggle product active status
  const handleToggleActive = async (product) => {
    try {
      setError('');
      
      await productsAPI.updateProduct(product.product_id, {
        active: !product.active
      });
      
      loadProducts();
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  // Delete product (deactivate)
  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to deactivate "${product.name}"?`)) {
      return;
    }

    try {
      setError('');
      
      await productsAPI.updateProduct(product.product_id, {
        active: false
      });
      
      loadProducts();
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[6] }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ 
            fontSize: currentTheme.typography.fontSize['2xl'],
            fontWeight: currentTheme.typography.fontWeight.semibold,
            color: currentTheme.colors.text.primary,
            marginBottom: currentTheme.spacing[2]
          }}>
            Product Management
          </h2>
          <p style={{ color: currentTheme.colors.text.secondary }}>
            Manage your product catalog
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          + Add Product
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card variant="outlined" padding="lg">
              <h3 style={{ 
                fontSize: currentTheme.typography.fontSize.lg,
                fontWeight: currentTheme.typography.fontWeight.semibold,
                color: currentTheme.colors.text.primary,
                marginBottom: currentTheme.spacing[4]
              }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleSubmit} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: currentTheme.spacing[4]
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: currentTheme.spacing[4],
                }}>
                  <Input
                    type="text"
                    label="Product ID"
                    placeholder="e.g., COLA001"
                    value={formData.product_id}
                    onChange={(e) => handleInputChange('product_id', e.target.value)}
                    disabled={!!editingProduct}
                    required
                  />
                  
                  <Input
                    type="text"
                    label="Product Name"
                    placeholder="e.g., Coca Cola"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  
                  <Input
                    type="number"
                    label="Price"
                    placeholder="e.g., 25.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    step="0.01"
                    min="0.01"
                    required
                  />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[2] }}>
                    <label style={{
                      fontSize: currentTheme.typography.fontSize.sm,
                      fontWeight: currentTheme.typography.fontWeight.medium,
                      color: currentTheme.colors.text.primary,
                    }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      style={{
                        padding: currentTheme.spacing[3],
                        border: `1px solid ${currentTheme.colors.border}`,
                        borderRadius: currentTheme.borderRadius.md,
                        backgroundColor: currentTheme.colors.card,
                        color: currentTheme.colors.text.primary,
                        fontSize: currentTheme.typography.fontSize.base,
                      }}
                    >
                      {Object.entries(CATEGORY_NAMES).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  gap: currentTheme.spacing[3]
                }}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <Card variant="error" padding="md">
          <p style={{ color: currentTheme.colors.error[600] }}>
            {error}
          </p>
        </Card>
      )}

      {/* Products List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[4] }}>
        <h3 style={{ 
          fontSize: currentTheme.typography.fontSize.lg,
          fontWeight: currentTheme.typography.fontWeight.semibold,
          color: currentTheme.colors.text.primary,
        }}>
          Products ({products.length})
        </h3>

        {products.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center' }}>
            <p style={{ color: currentTheme.colors.text.secondary }}>
              No products found. Add your first product to get started.
            </p>
          </Card>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: currentTheme.spacing[4],
            }}
          >
            {products.map((product) => (
              <motion.div
                key={product.product_id}
                variants={staggerItem}
              >
                <Card
                  variant={product.active ? 'default' : 'outlined'}
                  hover
                  padding="md"
                  style={{
                    borderLeft: `4px solid ${product.active ? CATEGORY_COLORS[product.category] : currentTheme.colors.gray[300]}`,
                    opacity: product.active ? 1 : 0.6,
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: currentTheme.spacing[3]
                  }}>
                    {/* Product Header */}
                    <div>
                      <h4 style={{ 
                        fontSize: currentTheme.typography.fontSize.lg,
                        fontWeight: currentTheme.typography.fontWeight.semibold,
                        color: currentTheme.colors.text.primary,
                        marginBottom: currentTheme.spacing[1]
                      }}>
                        {product.name}
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: currentTheme.spacing[2],
                        marginBottom: currentTheme.spacing[2]
                      }}>
                        <span style={{
                          fontSize: currentTheme.typography.fontSize.xl,
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
                      <div style={{
                        fontSize: currentTheme.typography.fontSize.sm,
                        color: currentTheme.colors.text.secondary,
                      }}>
                        ID: {product.product_id}
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: currentTheme.spacing[2],
                      fontSize: currentTheme.typography.fontSize.sm,
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: product.active 
                          ? currentTheme.colors.success[500] 
                          : currentTheme.colors.gray[400],
                      }} />
                      <span style={{ 
                        color: product.active 
                          ? currentTheme.colors.success[600] 
                          : currentTheme.colors.text.secondary 
                      }}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ 
                      display: 'flex', 
                      gap: currentTheme.spacing[2],
                      marginTop: 'auto'
                    }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        style={{ flex: 1 }}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant={product.active ? 'warning' : 'success'}
                        size="sm"
                        onClick={() => handleToggleActive(product)}
                        style={{ flex: 1 }}
                      >
                        {product.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductManagement;
