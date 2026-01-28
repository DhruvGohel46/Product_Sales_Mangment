import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import { billingAPI } from '../../utils/api';
import { formatCurrency, handleAPIError } from '../../utils/api';
import { CATEGORY_COLORS } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';

const BillCreation = ({ onBillCreated, onBack }) => {
  const { currentTheme } = useTheme();
  const { cardVariants, successVariants, bounceVariants } = useAnimation();
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [billNumber, setBillNumber] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load next bill number on mount
  useEffect(() => {
    loadNextBillNumber();
  }, []);

  const loadNextBillNumber = async () => {
    try {
      const response = await billingAPI.getNextBillNumber();
      setBillNumber(response.data.next_bill_number);
    } catch (err) {
      console.error('Error getting next bill number:', err);
    }
  };

  // Add product to bill
  const handleProductSelect = (product) => {
    setSelectedProducts(prev => {
      const existingIndex = prev.findIndex(p => p.product_id === product.product_id);
      
      if (existingIndex >= 0) {
        // Update quantity if product exists
        const updated = [...prev];
        updated[existingIndex].quantity += product.quantity;
        return updated;
      } else {
        // Add new product
        return [...prev, product];
      }
    });
  };

  // Update product quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      // Remove product if quantity is 0
      setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
    } else {
      // Update quantity
      setSelectedProducts(prev => 
        prev.map(p => 
          p.product_id === productId 
            ? { ...p, quantity }
            : p
        )
      );
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, product) => 
      sum + (product.price * product.quantity), 0
    );
    
    return {
      subtotal,
      itemCount: selectedProducts.reduce((sum, product) => sum + product.quantity, 0),
      total: subtotal // No tax for now
    };
  };

  // Create bill
  const handleCreateBill = async () => {
    if (selectedProducts.length === 0) {
      setError('Please add at least one product');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const billData = {
        products: selectedProducts.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity
        }))
      };

      const response = await billingAPI.createBill(billData);
      
      // Show success animation
      setShowSuccess(true);
      
      // Reset form after delay
      setTimeout(() => {
        setSelectedProducts([]);
        setShowSuccess(false);
        loadNextBillNumber();
        onBillCreated(response.data.bill);
      }, 2000);

    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear bill
  const handleClearBill = () => {
    setSelectedProducts([]);
    setError('');
  };

  const totals = calculateTotals();

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
            Create Bill
          </h2>
          <p style={{ color: currentTheme.colors.text.secondary }}>
            Bill No: {billNumber || 'Loading...'}
          </p>
        </div>
        
        <Button variant="ghost" onClick={onBack}>
          ← Back to Products
        </Button>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            variants={successVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <Card variant="success" padding="xl" style={{ textAlign: 'center' }}>
              <motion.div
                variants={bounceVariants}
                animate="animate"
                style={{
                  fontSize: '3rem',
                  marginBottom: currentTheme.spacing[4],
                }}
              >
                ✓
              </motion.div>
              <h3 style={{ 
                fontSize: currentTheme.typography.fontSize.xl,
                color: currentTheme.colors.success[600],
                marginBottom: currentTheme.spacing[2]
              }}>
                Bill Created Successfully!
              </h3>
              <p style={{ color: currentTheme.colors.success[500] }}>
                Bill #{billNumber} • {formatCurrency(totals.total)}
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Items */}
      <Card variant="elevated" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[4] }}>
          <h3 style={{ 
            fontSize: currentTheme.typography.fontSize.lg,
            fontWeight: currentTheme.typography.fontWeight.semibold,
            color: currentTheme.colors.text.primary,
          }}>
            Bill Items ({selectedProducts.length})
          </h3>

          {selectedProducts.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: currentTheme.spacing[8],
              color: currentTheme.colors.text.secondary
            }}>
              <p>No items added to bill</p>
              <p style={{ fontSize: currentTheme.typography.fontSize.sm }}>
                Add products from the selection screen
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[3] }}>
              <AnimatePresence mode="popLayout">
                {selectedProducts.map((product) => {
                  const lineTotal = product.price * product.quantity;
                  
                  return (
                    <motion.div
                      key={product.product_id}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: currentTheme.spacing[4],
                        padding: currentTheme.spacing[4],
                        backgroundColor: currentTheme.colors.gray[50],
                        borderRadius: currentTheme.borderRadius.md,
                        borderLeft: `3px solid ${CATEGORY_COLORS[product.category]}`,
                      }}
                    >
                      {/* Product Info */}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          fontSize: currentTheme.typography.fontSize.base,
                          fontWeight: currentTheme.typography.fontWeight.medium,
                          color: currentTheme.colors.text.primary,
                          marginBottom: currentTheme.spacing[1]
                        }}>
                          {product.name}
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          gap: currentTheme.spacing[4],
                          fontSize: currentTheme.typography.fontSize.sm,
                          color: currentTheme.colors.text.secondary
                        }}>
                          <span>{formatCurrency(product.price)} each</span>
                          <span>•</span>
                          <span>{product.quantity} × {formatCurrency(product.price)}</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: currentTheme.spacing[2]
                      }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(product.product_id, product.quantity - 1)}
                          disabled={product.quantity <= 1}
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
                          {product.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(product.product_id, product.quantity + 1)}
                          style={{ minWidth: '32px', padding: '0' }}
                        >
                          +
                        </Button>
                      </div>

                      {/* Line Total */}
                      <div style={{ 
                        textAlign: 'right',
                        minWidth: '100px'
                      }}>
                        <div style={{
                          fontSize: currentTheme.typography.fontSize.lg,
                          fontWeight: currentTheme.typography.fontWeight.semibold,
                          color: currentTheme.colors.text.primary,
                        }}>
                          {formatCurrency(lineTotal)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(product.product_id, 0)}
                          style={{ 
                            fontSize: currentTheme.typography.fontSize.xs,
                            color: currentTheme.colors.error[500],
                            padding: '2px 8px'
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Card>

      {/* Totals */}
      {selectedProducts.length > 0 && (
        <Card variant="outlined" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[3] }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: currentTheme.colors.text.secondary }}>
                Items ({totals.itemCount})
              </span>
              <span style={{ 
                fontSize: currentTheme.typography.fontSize.lg,
                fontWeight: currentTheme.typography.fontWeight.medium
              }}>
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            
            <div style={{ 
              height: '1px', 
              backgroundColor: currentTheme.colors.border,
              margin: `${currentTheme.spacing[2]} 0`
            }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ 
                fontSize: currentTheme.typography.fontSize.xl,
                fontWeight: currentTheme.typography.fontWeight.semibold,
                color: currentTheme.colors.text.primary
              }}>
                TOTAL
              </span>
              <span style={{ 
                fontSize: currentTheme.typography.fontSize['2xl'],
                fontWeight: currentTheme.typography.fontWeight.bold,
                color: currentTheme.colors.primary[600]
              }}>
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card variant="error" padding="md">
          <p style={{ color: currentTheme.colors.error[600] }}>
            {error}
          </p>
        </Card>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: currentTheme.spacing[4],
        justifyContent: 'flex-end'
      }}>
        <Button
          variant="secondary"
          onClick={handleClearBill}
          disabled={selectedProducts.length === 0 || loading}
        >
          Clear Bill
        </Button>
        
        <Button
          variant="primary"
          onClick={handleCreateBill}
          disabled={selectedProducts.length === 0 || loading}
          loading={loading}
          size="lg"
          style={{ minWidth: '200px' }}
        >
          {loading ? 'Creating...' : `Create Bill ${formatCurrency(totals.total)}`}
        </Button>
      </div>
    </div>
  );
};

export default BillCreation;
