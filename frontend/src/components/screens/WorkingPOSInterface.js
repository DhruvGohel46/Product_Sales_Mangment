import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { productsAPI, billingAPI } from '../../utils/api';
import { handleAPIError, formatCurrency } from '../../utils/api';
import { CATEGORY_COLORS } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

const WorkingPOSInterface = () => {
  const { currentTheme, isDark } = useTheme();
  
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleAddItem = (product) => {
    setOrderItems(prev => {
      const existingIndex = prev.findIndex(item => item.product_id === product.product_id);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setOrderItems(prev => prev.filter(item => item.product_id !== productId));
    } else {
      setOrderItems(prev => 
        prev.map(item => 
          item.product_id === productId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      setError('Please add items to the order');
      return;
    }

    try {
      setError('');
      
      const billData = {
        products: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const response = await billingAPI.createBill(billData);
      
      setOrderItems([]);
      
      alert(`Order saved successfully! Bill #${response.data.bill.bill_no}`);
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'coldrink', name: 'Cold Drinks' },
    { id: 'paan', name: 'Paan' },
  ];

  const mainContainerStyle = {
    display: 'flex',
    height: '82vh',
    backgroundColor: currentTheme.colors.background,
    fontFamily: currentTheme.typography.fontFamily.primary,
    overflow: 'hidden',
  };

  const leftSidebarStyle = {
    width: '180px',
    backgroundColor: currentTheme.colors.surface,
    borderRight: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    height: "82vh",
  };

  const middleSectionStyle = {
    flex: 1,
    padding: currentTheme.spacing[6],
    overflowY: 'auto',
    height: '82vh',
    backgroundColor: currentTheme.colors.background,
  };

  const rightSectionStyle = {
    width: '400px',
    backgroundColor: currentTheme.colors.surface,
    borderLeft: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    height: '82vh',
  };

  return (
    <div style={mainContainerStyle}>
      <div style={leftSidebarStyle}>
        <div style={{ 
          padding: currentTheme.spacing[5],
          borderBottom: `1px solid ${currentTheme.colors.border}`,
        }}>
          <Input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="md"
          />
        </div>

        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: `0 ${currentTheme.spacing[6]} ${currentTheme.spacing[6]}`,
        }}>
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ opacity: 0.92 }}
              whileTap={{ opacity: 0.86 }}
            >
              <Card
                variant={selectedCategory === category.id ? 'elevated' : 'default'}
                hover={selectedCategory !== category.id}
                padding="md"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: currentTheme.spacing[2],
                  padding: "10px",
                  borderRadius: '15px',
                  marginBottom: currentTheme.spacing[5],
                  cursor: 'pointer',
                  border: selectedCategory === category.id
                    ? `1px solid ${currentTheme.colors.primary[200]}`
                    : `1px solid ${currentTheme.colors.border}`,
                  backgroundColor: selectedCategory === category.id 
                    ? (isDark ? '#4A4A4A' : '#E9E9E9')
                    : (isDark ? '#1A1A1A' : '#F1F1F1'),
                    
                  
                  transition: 'all 0.2s cubic-bezier(0, 0, 0.2, 1)',
                }}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: currentTheme.spacing[3],
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: currentTheme.typography.fontSize.base,
                      fontWeight: currentTheme.typography.fontWeight.semibold,
                      color: currentTheme.colors.text.primary,
                      marginBottom: currentTheme.spacing[1],
                    }}>
                      {category.name}
                    </div>
                    <div style={{
                      fontSize: currentTheme.typography.fontSize.xs,
                      color: currentTheme.colors.text.secondary,
                      letterSpacing: currentTheme.typography.letterSpacing.normal,
                    }}>
                      {products.filter(p => category.id === 'all' || p.category === category.id).length} items
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={middleSectionStyle}>
        <div style={{
          backgroundColor: currentTheme.colors.surface,
          borderRadius: currentTheme.borderRadius.xl,
          border: `1px solid ${currentTheme.colors.border}`,
          boxShadow: currentTheme.shadows.sm,
          padding: currentTheme.spacing[5],
          minHeight: 'calc(100% - 3rem)',
        }}>
          {loading ? (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            gap: currentTheme.spacing[4],
          }}>
            <motion.div
              style={{
                width: '48px',
                height: '48px',
                border: `3px solid ${currentTheme.colors.border}`,
                borderTop: `3px solid ${currentTheme.colors.primary[600]}`,
                borderRadius: '50%',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                ease: 'linear',
                repeat: Infinity,
              }}
            />
            <div style={{
              fontSize: currentTheme.typography.fontSize.lg,
              color: currentTheme.colors.text.secondary,
              fontWeight: currentTheme.typography.fontWeight.medium,
            }}>
              Loading products...
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            padding: currentTheme.spacing[12],
            color: currentTheme.colors.text.secondary
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: currentTheme.borderRadius.full,
              border: `1px solid ${currentTheme.colors.border}`,
              backgroundColor: currentTheme.colors.surface,
              margin: `0 auto ${currentTheme.spacing[6]}`,
            }} />
            <div style={{
              fontSize: currentTheme.typography.fontSize['2xl'],
              fontWeight: currentTheme.typography.fontWeight.semibold,
              color: currentTheme.colors.text.primary,
              marginBottom: currentTheme.spacing[2],
            }}>
              No Products Found
            </div>
            <p style={{
              fontSize: currentTheme.typography.fontSize.base,
              color: currentTheme.colors.text.secondary,
              maxWidth: '300px',
              margin: '0 auto',
            }}>
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: currentTheme.spacing[4],
            }}
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.product_id}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                }}
                whileHover={{ 
                  y: -1,
                  transition: { duration: 0.14, ease: [0, 0, 0.2, 1] }
                }}
                whileTap={{ y: 0 }}
              >
                <Card
                  variant="elevated"
                  hover
                  padding="lg"
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderTop: `2px solid ${CATEGORY_COLORS[product.category]}`,
                    backgroundColor: currentTheme.colors.border,
                    borderRadius: '15px',
                    border: `1px solid ${currentTheme.colors.border}`,
                  }}
                  onClick={() => handleAddItem(product)}
                >
                  <h4 style={{ 
                    fontSize: currentTheme.typography.fontSize['2xl'],
                    fontWeight: currentTheme.typography.fontWeight.semibold,
                    color: currentTheme.colors.text.primary,
                    marginBottom: currentTheme.spacing[2],
                    lineHeight: currentTheme.typography.lineHeight.tight,
                  }}>
                    {product.name}
                  </h4>
                  <div style={{
                    fontSize: currentTheme.typography.fontSize['xl'],
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: CATEGORY_COLORS[product.category],
                  }}>
                    {formatCurrency(product.price)}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        </div>
      </div>

      <div style={rightSectionStyle}>
        <div style={{ 
          flex: 1,
          padding: currentTheme.spacing[4],
          overflowY: 'auto',
          borderBottom: `1px solid ${currentTheme.colors.border}`,
        }}>
          {orderItems.length === 0 ? (
            <div style={{ 
              textAlign: 'center',
              padding: currentTheme.spacing[8],
              color: currentTheme.colors.text.secondary
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: currentTheme.borderRadius.full,
                border: `1px solid ${currentTheme.colors.border}`,
                backgroundColor: currentTheme.colors.surface,
                margin: `0 auto ${currentTheme.spacing[4]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  style={{ color: currentTheme.colors.text.muted }}
                >
                  <path
                    d="M6.5 6.5h14l-1.5 8.5H8.2L6.5 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 6.5 6 4H3.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div style={{
                fontSize: currentTheme.typography.fontSize.lg,
                fontWeight: currentTheme.typography.fontWeight.semibold,
                color: currentTheme.colors.text.primary,
                marginBottom: currentTheme.spacing[2],
              }}>
                No items in the order
              </div>
              <div style={{
                fontSize: currentTheme.typography.fontSize.sm,
                color: currentTheme.colors.text.secondary,
                maxWidth: '260px',
                margin: '0 auto',
              }}>
                Select products to start billing.
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                fontSize: currentTheme.typography.fontSize.xs,
                fontWeight: currentTheme.typography.fontWeight.semibold,
                color: currentTheme.colors.text.secondary,
                marginBottom: currentTheme.spacing[3],
                paddingBottom: currentTheme.spacing[2],
                borderBottom: `1px solid ${currentTheme.colors.border}`,
                letterSpacing: currentTheme.typography.letterSpacing.wide,
              }}>
                <div>ITEMS</div>
                <div style={{ textAlign: 'center' }}>QTY.</div>
                <div style={{ textAlign: 'right' }}>PRICE</div>
              </div>

              {orderItems.map((item) => (
                <div key={item.product_id} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  alignItems: 'center',
                  padding: `${currentTheme.spacing[2]} 0`,
                  borderBottom: `1px solid ${currentTheme.colors.border}`,
                }}>
                  <div>
                    <div style={{ 
                      fontSize: currentTheme.typography.fontSize.sm,
                      fontWeight: currentTheme.typography.fontWeight.medium,
                      color: currentTheme.colors.text.primary,
                    }}>
                      {item.name}
                    </div>
                    <div style={{ 
                      fontSize: currentTheme.typography.fontSize.xs,
                      color: currentTheme.colors.text.secondary,
                    }}>
                      {formatCurrency(item.price)} each
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: currentTheme.spacing[1],
                    }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        style={{ minWidth: '28px', padding: '0' }}
                      >
                        −
                      </Button>
                      <span style={{ minWidth: '30px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        style={{ minWidth: '28px', padding: '0' }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ 
          borderTop: `1px solid ${currentTheme.colors.border}`,
          padding: currentTheme.spacing[4],
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: currentTheme.typography.fontSize.lg,
            fontWeight: currentTheme.typography.fontWeight.semibold,
            marginBottom: currentTheme.spacing[3],
            padding: `${currentTheme.spacing[3]} ${currentTheme.spacing[3]}`,
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.lg,
            border: `1px solid ${currentTheme.colors.border}`,
          }}>
            <span style={{
              fontSize: currentTheme.typography.fontSize.sm,
              color: currentTheme.colors.text.secondary,
              letterSpacing: currentTheme.typography.letterSpacing.wide,
              textTransform: 'uppercase',
            }}>Total</span>
            <span style={{ color: currentTheme.colors.primary[600] }}>
              {formatCurrency(calculateTotal())}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: currentTheme.spacing[2],
          }}>
            <Button variant="secondary" onClick={handleSaveOrder}>
              Save
            </Button>
            <Button variant="primary" onClick={() => handleSaveOrder()}>
              Save & Print
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          position: 'fixed',
          bottom: currentTheme.spacing[4],
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}>
          <Card variant="error" padding="md">
            <div style={{
              fontSize: currentTheme.typography.fontSize.sm,
              color: currentTheme.colors.error[600],
              fontWeight: currentTheme.typography.fontWeight.medium,
            }}>{error}</div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkingPOSInterface;
