/**
 * =============================================================================
 * POINT OF SALE / BILLING INTERFACE - BILL.JSX
 * =============================================================================
 * 
 * ROLE: Main Point of Sale (POS) system for product billing and order management
 * 
 * RESPONSIBILITIES:
 * - Product catalog display with category filtering
 * - Shopping cart management and order processing
 * - Bill creation with multiple payment options
 * - Real-time order calculations and tax handling
 * - Product search and selection interface
 * - Print and save bill functionality
 * 
 * KEY FEATURES:
 * - Product grid with hover effects and category indicators
 * - Dynamic shopping cart with add/remove/update operations
 * - Multiple payment methods (Cash, Card, UPI)
 * - Real-time total calculations with tax
 * - Bill printing and saving capabilities
 * - Responsive design for tablets and desktops
 * 
 * COMPONENTS:
 * - ProductCard: Individual product display with hover effects
 * - ShoppingCart: Order management interface
 * - PaymentModal: Payment method selection
 * - BillPreview: Bill preview before printing
 * 
 * STATE MANAGEMENT:
 * - orderItems: Current shopping cart items
 * - selectedCategory: Active product category filter
 * - searchQuery: Product search functionality
 * - paymentMethod: Selected payment option
 * 
 * API INTEGRATION:
 * - productsAPI: Product catalog management
 * - billingAPI: Bill creation and management
 * - formatCurrency: Currency formatting utility
 * 
 * DESIGN PATTERNS:
 * - Functional component with multiple hooks
 * - Event-driven architecture for user interactions
 * - Theme-aware styling with hover states
 * - Framer Motion animations for interactions
 * - Responsive grid layout for products
 * 
 * USER WORKFLOW:
 * 1. Select products from catalog
 * 2. Add to shopping cart
 * 3. Review order and select payment method
 * 4. Create and save/print bill
 * 5. Auto-navigate back to products
 * =============================================================================
 */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { productsAPI, billingAPI, categoriesAPI } from '../../utils/api';
import { handleAPIError, formatCurrency } from '../../utils/api';
import { CATEGORY_COLORS } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import '../../styles/Management.css';


const TrashIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 6H5H21M8 6V20C8 21.1046 8.89543 22 10 22H14C15.1046 22 16 21.1046 16 20V6M19 6V20C19 21.1046 19.1046 22 18 22H10C8.89543 22 8 21.1046 8 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11L14 11M10 15L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WorkingPOSInterface = ({ onBillCreated }) => {
  const { currentTheme, isDark } = useTheme();
  const { showSuccess } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Items' }]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Edit Mode State
  const location = useLocation();
  const navigate = useNavigate();
  const [editingBill, setEditingBill] = useState(null);

  // Ref to prevent multiple rapid clicks
  const lastClickTime = useRef(0);

  useEffect(() => {
    loadProducts();
    loadCategories();

    // Check for edit mode
    if (location.state?.bill) {
      const bill = location.state.bill;
      setEditingBill(bill);
      setOrderItems(bill.items || []);
    }
  }, [location.state]);

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

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      const dynamicCategories = response.data.categories || [];
      setCategories([
        { id: 'all', name: 'All Items' },
        ...dynamicCategories.map(c => ({ id: c.id, name: c.name }))
      ]);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' ||
      product.category_id === selectedCategory ||
      product.category === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleAddItem = (product, event) => {
    // Prevent event bubbling
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const now = Date.now();

    // Prevent multiple clicks within 200ms
    if (now - lastClickTime.current < 200) {
      return;
    }

    lastClickTime.current = now;

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
        })),
        print: false,
        customer_name: editingBill ? editingBill.customer_name : ''
      };

      if (editingBill) {
        await billingAPI.updateBill(editingBill.bill_no, billData);
        showSuccess ? showSuccess('Bill updated successfully') : alert('Bill updated successfully');
        navigate('/analytics');
      } else {
        const response = await billingAPI.createBill(billData);
        setOrderItems([]);
        if (onBillCreated) {
          onBillCreated({
            bill_no: response.data.bill.bill_no,
            total: calculateTotal()
          });
        }
      }

    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  const handleSaveAndPrintOrder = async () => {
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
        })),
        print: true,
        customer_name: editingBill ? editingBill.customer_name : ''
      };

      if (editingBill) {
        await billingAPI.updateBill(editingBill.bill_no, billData);
        // Print logic for update if needed - assumed API handles it if 'print: true' or separate call
        // But backend update_bill doesn't seem to have print logic integrated yet in previous step.
        // Wait, update_bill method in backend didn't handle printing. 
        // So for "Update & Print", we might need to call print separately.

        await billingAPI.printBill(editingBill.bill_no); // Call print explicitly

        showSuccess ? showSuccess('Bill updated and printed') : alert('Bill updated and printed');
        navigate('/analytics');
      } else {
        const response = await billingAPI.createBill(billData);
        setOrderItems([]);
        if (onBillCreated) {
          onBillCreated({
            bill_no: response.data.bill.bill_no,
            total: calculateTotal()
          });
        }
      }

    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  const handleClearClick = () => {
    if (orderItems.length > 0) {
      setShowClearConfirm(true);
    }
  };

  const confirmClear = () => {
    setOrderItems([]);
    setShowClearConfirm(false);
  };

  const cancelClear = () => {
    setShowClearConfirm(false);
  };

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
                    ? (isDark ? '#444444ff' : '#E9E9E9')
                    : (isDark ? '#1A1A1A' : '#F1F1F1'),

                  boxShadow: isDark ? currentTheme.shadows.cardDark : currentTheme.shadows.card,
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: currentTheme.typography.fontSize.xs,
                      color: currentTheme.colors.text.secondary,
                      letterSpacing: currentTheme.typography.letterSpacing.normal,
                    }}>
                      {products.filter(p => category.id === 'all' || p.category_id === category.id || p.category === category.id).length} items
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
                gap: currentTheme.spacing[8],
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
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                  }}
                  whileTap={{ y: 0 }}
                  onHoverStart={() => {
                    // Add hover class or state
                    const element = document.getElementById(`product-${product.product_id}`);
                    if (element) {
                      element.style.border = '1px solid var(--primary-300)';
                    }
                  }}
                  onHoverEnd={() => {
                    // Remove hover class or state
                    const element = document.getElementById(`product-${product.product_id}`);
                    if (element) {
                      element.style.border = `1px solid ${currentTheme.colors.border}`;
                    }
                  }}
                  onClick={(e) => handleAddItem(product, e)}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    minHeight: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: `2px solid ${CATEGORY_COLORS[product.category] || '#3b82f6'}`,
                    backgroundColor: currentTheme.colors.Card,
                    borderRadius: '15px',
                    border: `1px solid ${currentTheme.colors.border}`,
                    padding: currentTheme.spacing.lg,
                    boxShadow: isDark ? currentTheme.shadows.cardDark : currentTheme.shadows.card,
                    id: `product-${product.product_id}`,
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '160px',
                    marginBottom: currentTheme.spacing[3],
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {product.image_filename ? (
                      <img
                        src={productsAPI.getImageUrl(product.image_filename)}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span style="font-size:0.75rem; color:var(--text-tertiary)">Image Error</span>';
                        }}
                      />
                    ) : (
                      <span style={{
                        fontSize: '0.75rem',
                        color: currentTheme.colors.text.secondary,
                        textAlign: 'center',
                        padding: '0 8px'
                      }}>
                        No image of product
                      </span>
                    )}
                  </div>

                  <h4 style={{
                    fontSize: currentTheme.typography.fontSize.base,
                    fontWeight: currentTheme.typography.fontWeight.semibold,
                    color: currentTheme.colors.text.primary,
                    marginBottom: currentTheme.spacing[1],
                    lineHeight: currentTheme.typography.lineHeight.tight,
                  }}>
                    {product.name}
                  </h4>
                  <div style={{
                    fontSize: currentTheme.typography.fontSize.lg,
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: CATEGORY_COLORS[product.category] || '#3b82f6',
                  }}>
                    {formatCurrency(product.price)}
                  </div>
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
          {/* Header for Right Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: currentTheme.spacing[4],
            paddingBottom: currentTheme.spacing[2],
            borderBottom: `1px solid ${currentTheme.colors.border}`,
          }}>
            <h3 style={{
              margin: 0,
              fontSize: currentTheme.typography.fontSize.lg,
              fontWeight: currentTheme.typography.fontWeight.semibold,
              color: currentTheme.colors.text.primary,
            }}>
              {editingBill ? `Editing Bill #${editingBill.bill_no}` : 'Current Bill'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearClick}
              disabled={orderItems.length === 0}
              style={{
                color: orderItems.length === 0 ? currentTheme.colors.text.disabled : (isDark ? '#ef4444' : '#dc2626'),
                opacity: orderItems.length === 0 ? 0.5 : 1,
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <TrashIcon color="currentColor" />
              <span style={{ fontSize: '0.8rem' }}>Clear All</span>
            </Button>
          </div>

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
              {editingBill ? 'Update Bill' : 'Save'}
            </Button>
            <Button variant="primary" onClick={handleSaveAndPrintOrder}>
              {editingBill ? 'Update & Print' : 'Save & Print'}
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

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="pmOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelClear}
          >
            <motion.div
              className="pmDialog"
              initial={{ y: 20, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pmDialogTitle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Clear Current Bill?
              </div>
              <div className="pmDialogBody">
                This will remove all items from the current order. This action cannot be undone.
              </div>
              <div className="pmDialogActions">
                <button className="pmDialogBtn" onClick={cancelClear}>
                  Cancel
                </button>
                <button className="pmDialogBtn pmDialogBtnPrimary" onClick={confirmClear}>
                  Yes, Clear Bill
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkingPOSInterface;
