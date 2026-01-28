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
  const { currentTheme } = useTheme();
  
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderType, setOrderType] = useState('dinein');
  const [tableNumber, setTableNumber] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isPaid, setIsPaid] = useState(false);

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
      setIsPaid(false);
      
      alert(`Order saved successfully! Bill #${response.data.bill.bill_no}`);
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  const categories = [
    { id: 'all', name: 'All Items', icon: '📋' },
    { id: 'coldrink', name: 'Cold Drinks', icon: '🥤' },
    { id: 'paan', name: 'Paan', icon: '🍃' },
    { id: 'other', name: 'Others', icon: '📦' },
  ];

  const mainContainerStyle = {
    display: 'flex',
    height: 'calc(100vh - 80px)',
    backgroundColor: currentTheme.colors.background,
    fontFamily: currentTheme.typography.fontFamily.primary,
    overflow: 'hidden',
  };

  const leftSidebarStyle = {
    width: '300px',
    backgroundColor: currentTheme.colors.surface,
    borderRight: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
  };

  const middleSectionStyle = {
    flex: 1,
    padding: currentTheme.spacing[6],
    overflowY: 'auto',
  };

  const rightSectionStyle = {
    width: '400px',
    backgroundColor: currentTheme.colors.surface,
    borderLeft: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={mainContainerStyle}>
      <div style={leftSidebarStyle}>
        <div style={{ 
          padding: currentTheme.spacing[5],
          borderBottom: `1px solid ${currentTheme.colors.border}`,
          backgroundColor: currentTheme.colors.primary[600],
        }}>
          <h2 style={{ 
            color: currentTheme.colors.white,
            fontSize: currentTheme.typography.fontSize['2xl'],
            fontWeight: currentTheme.typography.fontWeight.semibold,
            margin: 0,
            textAlign: 'center',
            letterSpacing: currentTheme.typography.letterSpacing.tight,
          }}>
            POS System
          </h2>
          <p style={{
            color: `${currentTheme.colors.white}CC`,
            fontSize: currentTheme.typography.fontSize.sm,
            fontWeight: currentTheme.typography.fontWeight.normal,
            margin: `${currentTheme.spacing[1]} 0 0 0`,
            textAlign: 'center',
          }}>
            Fast Food Shop Management
          </p>
        </div>

        <div style={{ padding: currentTheme.spacing[5] }}>
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
          padding: `0 ${currentTheme.spacing[5]} ${currentTheme.spacing[5]}`,
        }}>
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                variant={selectedCategory === category.id ? 'elevated' : 'default'}
                hover={selectedCategory !== category.id}
                padding="md"
                style={{
                  marginBottom: currentTheme.spacing[3],
                  cursor: 'pointer',
                  borderLeft: selectedCategory === category.id ? `3px solid ${currentTheme.colors.primary[600]}` : undefined,
                }}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: currentTheme.spacing[3],
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: currentTheme.borderRadius.md,
                    backgroundColor: selectedCategory === category.id 
                      ? currentTheme.colors.primary[100] 
                      : currentTheme.colors.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}>
                    {category.icon}
                  </div>
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
                      fontSize: currentTheme.typography.fontSize.sm,
                      color: currentTheme.colors.text.secondary,
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
                border: '3px solid currentTheme.colors.border',
                borderTop: '3px solid currentTheme.colors.primary[600]',
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
              fontSize: '4rem', 
              marginBottom: currentTheme.spacing[6],
              opacity: 0.3,
            }}>📦</div>
            <h3 style={{
              fontSize: currentTheme.typography.fontSize['2xl'],
              fontWeight: currentTheme.typography.fontWeight.semibold,
              color: currentTheme.colors.text.primary,
              marginBottom: currentTheme.spacing[2],
            }}>
              No Products Found
            </h3>
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
                  scale: 1.02,
                  transition: { duration: 0.15 }
                }}
                whileTap={{ scale: 0.98 }}
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
                    borderTop: `3px solid ${CATEGORY_COLORS[product.category]}`,
                  }}
                  onClick={() => handleAddItem(product)}
                >
                  <h4 style={{ 
                    fontSize: currentTheme.typography.fontSize.sm,
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

      <div style={rightSectionStyle}>
        <div style={{ 
          padding: currentTheme.spacing[4],
          borderBottom: `1px solid ${currentTheme.colors.border}`,
        }}>
          <div style={{
            display: 'flex',
            marginBottom: currentTheme.spacing[3],
            gap: currentTheme.spacing[1],
          }}>
            {['dinein', 'delivery', 'pickup'].map((type) => (
              <Button
                key={type}
                variant={orderType === type ? 'primary' : 'ghost'}
                onClick={() => setOrderType(type)}
                size="sm"
                style={{
                  flex: 1,
                  backgroundColor: orderType === type ? currentTheme.colors.warning[500] : undefined,
                }}
              >
                {type === 'dinein' ? '🍽️ Dine In' : type === 'delivery' ? '🚚 Delivery' : '🛍️ Pickup'}
              </Button>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: currentTheme.spacing[2],
          }}>
            <span style={{ fontSize: '1.5rem' }}>🍽️</span>
            <Input
              type="number"
              placeholder="Table"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              size="sm"
              style={{ width: '80px' }}
            />
          </div>
        </div>

        <div style={{ 
          flex: 1,
          padding: currentTheme.spacing[4],
          overflowY: 'auto',
        }}>
          {orderItems.length === 0 ? (
            <div style={{ 
              textAlign: 'center',
              padding: currentTheme.spacing[8],
              color: currentTheme.colors.text.secondary
            }}>
              <div style={{ fontSize: '3rem', marginBottom: currentTheme.spacing[4] }}>🛒</div>
              <h3>No Items Selected</h3>
              <p>Please select items from the menu to start your order</p>
            </div>
          ) : (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                fontSize: currentTheme.typography.fontSize.sm,
                fontWeight: currentTheme.typography.fontWeight.semibold,
                color: currentTheme.colors.text.secondary,
                marginBottom: currentTheme.spacing[3],
                paddingBottom: currentTheme.spacing[2],
                borderBottom: `1px solid ${currentTheme.colors.border}`,
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
                  borderBottom: `1px solid ${currentTheme.colors.gray[200]}`,
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
                        style={{ minWidth: '24px', padding: '0' }}
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
                        style={{ minWidth: '24px', padding: '0' }}
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
            gap: currentTheme.spacing[1],
            marginBottom: currentTheme.spacing[3],
          }}>
            {['cash', 'card', 'due'].map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? 'success' : 'ghost'}
                onClick={() => setPaymentMethod(method)}
                size="sm"
                style={{ flex: 1 }}
              >
                {method === 'cash' ? '💵 Cash' : method === 'card' ? '💳 Card' : '📝 Due'}
                {paymentMethod === method && ' ✓'}
              </Button>
            ))}
            <Button variant="ghost" size="sm">
              More ✓
            </Button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: currentTheme.typography.fontSize.xl,
            fontWeight: currentTheme.typography.fontWeight.bold,
            marginBottom: currentTheme.spacing[3],
            padding: currentTheme.spacing[2],
            backgroundColor: currentTheme.colors.primary[50],
            borderRadius: currentTheme.borderRadius.md,
            border: `1px solid ${currentTheme.colors.primary[200]}`,
          }}>
            <span>TOTAL</span>
            <span style={{ color: currentTheme.colors.primary[600] }}>
              {formatCurrency(calculateTotal())}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: currentTheme.spacing[2],
            marginBottom: currentTheme.spacing[3],
          }}>
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label style={{ fontSize: currentTheme.typography.fontSize.sm }}>
              ✅ Mark as Paid
            </label>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: currentTheme.spacing[2],
          }}>
            <Button variant="secondary" onClick={handleSaveOrder}>
              💾 Save
            </Button>
            <Button variant="primary" onClick={() => handleSaveOrder()}>
              🖨️ Save & Print
            </Button>
            <Button variant="ghost">
              📧 Save & EBill
            </Button>
            <Button variant="ghost">
              📝 KOT
            </Button>
            <Button variant="ghost">
              🖨️ KOT & Print
            </Button>
            <Button variant="warning">
              ⏸️ Hold
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
            <p style={{ color: currentTheme.colors.error[600], margin: 0 }}>
              ⚠️ {error}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkingPOSInterface;
