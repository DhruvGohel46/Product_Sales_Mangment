import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../hooks/useAnimation';
import { productsAPI } from '../../utils/api';
import { handleAPIError, formatCurrency } from '../../utils/api';
import { PRODUCT_CATEGORIES, CATEGORY_NAMES, PRODUCT_STATUS, PRODUCT_STATUS_CONFIG } from '../../utils/constants';
import '../../styles/Management.css';

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
      setError('');
      setLoading(true);
      const response = await productsAPI.getAllProducts();
      setProducts(response.data.products || []);
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: PRODUCT_CATEGORIES.OTHER,
      active: true
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateProductId = () => {
    const category = formData.category || 'other';
    const categoryCode = category.toUpperCase().slice(0, 4);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryCode}${randomNum}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const productData = {
        ...formData,
        product_id: generateProductId() // Auto-generate ID
      };
      
      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.product_id, productData);
      } else {
        await productsAPI.createProduct(productData);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      active: product.active
    });
    setShowAddForm(true);
  };

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

  const getStatusConfig = (product) => {
    if (!product.active) {
      return PRODUCT_STATUS_CONFIG.OUT_OF_STOCK || PRODUCT_STATUS_CONFIG.ACTIVE;
    }
    return PRODUCT_STATUS_CONFIG.ACTIVE || {
      label: 'Active',
      color: '#10B981',
      bgColor: '#D1FAE5',
      borderColor: '#10B981'
    };
  };

  const activeCount = products.filter(p => p.active).length;
  const inactiveCount = products.filter(p => !p.active).length;

  const filteredProducts = products
    .filter((p) => {
      const searchMatch = !query || 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.product_id.toLowerCase().includes(query.toLowerCase());
      return searchMatch;
    })
    .filter((p) => (categoryFilter === 'all' ? true : p.category === categoryFilter))
    .filter((p) => {
      if (statusFilter === 'active') return !!p.active;
      if (statusFilter === 'inactive') return !p.active;
      return true;
    });

  const getBadgeClass = (category) => {
    if (category === PRODUCT_CATEGORIES.COLDRINK) return "pmBadgeCold";
    if (category === PRODUCT_CATEGORIES.PAAN) return "pmBadgePaan";
    return "pmBadgeOther";
  };

  const getCardToneClass = (active) => (active ? "pmCardToneActive" : "pmCardToneInactive");

  return (
    <div className="pmShell">
      <div className="pmPage">
      {/* Header */}
      <div className="pmHeader">
        <div className="pmHeaderLeft">
          <div className="pmTitleRow">
            <div className="pmTitle">Product Management</div>
          </div>
        </div>

        <div className="pmHeaderActions">
          <button
            type="button"
            className="pmPrimaryCta"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <IconPlus aria-hidden="true" />
            Add Product
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="pmPanel pmPanelTight">
        <div className="pmControls">
          <div className="pmField">
            <div className="pmLabel">Search</div>
            <input
              className="pmInput"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or ID…"
              aria-label="Search products"
            />
          </div>

          <div className="pmField">
            <div className="pmLabel">Category</div>
            <select
              className="pmSelect"
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

          <div className="pmField">
            <div className="pmLabel">Status</div>
            <select
              className="pmSelect"
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
            className="pmControlButton"
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
            <div className="pmFormWrap">
              <div className="pmFormHeader">
                <div className="pmFormTitle">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="pmFormGrid">
                  <div className="pmField">
                    <div className="pmLabel">Product name</div>
                    <input
                      className="pmInput"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Coca Cola"
                      required
                    />
                  </div>

                  <div className="pmField">
                    <div className="pmLabel">Price</div>
                    <input
                      className="pmInput"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g., 25.00"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>

                  <div className="pmField">
                    <div className="pmLabel">Category</div>
                    <select
                      className="pmSelect"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      {Object.entries(CATEGORY_NAMES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pmFormActions">
                  <button type="button" className="pmSecondaryBtn" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="pmPrimaryCta">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && <div className="pmError">{error}</div>}

      {/* Products Grid */}
      <div className="pmPanel">
        <div className="pmGridHeader">
          <div className="pmGridTitle">
            Products
          </div>
          <div className="pmGridHint">
            {loading ? 'Refreshing…' : `${filteredProducts.length} shown`}
          </div>
        </div>

        {loading ? (
          <div className="pmEmpty">Loading products…</div>
        ) : filteredProducts.length === 0 ? (
          <div className="pmEmpty">
            No matching products. Try clearing filters or add a new product.
          </div>
        ) : (
          <motion.div
            className="pmGrid"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredProducts.map((product) => {
              const statusConfig = getStatusConfig(product);
              const safeStatusConfig = statusConfig || {
                label: product.active ? 'Active' : 'Inactive',
                color: product.active ? '#10B981' : '#F59E0B',
                bgColor: product.active ? '#D1FAE5' : '#FEF3C7',
                borderColor: product.active ? '#10B981' : '#F59E0B'
              };
              const cardClass = [
                "pmCard",
                getCardToneClass(product.active),
                !product.active ? "pmCardInactive" : '',
              ].filter(Boolean).join(' ');

              return (
                <motion.div key={product.product_id} variants={staggerItem}>
                  <motion.div
                    className={cardClass}
                    layout
                  >
                    <div className="pmCardTop">
                      <div className="pmName" title={product.name}>
                        {product.name}
                      </div>
                      <div className="pmPrice">
                        {formatCurrency(product.price)}
                      </div>
                    </div>

                    <div className="pmMetaRow">
                      <div className={["pmBadge", getBadgeClass(product.category)].join(' ')}>
                        {CATEGORY_NAMES[product.category] || 'Others'}
                      </div>
                      <div className="pmId" title={product.product_id}>
                        ID: {product.product_id}
                      </div>
                    </div>

                    <div className="pmActions">
                      {/* Edit Button */}
                      <button
                        type="button"
                        className="pmActionBtn"
                        onClick={() => handleEdit(product)}
                      >
                        <IconEdit aria-hidden="true" />
                        Edit
                      </button>

                      {/* Deactivate Button */}
                      {product.active ? (
                        <button
                          type="button"
                          className="pmActionBtn pmActionDanger"
                          onClick={() => onRequestDeactivate(product)}
                        >
                          <IconPower aria-hidden="true" />
                          Deactivate
                        </button>
                      ) : (
                        <div className="pmInactiveNote">Inactive</div>
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
            className="pmOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseDeactivate}
            role="presentation"
          >
            <motion.div
              className="pmDialog"
              initial={{ y: 10, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 8, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Confirm deactivate product"
            >
              <div className="pmDialogTitle">Deactivate product?</div>
              <div className="pmDialogBody">
                "{pendingDeactivate.name}" will become unavailable in POS. You can reactivate it later.
              </div>
              <div className="pmDialogActions">
                <button type="button" className="pmDialogBtn" onClick={onCloseDeactivate}>
                  Cancel
                </button>
                <button type="button" className={["pmDialogBtn", "pmDialogBtnPrimary"].join(' ')} onClick={handleConfirmDeactivate}>
                  Deactivate
                </button>
              </div>
              <div className="pmDialogTip">
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
