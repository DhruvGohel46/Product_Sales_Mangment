import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { productsAPI, billingAPI } from '../../utils/api';
import { handleAPIError, formatCurrency } from '../../utils/api';
import { CATEGORY_COLORS } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

const POSInterface = () => {
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

  const handleSaveOrder = async (print = false) => {
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
    { id: 'all', name: 'All Items' },
    { id: 'coldrink', name: 'Cold Drinks' },
    { id: 'paan', name: 'Paan' },
    { id: 'other', name: 'Others' },
  ];

  const mainContainerStyle = {
    display: 'flex',
    height: '100vh',
    backgroundColor: currentTheme.colors.background,
    fontFamily: currentTheme.typography.fontFamily.primary,
  };

  const leftSidebarStyle = {
    width: '250px',
    backgroundColor: currentTheme.colors.gray[100],
    borderRight: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
  };

  const middleSectionStyle = {
    flex: 1,
    padding: currentTheme.spacing[4],
    overflowY: 'auto',
  };

  const rightSectionStyle = {
    width: '350px',
    backgroundColor: currentTheme.colors.gray[50],
    borderLeft: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={mainContainerStyle}>
      {/* Left Sidebar - Categories */}
      <div style={leftSidebarStyle}>
        <div style={{ padding: currentTheme.spacing[4] }}>
          <Input
            type="text"
            placeholder="Q Search item"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
          />
        </div>

        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: `0 ${currentTheme.spacing[4]} ${currentTheme.spacing[4]}`,
        }}>
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={selectedCategory === category.id ? 'primary' : 'ghost'}
                onClick={() => setSelectedCategory(category.id)}
                fullWidth
                style={{
                  justifyContent: 'flex-start',
                  marginBottom: currentTheme.spacing[2],
                }}
              >
                {category.name}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Middle Section - Products */}
      <div style={middleSectionStyle}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: currentTheme.spacing[3],
        }}>
          {loading ? (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: currentTheme.spacing[8]
            }}>
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: currentTheme.spacing[8],
              color: currentTheme.colors.text.secondary
            }}>
              No products found
            </div>
          ) : (
            filteredProducts.map((product) => (
              <motion.div
                key={product.product_id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  variant="default"
                  hover
                  padding="md"
                  style={{
                    border: `2px solid ${CATEGORY_COLORS[product.category]}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                  onClick={() => handleAddItem(product)}
                >
                  <h4 style={{ 
                    fontSize: currentTheme.typography.fontSize.sm,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                    color: currentTheme.colors.text.primary,
                    marginBottom: currentTheme.spacing[2]
                  }}>
                    {product.name}
                  </h4>
                  <div style={{
                    fontSize: currentTheme.typography.fontSize.lg,
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: currentTheme.colors.success[600],
                  }}>
                    {formatCurrency(product.price)}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Section - Order Details */}
      <div style={rightSectionStyle}>
        {/* Order Type */}
        <div style={{ 
          padding: currentTheme.spacing[4],
          borderBottom: `1px solid ${currentTheme.colors.border}`,
        }}>
          <div style={{
            display: 'flex',
            marginBottom: currentTheme.spacing[3],
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
                {type === 'dinein' ? 'Dine In' : type.charAt(0).toUpperCase() + type.slice(1)}
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

        {/* Order Items */}
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
              <div style={{ fontSize: '3rem', marginBottom: currentTheme.spacing[4] }}>🍽️</div>
              <p>No Item Selected.</p>
              <p>Please Select Item from Left Menu Item.</p>
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
                        -
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

        {/* Payment Section */}
        <div style={{ 
          borderTop: `1px solid ${currentTheme.colors.border}`,
          padding: currentTheme.spacing[4],
        }}>
          <div style={{
            display: 'flex',
            gap: currentTheme.spacing[2],
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
                {method.charAt(0).toUpperCase() + method.slice(1)}
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
          }}>
            <span>Total</span>
            <span>{formatCurrency(calculateTotal())}</span>
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
            <label>It's Paid</label>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: currentTheme.spacing[2],
          }}>
            <Button variant="secondary" onClick={() => handleSaveOrder(false)}>
              Save
            </Button>
            <Button variant="primary" onClick={() => handleSaveOrder(true)}>
              Save & Print
            </Button>
            <Button variant="ghost">
              Save & EBill
            </Button>
            <Button variant="ghost">
              KOT
            </Button>
            <Button variant="ghost">
              KOT & Print
            </Button>
            <Button variant="warning">
              Hold
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
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
              {error}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default POSInterface;
