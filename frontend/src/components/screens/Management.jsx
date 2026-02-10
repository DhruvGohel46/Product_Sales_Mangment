import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../hooks/useAnimation';
import { productsAPI, categoriesAPI, handleAPIError, formatCurrency } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import CategoryManagement from './CategoryManagement';
import '../../styles/Management.css';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

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

const IconImage = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTrash = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProductManagement = () => {
  const { staggerContainer, staggerItem } = useAnimation();
  const { showSuccess } = useToast();
  const { settings } = useSettings();
  const showImages = settings?.show_product_images !== 'false';
  const topRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    category: '', // Legacy support
    image_filename: null,
    active: true
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(false);

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
    setSelectedImage(null);
    setPreviewImage(null);
    setImageToDelete(false);
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

        // Handle Image Update
        if (imageToDelete) {
          await productsAPI.deleteImage(editingProduct.product_id);
        }

        if (selectedImage) {
          setImageUploading(true);
          try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            await productsAPI.uploadImage(editingProduct.product_id, formData);
          } finally {
            setImageUploading(false);
          }
        }

      } else {
        // Auto-generate ID if name and category are present
        const id = generateProductId(formData.name, formData.category);
        const newProduct = { ...productData, product_id: id };
        await productsAPI.createProduct(newProduct);

        if (selectedImage) {
          setImageUploading(true);
          try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            await productsAPI.uploadImage(id, formData);
          } finally {
            setImageUploading(false);
          }
        }
      }
      resetForm();
      loadProducts();
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  const handleReactivate = async (product) => {
    try {
      await productsAPI.updateProduct(product.product_id, { active: true });
      showSuccess('Product reactivated successfully');
      loadProducts();
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  const handleDeleteRequest = (product) => {
    setPendingDelete(product);
    setDeletePassword('');
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    if (deletePassword !== 'Karam2@15') {
      setError('Incorrect password');
      return;
    }

    try {
      await productsAPI.deleteProduct(pendingDelete.product_id);
      showSuccess('Product deleted successfully');
      setPendingDelete(null);
      setDeletePassword('');
      loadProducts();
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    setDeletePassword('');
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setImageToDelete(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setImageToDelete(true);
    // If it's a file input, reset it? We can't easily, but state controls the submission
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category_id: product.category_id || '',
      category: product.category || '',
      image_filename: product.image_filename,
      active: product.active
    });

    if (product.image_filename) {
      setPreviewImage(productsAPI.getImageUrl(product.image_filename));
    } else {
      setPreviewImage(null);
    }
    setSelectedImage(null);
    setImageToDelete(false);

    setShowAddForm(true);

    // Scroll to top
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    <div className="pmSectionContent" ref={topRef}>

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

              <div className="pmField" style={{ gridColumn: '1 / -1' }}>
                <div className="pmLabel">Product Image (Optional)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-secondary)',
                    position: 'relative'
                  }}>
                    {imageUploading && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          border: '3px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '3px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      </div>
                    )}
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <IconImage style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ marginBottom: '10px', display: 'block', width: '100%' }}
                    />
                    {(previewImage && (selectedImage || formData.image_filename)) && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="pmActionBtn pmActionDanger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pmFormActions">
                <button type="button" className="pmSecondaryBtn" onClick={resetForm}>Cancel</button>
                <button type="submit" className="pmPrimaryCta" disabled={imageUploading}>
                  {imageUploading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }} />
                      Processing Image...
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
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
          <div className="pmGridTitle" >Products</div>
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
              <motion.div
                key={product.product_id}
                variants={staggerItem}
                className={`pmCard ${!product.active ? 'pmCardInactive' : ''}`}
                style={{
                  minHeight: showImages ? '180px' : 'auto',
                  padding: showImages ? '20px' : '16px',
                }}
              >
                {showImages && (
                  <div className="pmCardImageContainer">
                    {product.image_filename ? (
                      <img
                        src={productsAPI.getImageUrl(product.image_filename)}
                        alt={product.name}
                        className="pmCardImage"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback placeholder (shown if no image or error) */}
                    <div className="pmCardImagePlaceholder" style={{ display: product.image_filename ? 'none' : 'flex', position: product.image_filename ? 'absolute' : 'relative', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>No Image</span>
                    </div>
                  </div>
                )}

                <div className="pmCardContent" style={{ padding: showImages ? '16px' : '0 0 8px 0', gap: showImages ? '12px' : '8px' }}>
                  <div className="pmCardHeader">
                    <div className="pmName" title={product.name} style={{ fontSize: showImages ? '16px' : '17px', WebkitLineClamp: showImages ? 2 : 1 }}>{product.name}</div>
                    <div className="pmPriceRow">
                      <div className="pmPrice">{formatCurrency(product.price)}</div>
                      <div className="pmBadge">{product.category_name || product.category || 'Other'}</div>
                    </div>
                  </div>

                  {showImages && (
                    <div className="pmMetaRow" style={{ justifyContent: 'flex-start' }}>
                      <div className="pmId">ID: {product.product_id}</div>
                    </div>
                  )}

                  <div className="pmActions" style={{
                    marginTop: 'auto',
                    borderTop: showImages ? '1px solid var(--border-subtle)' : 'none',
                    paddingTop: showImages ? '10px' : '0',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '6px',
                    width: '100%'
                  }}>
                    <button className="pmActionBtn" onClick={() => handleEdit(product)}>
                      <IconEdit /> {showImages ? 'Edit' : ''}
                    </button>
                    {product.active ? (
                      <button className="pmActionBtn pmActionDanger" onClick={() => onRequestDeactivate(product)}>
                        <IconPower /> {showImages ? 'Deactivate' : ''}
                      </button>
                    ) : (
                      <button className="pmActionBtn pmActionReactivate" onClick={() => handleReactivate(product)}>
                        <IconPower /> {showImages ? 'Reactivate' : ''}
                      </button>
                    )}
                    <button className="pmActionBtn pmActionDanger" onClick={() => handleDeleteRequest(product)} title="Delete permanently">
                      <IconTrash />
                    </button>
                  </div>
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
            <motion.div className="pmDialog" initial={{ y: 20, scale: 0.95, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="pmDialogTitle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Deactivate product?
              </div>
              <div className="pmDialogBody">
                Are you sure you want to deactivate "{pendingDeactivate.name}"? It will be hidden from the POS screen but can be reactivated later.
              </div>
              <div className="pmDialogActions">
                <button className="pmDialogBtn" onClick={onCloseDeactivate}>Cancel</button>
                <button className="pmDialogBtn pmDialogBtnPrimary" onClick={handleConfirmDeactivate}>Deactivate</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal with Password */}
      <AnimatePresence>
        {pendingDelete && (
          <motion.div className="pmOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCancelDelete}>
            <motion.div className="pmDialog" initial={{ y: 20, scale: 0.95, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="pmDialogTitle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delete product permanently?
              </div>
              <div className="pmDialogBody">
                This will permanently delete "{pendingDelete.name}" and its image. This action cannot be undone.
                <div style={{ marginTop: '16px', position: 'relative' }}>
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    className="pmInput"
                    placeholder="Enter password to confirm"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleConfirmDelete()}
                    autoFocus
                    style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.6
                    }}
                  >
                    {showDeletePassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.826M9.363 5.365A9.466 9.466 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.658 2.366M6.632 6.632A9.466 9.466 0 005 12s3 7 7 7a9.466 9.466 0 005.368-1.632" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="pmDialogActions">
                <button className="pmDialogBtn" onClick={handleCancelDelete}>Cancel</button>
                <button className="pmDialogBtn pmDialogBtnPrimary" onClick={handleConfirmDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
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
