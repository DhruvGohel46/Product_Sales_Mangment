import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import { productsAPI, billingAPI } from '../../utils/api';
import { handleAPIError, formatCurrency } from '../../utils/api';
import { CATEGORY_COLORS } from '../../utils/constants';
import { AnimatedButton, AnimatedCard } from '../ui';
import { EnhancedLoadingSpinner, SignatureEmptyState } from '../common';
import Input from '../ui/Input';

const EnhancedPOSInterface = () => {
  const { currentTheme } = useTheme();
  const { pageVariants, pageTransition, staggerContainer, staggerItem } = useAnimation();
  
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
  const [recentlyAdded, setRecentlyAdded] = useState(null);

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

    setRecentlyAdded(product.product_id);
    setTimeout(() => setRecentlyAdded(null), 1000);
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
    { id: 'all', name: 'All Items', icon: '📋' },
    { id: 'coldrink', name: 'Cold Drinks', icon: '🥤' },
    { id: 'paan', name: 'Paan', icon: '🍃' },
    { id: 'other', name: 'Others', icon: '📦' },
  ];

  const mainContainerStyle = {
    display: 'flex',
    height: '100vh',
    backgroundColor: currentTheme.colors.background,
    fontFamily: currentTheme.typography.fontFamily.primary,
    overflow: 'hidden',
  };

  const leftSidebarStyle = {
    width: '280px',
    background: `linear-gradient(180deg, ${currentTheme.colors.gray[50]} 0%, ${currentTheme.colors.gray[100]} 100%)`,
    borderRight: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: currentTheme.shadows.md,
  };

  const middleSectionStyle = {
    flex: 1,
    padding: currentTheme.spacing[6],
    overflowY: 'auto',
    background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.gray[50]} 100%)`,
  };

  const rightSectionStyle = {
    width: '380px',
    backgroundColor: currentTheme.colors.gray[50],
    borderLeft: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.05)',
  };

  return (
    <motion.div
      style={mainContainerStyle}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {/* Left Sidebar */}
      <motion.div style={leftSidebarStyle} initial={{ x: -300 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
        <motion.div 
          style={{ 
            padding: currentTheme.spacing[6],
            borderBottom: `1px solid ${currentTheme.colors.border}`,
            background: `linear-gradient(135deg, ${currentTheme.colors.primary[600]} 0%, ${currentTheme.colors.primary[700]} 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{ 
            color: currentTheme.colors.white,
            fontSize: currentTheme.typography.fontSize.xl,
            fontWeight: currentTheme.typography.fontWeight.bold,
            margin: 0,
            textAlign: 'center',
          }}>
            🍽️ POS System
          </h2>
        </motion.div>

        <div style={{ padding: currentTheme.spacing[4] }}>
          <Input
            type="text"
            placeholder="🔍 Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
          />
        </div>

        <motion.div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: `0 ${currentTheme.spacing[4]} ${currentTheme.spacing[4]}`,
          }}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={staggerItem}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatedCard
                variant={selectedCategory === category.id ? 'elevated' : 'default'}
                hover={selectedCategory !== category.id}
                padding="md"
                style={{
                  marginBottom: currentTheme.spacing[3],
                  cursor: 'pointer',
                  borderLeft: selectedCategory === category.id ? `4px solid ${currentTheme.colors.primary[600]}` : undefined,
                }}
                onClick={() => setSelectedCategory(category.id)}
                delay={index * 0.1}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: currentTheme.spacing[3],
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                  <div>
                    <div style={{
                      fontSize: currentTheme.typography.fontSize.base,
                      fontWeight: currentTheme.typography.fontWeight.semibold,
                      color: currentTheme.colors.text.primary,
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
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Middle Section */}
      <motion.div style={middleSectionStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        {loading ? (
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}>
            <EnhancedLoadingSpinner size="lg" text="Loading products..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <SignatureEmptyState
            icon="📦"
            title="No Products Found"
            subtitle="Try adjusting your search or category filter"
          />
        ) : (
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: currentTheme.spacing[4],
            }}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.product_id}
                variants={staggerItem}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: currentTheme.shadows.xl,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatedCard
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
                    position: 'relative',
                    border: `2px solid ${CATEGORY_COLORS[product.category]}`,
                    background: `linear-gradient(135deg, ${currentTheme.colors.card} 0%, ${CATEGORY_COLORS[product.category]}10 100%)`,
                  }}
                  onClick={() => handleAddItem(product)}
                  delay={index * 0.05}
                >
                  <AnimatePresence>
                    {recentlyAdded === product.product_id && (
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          backgroundColor: currentTheme.colors.success[500],
                          color: currentTheme.colors.white,
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <h4 style={{ 
                    fontSize: currentTheme.typography.fontSize.sm,
                    fontWeight: currentTheme.typography.fontWeight.semibold,
                    color: currentTheme.colors.text.primary,
                    marginBottom: currentTheme.spacing[2],
                    lineHeight: 1.3,
                  }}>
                    {product.name}
                  </h4>
                  <div style={{
                    fontSize: currentTheme.typography.fontSize.xl,
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: CATEGORY_COLORS[product.category],
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                    {formatCurrency(product.price)}
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Right Section */}
      <motion.div style={rightSectionStyle} initial={{ x: 300 }} animate={{ x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <motion.div 
          style={{ 
            padding: currentTheme.spacing[6],
            borderBottom: `1px solid ${currentTheme.colors.border}`,
            background: `linear-gradient(135deg, ${currentTheme.colors.card} 0%, ${currentTheme.colors.gray[50]} 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div style={{
            display: 'flex',
            marginBottom: currentTheme.spacing[4],
            gap: currentTheme.spacing[2],
          }}>
            {['dinein', 'delivery', 'pickup'].map((type) => (
              <AnimatedButton
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
              </AnimatedButton>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: currentTheme.spacing[3],
          }}>
            <span style={{ fontSize: '1.8rem' }}>🍽️</span>
            <Input
              type="number"
              placeholder="Table"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              size="sm"
              style={{ width: '100px' }}
            />
          </div>
        </motion.div>

        <div style={{ 
          flex: 1,
          padding: currentTheme.spacing[6],
          overflowY: 'auto',
        }}>
          {orderItems.length === 0 ? (
            <SignatureEmptyState
              icon="🛒"
              title="No Items Selected"
              subtitle="Please select items from the menu to start your order"
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                fontSize: currentTheme.typography.fontSize.sm,
                fontWeight: currentTheme.typography.fontWeight.semibold,
                color: currentTheme.colors.text.secondary,
                marginBottom: currentTheme.spacing[4],
                paddingBottom: currentTheme.spacing[3],
                borderBottom: `2px solid ${currentTheme.colors.border}`,
              }}>
                <div>ITEMS</div>
                <div style={{ textAlign: 'center' }}>QTY.</div>
                <div style={{ textAlign: 'right' }}>PRICE</div>
              </div>

              {orderItems.map((item, index) => (
                <motion.div
                  key={item.product_id}
                  variants={staggerItem}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    alignItems: 'center',
                    padding: `${currentTheme.spacing[3]} 0`,
                    borderBottom: `1px solid ${currentTheme.colors.gray[200]}`,
                  }}
                >
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
                      gap: currentTheme.spacing[2],
                    }}>
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        style={{ minWidth: '28px', padding: '0' }}
                      >
                        −
                      </AnimatedButton>
                      <span style={{ 
                        minWidth: '35px', 
                        textAlign: 'center',
                        fontSize: currentTheme.typography.fontSize.base,
                        fontWeight: currentTheme.typography.fontWeight.semibold,
                      }}>
                        {item.quantity}
                      </span>
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        style={{ minWidth: '28px', padding: '0' }}
                      >
                        +
                      </AnimatedButton>
                    </div>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'right',
                    fontSize: currentTheme.typography.fontSize.base,
                    fontWeight: currentTheme.typography.fontWeight.semibold,
                    color: currentTheme.colors.primary[600],
                  }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <motion.div 
          style={{ 
            borderTop: `1px solid ${currentTheme.colors.border}`,
            padding: currentTheme.spacing[6],
            background: `linear-gradient(135deg, ${currentTheme.colors.card} 0%, ${currentTheme.colors.gray[50]} 100%)`,
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{
            display: 'flex',
            gap: currentTheme.spacing[2],
            marginBottom: currentTheme.spacing[4],
          }}>
            {['cash', 'card', 'due'].map((method) => (
              <AnimatedButton
                key={method}
                variant={paymentMethod === method ? 'success' : 'ghost'}
                onClick={() => setPaymentMethod(method)}
                size="sm"
                style={{ flex: 1 }}
              >
                {method === 'cash' ? '💵 Cash' : method === 'card' ? '💳 Card' : '📝 Due'}
                {paymentMethod === method && ' ✓'}
              </AnimatedButton>
            ))}
            <AnimatedButton variant="ghost" size="sm">
              More ✓
            </AnimatedButton>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: currentTheme.typography.fontSize['2xl'],
            fontWeight: currentTheme.typography.fontWeight.bold,
            marginBottom: currentTheme.spacing[4],
            padding: currentTheme.spacing[3],
            backgroundColor: currentTheme.colors.primary[50],
            borderRadius: currentTheme.borderRadius.md,
            border: `2px solid ${currentTheme.colors.primary[200]}`,
          }}>
            <span style={{ color: currentTheme.colors.text.primary }}>TOTAL</span>
            <span style={{ color: currentTheme.colors.primary[600] }}>
              {formatCurrency(calculateTotal())}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: currentTheme.spacing[3],
            marginBottom: currentTheme.spacing[4],
          }}>
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label style={{ fontSize: currentTheme.typography.fontSize.base }}>
              ✅ Mark as Paid
            </label>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: currentTheme.spacing[3],
          }}>
            <AnimatedButton variant="secondary" onClick={() => handleSaveOrder(false)}>
              💾 Save
            </AnimatedButton>
            <AnimatedButton variant="primary" onClick={() => handleSaveOrder(true)}>
              🖨️ Save & Print
            </AnimatedButton>
            <AnimatedButton variant="ghost">
              📧 Save & EBill
            </AnimatedButton>
            <AnimatedButton variant="ghost">
              📝 KOT
            </AnimatedButton>
            <AnimatedButton variant="ghost">
              🖨️ KOT & Print
            </AnimatedButton>
            <AnimatedButton variant="warning">
              ⏸️ Hold
            </AnimatedButton>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: currentTheme.spacing[6],
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}
          >
            <AnimatedCard variant="error" padding="md">
              <p style={{ color: currentTheme.colors.error[600], margin: 0 }}>
                ⚠️ {error}
              </p>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedPOSInterface;
