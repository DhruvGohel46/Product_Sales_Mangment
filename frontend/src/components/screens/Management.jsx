import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../hooks/useAnimation';
import { productsAPI, categoriesAPI, handleAPIError, formatCurrency } from '../../utils/api';
import CategoryManagement from './CategoryManagement';
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
  const [categories, setCategories] = useState([]);
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
    category_id: '',
    category: '', // Legacy support
    active: true
  });

  // Load data on mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await productsAPI.getAllProductsWithInactive();
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
      const cats = response.data.categories || [];
      setCategories(cats);
      // If categories available, set default for form if empty
      if (cats.length > 0 && !formData.category_id) {
        setFormData(prev => ({
          ...prev,
          category_id: cats[0].id,
          category: cats[0].name
        }));
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      category: categories.length > 0 ? categories[0].name : '',
      active: true
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleInputChange = (field, value) => {
    if (field === 'category_id') {
      const cat = categories.find(c => c.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        category_id: value,
        category: cat ? cat.name : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const generateProductId = (name, categoryName) => {
    const categoryCode = (categoryName || 'OTHE').toUpperCase().slice(0, 4).padEnd(4, 'X');
    // Using simple random for demo, real system would check DB for uniqueness
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryCode}${randomNum}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id)
      };

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.product_id, productData);
      } else {
        // Auto-generate ID if name and category are present
        const id = generateProductId(formData.name, formData.category);
        await productsAPI.createProduct({ ...productData, product_id: id });
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
      category_id: product.category_id || '',
      category: product.category || '',
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

  const filteredProducts = products
    .filter((p) => {
      const searchMatch = !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.product_id.toLowerCase().includes(query.toLowerCase());
      return searchMatch;
    })
    .filter((p) => (categoryFilter === 'all' ? true : p.category_id === parseInt(categoryFilter)))
    .filter((p) => {
      if (statusFilter === 'active') return !!p.active;
      if (statusFilter === 'inactive') return !p.active;
      return true;
    });

  return (
    <div className="pmSectionContent">
      {/* Header Actions */}
      <div className="pmHeader" style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: 0, margin: '0 0 20px 0' }}>
        <div className="pmHeaderLeft">
          <div className="pmTitleRow">
            <div className="pmTitle" style={{ fontSize: '24px' }}>Product Catalog</div>
          </div>
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
            />
          </div>

          <div className="pmField">
            <div className="pmLabel">Category</div>
            <select
              className="pmSelect"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="pmField">
            <div className="pmLabel">Status</div>
            <select
              className="pmSelect"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button type="button" className="pmControlButton" onClick={loadProducts}>
            Refresh
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pmFormWrap">
            <div className="pmFormHeader">
              <div className="pmFormTitle">{editingProduct ? 'Edit Product' : 'Add New Product'}</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="pmFormGrid">
                <div className="pmField">
                  <div className="pmLabel">Product Name</div>
                  <input className="pmInput" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                </div>
                <div className="pmField">
                  <div className="pmLabel">Price</div>
                  <input className="pmInput" type="number" step="0.01" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} required />
                </div>
                <div className="pmField">
                  <div className="pmLabel">Category</div>
                  <select className="pmSelect" value={formData.category_id} onChange={(e) => handleInputChange('category_id', e.target.value)} required>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pmFormActions">
                <button type="button" className="pmSecondaryBtn" onClick={resetForm}>Cancel</button>
                <button type="submit" className="pmPrimaryCta">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && <div className="pmError">{error}</div>}

      {/* Products Grid */}
      <div className="pmPanel">
        <div className="pmGridHeader">
          <div className="pmGridTitle" style={{ fontSize: '20px' }}>Products</div>
          <div className="pmGridHint">{loading ? 'Refreshing…' : `${filteredProducts.length} shown`}</div>
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

        {loading ? (
          <div className="pmEmpty">Loading products…</div>
        ) : filteredProducts.length === 0 ? (
          <div className="pmEmpty">No matching products found.</div>
        ) : (
          <motion.div className="pmGrid" variants={staggerContainer} initial="initial" animate="animate">
            {filteredProducts.map((product) => (
              <motion.div key={product.product_id} variants={staggerItem} className={`pmCard ${!product.active ? 'pmCardInactive' : ''}`}>
                <div className="pmCardTop">
                  <div className="pmName">{product.name}</div>
                  <div className="pmPrice">{formatCurrency(product.price)}</div>
                </div>
                <div className="pmMetaRow">
                  <div className="pmBadge">{product.category_name || product.category || 'Other'}</div>
                  <div className="pmId">ID: {product.product_id}</div>
                </div>
                <div className="pmActions" style={{ marginTop: '10px' }}>
                  <button className="pmActionBtn" onClick={() => handleEdit(product)}>
                    <IconEdit /> Edit
                  </button>
                  {product.active ? (
                    <button className="pmActionBtn pmActionDanger" onClick={() => onRequestDeactivate(product)}>
                      <IconPower /> Deactivate
                    </button>
                  ) : (
                    <div className="pmInactiveNote">Inactive</div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Deactivate Modal */}
      <AnimatePresence>
        {pendingDeactivate && (
          <motion.div className="pmOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCloseDeactivate}>
            <motion.div className="pmDialog" initial={{ y: 10, scale: 0.98, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 8, scale: 0.98, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="pmDialogTitle">Deactivate product?</div>
              <div className="pmDialogBody">"{pendingDeactivate.name}" will become unavailable in POS.</div>
              <div className="pmDialogActions">
                <button className="pmDialogBtn" onClick={onCloseDeactivate}>Cancel</button>
                <button className="pmDialogBtn pmDialogBtnPrimary" onClick={handleConfirmDeactivate}>Deactivate</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Management = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="pmShell">
      <div className="pmPage">
        {/* Main Title & Tabs */}
        <div className="pmHeader">
          <div className="pmHeaderLeft">
            <div className="pmTitleRow">
              <div className="pmTitle">Store Management</div>
            </div>
          </div>

          <div className="pmHeaderActions" style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
            <button
              className={`pmControlButton ${activeTab === 'products' ? 'pmActiveTab' : ''}`}
              onClick={() => setActiveTab('products')}
              style={{
                border: 'none',
                background: activeTab === 'products' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'products' ? 'white' : 'var(--text-secondary)',
                boxShadow: activeTab === 'products' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Products
            </button>
            <button
              className={`pmControlButton ${activeTab === 'categories' ? 'pmActiveTab' : ''}`}
              onClick={() => setActiveTab('categories')}
              style={{
                border: 'none',
                background: activeTab === 'categories' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'categories' ? 'white' : 'var(--text-secondary)',
                boxShadow: activeTab === 'categories' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Categories
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' ? <ProductManagement /> : <CategoryManagement />}
      </div>
    </div>
  );
};

export default Management;
