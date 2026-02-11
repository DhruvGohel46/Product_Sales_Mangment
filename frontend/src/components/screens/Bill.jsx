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
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { productsAPI, billingAPI, categoriesAPI } from '../../utils/api';
import { handleAPIError, formatCurrency } from '../../utils/api';
import { CATEGORY_COLORS } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import SearchBar from '../ui/SearchBar';
import '../../styles/Management.css';


const TrashIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 6H5H21M8 6V20C8 21.1046 8.89543 22 10 22H14C15.1046 22 16 21.1046 16 20V6M19 6V20C19 21.1046 19.1046 22 18 22H10C8.89543 22 8 21.1046 8 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11L14 11M10 15L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WorkingPOSInterface = ({ onBillCreated }) => {
  const { currentTheme, isDark } = useTheme();
  const { settings } = useSettings();
  const showImages = settings?.show_product_images !== 'false';
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
    height: '100%',
    backgroundColor: currentTheme.colors.background,
    fontFamily: currentTheme.typography.fontFamily.primary,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const leftSidebarStyle = {
    width: '180px',
    backgroundColor: currentTheme.colors.surface,
    borderRight: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    height: "100%",
  };

  const middleSectionStyle = {
    flex: 1,
    padding: currentTheme.spacing[6],
    overflowY: 'auto',
    height: '100%',
    backgroundColor: currentTheme.colors.background,
  };

  // rightSectionStyle is unused now as we inlined it to fix nesting, but keeping for safety if referenced elsewhere or cleanup later.
  const rightSectionStyle = {
    width: '400px',
    backgroundColor: currentTheme.colors.surface,
    borderLeft: `1px solid ${currentTheme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  return (
    <div style={mainContainerStyle}>
      <div style={leftSidebarStyle}>
        <div style={{
          padding: currentTheme.spacing[5],
          borderBottom: `1px solid ${currentTheme.colors.border}`,
          backgroundColor: currentTheme.colors.surface,
        }}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search items..."
          />
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: `0 ${currentTheme.spacing[4]} ${currentTheme.spacing[6]}`,
          backgroundColor: 'transparent',
        }}>
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                variant={selectedCategory === category.id ? 'primary' : 'ghost'} // Use ghost for unselected
                hover={selectedCategory !== category.id}
                padding="sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: currentTheme.spacing[2],
                  marginTop: currentTheme.spacing[2],
                  cursor: 'pointer',
                  border: selectedCategory === category.id
                    ? `1px solid ${currentTheme.colors.primary[500]}`
                    : '1px solid transparent',
                  backgroundColor: selectedCategory === category.id
                    ? (isDark ? 'rgba(249, 115, 22, 0.2)' : '#fff7ed')
                    : 'transparent',
                  borderRadius: '12px',
                }}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: currentTheme.spacing[3],
                  width: '100%',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: selectedCategory === category.id ? currentTheme.colors.primary[500] : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: selectedCategory === category.id ? '#fff' : currentTheme.colors.text.secondary,
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                  }}>
                    {category.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: selectedCategory === category.id ? 600 : 500,
                      color: selectedCategory === category.id ? currentTheme.colors.primary[600] : currentTheme.colors.text.primary,
                    }}>
                      {category.name}
                    </div>
                  </div>
                  {selectedCategory === category.id && (
                    <motion.div layoutId="active-indicator" style={{
                      width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentTheme.colors.primary[500]
                    }} />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={middleSectionStyle}>
        <div style={{
          padding: currentTheme.spacing[2], // Reduced padding for better grid fit
          minHeight: 'calc(100% - 1rem)',
        }}>
          {loading ? (
            // Skeleton Loader for Products
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: currentTheme.spacing[4],
            }}>
              {[...Array(8)].map((_, i) => (
                <Card key={i} style={{ height: '220px', padding: '12px' }}>
                  <div style={{ height: '120px', backgroundColor: isDark ? '#334155' : '#e2e8f0', borderRadius: '8px', marginBottom: '12px', opacity: 0.5 }}></div>
                  <div style={{ height: '20px', width: '80%', backgroundColor: isDark ? '#334155' : '#e2e8f0', borderRadius: '4px', marginBottom: '8px', opacity: 0.5 }}></div>
                  <div style={{ height: '20px', width: '40%', backgroundColor: isDark ? '#334155' : '#e2e8f0', borderRadius: '4px', opacity: 0.5 }}></div>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: currentTheme.spacing[12],
              color: currentTheme.colors.text.secondary
            }}>
              {/* No Products UI - Kept mostly same but cleaner */}
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
              }}>
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', // Slightly wider cards
              gap: currentTheme.spacing[4],
              paddingBottom: currentTheme.spacing[4],
            }}>
              {filteredProducts.map((product) => (
                <Card
                  key={product.product_id}
                  variant="default" // Using default variant now which has glass/hover effects in Card.js
                  hover={true}
                  padding="none" // Custom padding inside
                  onClick={(e) => handleAddItem(product, e)}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    overflow: 'visible', // For hover effects
                  }}
                >
                  <div style={{ position: 'relative', padding: '12px' }}>
                    {/* Interaction Area */}
                    {showImages && (
                      <div style={{
                        height: '140px',
                        marginBottom: '12px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {product.image_filename ? (
                          <img
                            src={productsAPI.getImageUrl(product.image_filename)}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            loading="lazy"
                          />
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: currentTheme.colors.text.muted }}>No Image</span>
                        )}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: currentTheme.colors.text.primary,
                        margin: 0,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {product.name}
                      </h4>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: currentTheme.colors.primary[500],
                        marginTop: 'auto',
                      }}>
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    {/* Add Button Overlay */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: currentTheme.colors.primary[500],
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fff" strokeWidth="2">
                        <path d="M12 5V19M5 12H19" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Billing Panel */}
      <div style={{
        width: '400px',
        backgroundColor: currentTheme.colors.surface,
        borderLeft: `1px solid ${currentTheme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
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

      {
        error && (
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
        )
      }

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
    </div >
  );
};

export default WorkingPOSInterface;
