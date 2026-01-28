import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../hooks/useAnimation';
import { productsAPI } from '../../utils/api';
import { handleAPIError, formatCurrency } from '../../utils/api';
import { PRODUCT_CATEGORIES, CATEGORY_NAMES } from '../../utils/constants';
import styles from './ProductManagement.module.css';

const IconPlus = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconEdit = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPower = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M6.38 6.38a9 9 0 1 0 11.24 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProductManagement = () => {
  const { staggerContainer, staggerItem } = useAnimation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
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

  async function loadProducts() {
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
  }

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

  const activeCount = products.filter(p => p.active).length;
  const inactiveCount = products.length - activeCount;

  const filteredProducts = products
    .filter((p) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.product_id || '').toLowerCase().includes(q)
      );
    })
    .filter((p) => (categoryFilter === 'all' ? true : p.category === categoryFilter))
    .filter((p) => {
      if (statusFilter === 'active') return !!p.active;
      if (statusFilter === 'inactive') return !p.active;
      return true;
    });

  const getBadgeClass = (category) => {
    if (category === PRODUCT_CATEGORIES.COLDRINK) return styles.pmBadgeCold;
    if (category === PRODUCT_CATEGORIES.PAAN) return styles.pmBadgePaan;
    return styles.pmBadgeOther;
  };

  const getCardToneClass = (active) => (active ? styles.pmCardToneActive : styles.pmCardToneInactive);

  const onRequestDeactivate = (product) => setPendingDeactivate(product);

  const onCloseDeactivate = () => setPendingDeactivate(null);

  const handleConfirmDeactivate = async () => {
    if (!pendingDeactivate) return;
    try {
      setError('');
      await productsAPI.updateProduct(pendingDeactivate.product_id, { active: false });
      setPendingDeactivate(null);
      loadProducts();
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  return (
    <div className={styles.pmShell}>
      <div className={styles.pmPage}>
      {/* Header */}
      <div className={styles.pmHeader}>
        <div className={styles.pmHeaderLeft}>
          <div className={styles.pmTitleRow}>
            <div className={styles.pmTitle}>Product Management</div>
            <div className={styles.pmCountPill} aria-label={`Products count ${products.length}`}>
              <span>Products</span>
              <span>({products.length})</span>
              <span aria-hidden="true">·</span>
              <span>{activeCount} active</span>
              <span aria-hidden="true">·</span>
              <span>{inactiveCount} inactive</span>
            </div>
          </div>
          <div className={styles.pmSubTitle}>
            Search, edit prices, and manage availability for live selling.
          </div>
        </div>

        <div className={styles.pmHeaderActions}>
          <button
            type="button"
            className={styles.pmPrimaryCta}
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <IconPlus aria-hidden="true" />
            Add Product
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={[styles.pmPanel, styles.pmPanelTight].join(' ')}>
        <div className={styles.pmControls}>
          <div className={styles.pmField}>
            <div className={styles.pmLabel}>Search</div>
            <input
              className={styles.pmInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or ID…"
              aria-label="Search products"
            />
          </div>

          <div className={styles.pmField}>
            <div className={styles.pmLabel}>Category</div>
            <select
              className={styles.pmSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {Object.entries(CATEGORY_NAMES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.pmField}>
            <div className={styles.pmLabel}>Status</div>
            <select
              className={styles.pmSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.pmControlButton}
            onClick={loadProducts}
            aria-label="Refresh products"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.pmFormWrap}>
              <div className={styles.pmFormHeader}>
                <div className={styles.pmFormTitle}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={styles.pmFormGrid}>
                  <div className={styles.pmField}>
                    <div className={styles.pmLabel}>Product ID</div>
                    <input
                      className={styles.pmInput}
                      type="text"
                      value={formData.product_id}
                      onChange={(e) => handleInputChange('product_id', e.target.value)}
                      placeholder="e.g., COLA001"
                      disabled={!!editingProduct}
                      required
                    />
                  </div>

                  <div className={styles.pmField}>
                    <div className={styles.pmLabel}>Product name</div>
                    <input
                      className={styles.pmInput}
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Coca Cola"
                      required
                    />
                  </div>

                  <div className={styles.pmField}>
                    <div className={styles.pmLabel}>Price</div>
                    <input
                      className={styles.pmInput}
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g., 25.00"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>

                  <div className={styles.pmField}>
                    <div className={styles.pmLabel}>Category</div>
                    <select
                      className={styles.pmSelect}
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      {Object.entries(CATEGORY_NAMES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.pmFormActions}>
                  <button type="button" className={styles.pmSecondaryBtn} onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.pmPrimaryCta}>
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && <div className={styles.pmError}>{error}</div>}

      {/* Products Grid */}
      <div className={styles.pmPanel}>
        <div className={styles.pmGridHeader}>
          <div className={styles.pmGridTitle}>
            Products
          </div>
          <div className={styles.pmGridHint}>
            {loading ? 'Refreshing…' : `${filteredProducts.length} shown`}
          </div>
        </div>

        {loading ? (
          <div className={styles.pmEmpty}>Loading products…</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.pmEmpty}>
            No matching products. Try clearing filters or add a new product.
          </div>
        ) : (
          <motion.div
            className={styles.pmGrid}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredProducts.map((product) => {
              const statusClass = product.active ? styles.pmStatusActive : styles.pmStatusInactive;
              const cardClass = [
                styles.pmCard,
                getCardToneClass(product.active),
                !product.active ? styles.pmCardInactive : '',
              ].filter(Boolean).join(' ');

              return (
                <motion.div key={product.product_id} variants={staggerItem}>
                  <motion.div
                    className={cardClass}
                    layout
                  >
                    <div className={styles.pmCardTop}>
                      <div className={styles.pmName} title={product.name}>
                        {product.name}
                      </div>
                      <div className={styles.pmPrice}>
                        {formatCurrency(product.price)}
                      </div>
                    </div>

                    <div className={styles.pmMetaRow}>
                      <div className={[styles.pmBadge, getBadgeClass(product.category)].join(' ')}>
                        {CATEGORY_NAMES[product.category] || 'Others'}
                      </div>
                      <div className={styles.pmId} title={product.product_id}>
                        ID: {product.product_id}
                      </div>
                    </div>

                    <div className={[styles.pmStatusRow, statusClass].join(' ')}>
                      <div className={styles.pmStatusDot} aria-hidden="true" />
                      <div className={styles.pmStatusLabel}>
                        {product.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <div className={styles.pmActions}>
                      <button
                        type="button"
                        className={styles.pmActionBtn}
                        onClick={() => handleEdit(product)}
                      >
                        <IconEdit aria-hidden="true" />
                        Edit
                      </button>

                      {product.active ? (
                        <button
                          type="button"
                          className={[styles.pmActionBtn, styles.pmActionDanger].join(' ')}
                          onClick={() => onRequestDeactivate(product)}
                        >
                          <IconPower aria-hidden="true" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={[styles.pmActionBtn, styles.pmActionMuted].join(' ')}
                          onClick={() => handleToggleActive(product)}
                        >
                          <IconPower aria-hidden="true" />
                          Activate
                        </button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Confirm Deactivate */}
      <AnimatePresence>
        {pendingDeactivate && (
          <motion.div
            className={styles.pmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseDeactivate}
            role="presentation"
          >
            <motion.div
              className={styles.pmDialog}
              initial={{ y: 10, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 8, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Confirm deactivate product"
            >
              <div className={styles.pmDialogTitle}>Deactivate product?</div>
              <div className={styles.pmDialogBody}>
                “{pendingDeactivate.name}” will become unavailable in POS. You can re-activate it later.
              </div>
              <div className={styles.pmDialogActions}>
                <button type="button" className={styles.pmDialogBtn} onClick={onCloseDeactivate}>
                  Cancel
                </button>
                <button type="button" className={[styles.pmDialogBtn, styles.pmDialogBtnPrimary].join(' ')} onClick={handleConfirmDeactivate}>
                  Deactivate
                </button>
              </div>
              <div className={styles.pmDialogTip}>
                Tip: Deactivating keeps historical sales intact.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductManagement;
