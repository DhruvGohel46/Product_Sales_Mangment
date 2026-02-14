import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryAPI, productsAPI, handleAPIError } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import '../../styles/Inventory.css';
import GlobalSelect from '../ui/GlobalSelect';

// --- Icons ---
const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const AdjustIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
);

const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const Inventory = () => {
    const { showSuccess, showError, showWarning } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, DIRECT_SALE, RAW_MATERIAL
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, LOW_STOCK, OUT_OF_STOCK
    const [filterProductStatus, setFilterProductStatus] = useState('ALL'); // ALL, ACTIVE, INACTIVE
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        type: 'DIRECT_SALE',
        unit: 'piece',
        stock: 0,
        unit_price: 0,
        alert_threshold: 10,
        product_id: ''
    });

    const [adjustData, setAdjustData] = useState({
        amount: 0,
        type: 'add'
    });

    useEffect(() => {
        loadInventory();
        loadProducts();
    }, []);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const res = await inventoryAPI.getAllInventory();
            setItems(res.data.inventory || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const res = await productsAPI.getAllProducts({ include_inactive: true });
            setProducts(res.data.products || []);
        } catch (err) {
            console.error(err);
        }
    };

    // Metrics
    const metrics = useMemo(() => {
        const totalProducts = items.length;
        const lowStock = items.filter(i => i.stock <= i.alert_threshold && i.stock > 0).length;
        const outOfStock = items.filter(i => i.stock <= 0).length;
        const totalStockValue = items.reduce((acc, curr) => acc + curr.stock, 0);

        // Calculate monetary value safely if product price is available
        const inventoryValue = items.reduce((acc, curr) => {
            if (curr.type === 'DIRECT_SALE' && curr.product_id) {
                const p = products.find(p => p.product_id === curr.product_id);
                if (p) return acc + (curr.stock * p.price);
            } else if (curr.type === 'RAW_MATERIAL') {
                return acc + (curr.stock * (curr.unit_price || 0));
            }
            return acc;
        }, 0);

        const inactiveStockValue = items.reduce((acc, curr) => {
            if (curr.product_status === 'inactive' && curr.type === 'DIRECT_SALE' && curr.product_id) {
                const p = products.find(p => p.product_id === curr.product_id);
                if (p) return acc + (curr.stock * p.price);
            }
            return acc;
        }, 0);

        return { totalProducts, lowStock, outOfStock, totalStockValue, inventoryValue, inactiveStockValue };
    }, [items, products]);

    // Sorting & Filtering
    const sortedItems = useMemo(() => {
        let workableItems = [...items];

        // 1. Filter
        workableItems = workableItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = filterType === 'ALL' || item.type === filterType;

            let matchesStatus = true;
            if (filterStatus === 'LOW_STOCK') matchesStatus = item.stock <= item.alert_threshold && item.stock > 0;
            if (filterStatus === 'OUT_OF_STOCK') matchesStatus = item.stock <= 0;

            let matchesProductStatus = true;
            if (filterProductStatus === 'ACTIVE') matchesProductStatus = item.product_status !== 'inactive';
            if (filterProductStatus === 'INACTIVE') matchesProductStatus = item.product_status === 'inactive';

            return matchesSearch && matchesType && matchesStatus && matchesProductStatus;
        });

        // 2. Sort
        if (sortConfig.key) {
            workableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Handle strings case-insensitive
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return workableItems;
    }, [items, searchTerm, filterType, filterStatus, filterProductStatus, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Quick Adjust Handler
    const handleQuickAdjust = async (item, amount) => {
        if (item.is_locked) {
            showWarning('Product is inactive. Reactivate from Management to adjust stock.', 4000, 'top-center');
            return;
        }
        try {
            await inventoryAPI.adjustStock(item.id, amount);
            // Optimistic update or reload
            loadInventory();

            const newStock = item.stock + amount;
            if (amount < 0 && newStock <= item.alert_threshold && item.stock > item.alert_threshold) {
                showWarning(`Low Stock Alert: ${item.name} is down to ${newStock} ${item.unit}s`, 5000, 'top-center');
            } else {
                showSuccess(`Stock ${amount > 0 ? 'increased' : 'decreased'}`);
            }
        } catch (err) {
            showError('Failed to adjust stock');
        }
    };

    // Handlers (Existing)
    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveInventory = async (e) => {
        e.preventDefault();
        try {
            let finalData = { ...formData };
            if (formData.type === 'DIRECT_SALE' && formData.product_id) {
                const p = products.find(p => p.product_id === formData.product_id);
                if (p) finalData.name = p.name;
            }

            if (selectedItem) {
                await inventoryAPI.updateInventory(selectedItem.id, finalData);
                showSuccess('Inventory updated');
            } else {
                await inventoryAPI.createInventory(finalData);
                showSuccess('Inventory created');
            }
            setShowAddModal(false);
            resetForm();
            loadInventory();
        } catch (err) {
            const error = handleAPIError(err);
            showError(error.message);
        }
    };

    const handleAdjustStock = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;
        try {
            const adjustment = adjustData.type === 'add' ? parseFloat(adjustData.amount) : -parseFloat(adjustData.amount);
            await inventoryAPI.adjustStock(selectedItem.id, adjustment);

            const newStock = selectedItem.stock + adjustment;
            if (adjustment < 0 && newStock <= selectedItem.alert_threshold && selectedItem.stock > selectedItem.alert_threshold) {
                showWarning(`Low Stock Alert: ${selectedItem.name} is down to ${newStock} ${selectedItem.unit}s`, 5000, 'top-center');
            } else {
                showSuccess('Stock adjusted');
            }

            setShowAdjustModal(false);
            setAdjustData({ amount: 0, type: 'add' });
            loadInventory();
        } catch (err) {
            const error = handleAPIError(err);
            showError(error.message);
        }
    };

    const handleDelete = async (id) => {
        const item = items.find(i => i.id === id);
        if (item?.is_locked) {
            showWarning('Inactive product inventory is locked and cannot be deleted.', 4000, 'top-center');
            return;
        }
        if (window.confirm('Delete this inventory item?')) {
            try {
                await inventoryAPI.deleteInventory(id);
                showSuccess('Item deleted');
                loadInventory();
            } catch (err) {
                const error = handleAPIError(err);
                showError(error.message);
            }
        }
    };

    const openAddModal = () => {
        setSelectedItem(null);
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (item) => {
        if (item.is_locked) {
            showWarning('Product is inactive. Reactivate from Management to edit inventory.', 4000, 'top-center');
            return;
        }
        setSelectedItem(item);
        setFormData({
            name: item.name,
            type: item.type,
            unit: item.unit,
            stock: item.stock,
            unit_price: item.unit_price || 0,
            alert_threshold: item.alert_threshold,
            product_id: item.product_id || ''
        });
        setShowAddModal(true);
    };

    const openAdjustModal = (item) => {
        if (item.is_locked) {
            showWarning('Product is inactive. Reactivate from Management to adjust stock.', 4000, 'top-center');
            return;
        }
        setSelectedItem(item);
        setAdjustData({ amount: 0, type: 'add' });
        setShowAdjustModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'DIRECT_SALE',
            unit: 'piece',
            stock: 0,
            unit_price: 0,
            alert_threshold: 10,
            product_id: ''
        });
        setSelectedItem(null);
    };

    // Helper for progress bar color
    const getProgressColor = (item) => {
        if (item.stock <= 0) return '#EF4444';
        if (item.stock <= item.alert_threshold) return '#F59E0B';
        return '#10B981';
    };

    const getProductStatusBadge = (item) => {
        if (item.product_status === 'inactive') return <span className="invBadge inactive">Inactive</span>;
        return <span className="invBadge active">Active</span>;
    };

    const activeProducts = products.filter(p => p.active);

    return (
        <div className="invPage">
            {/* --- Summary Dashboard --- */}
            <div className="invSummaryGrid">
                <div
                    className={`invSummaryCard ${filterStatus === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('ALL')}
                >
                    <span className="invSummaryLabel">Total Products</span>
                    <span className="invSummaryValue">{metrics.totalProducts}</span>
                </div>
                <div
                    className={`invSummaryCard ${filterStatus === 'LOW_STOCK' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
                >
                    <span className="invSummaryLabel">Low Stock</span>
                    <span className="invSummaryValue" style={{ color: metrics.lowStock > 0 ? '#F59E0B' : 'inherit' }}>
                        {metrics.lowStock}
                    </span>
                </div>
                <div
                    className={`invSummaryCard ${filterStatus === 'OUT_OF_STOCK' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
                >
                    <span className="invSummaryLabel">Out of Stock</span>
                    <span className="invSummaryValue" style={{ color: metrics.outOfStock > 0 ? '#EF4444' : 'inherit' }}>
                        {metrics.outOfStock}
                    </span>
                </div>
                <div className="invSummaryCard">
                    <span className="invSummaryLabel">Total Units</span>
                    <span className="invSummaryValue">{metrics.totalStockValue.toLocaleString()}</span>
                </div>
                <div className="invSummaryCard">
                    <span className="invSummaryLabel">Inventory Value</span>
                    <span className="invSummaryValue" style={{ color: '#10B981' }}>
                        ₹{metrics.inventoryValue.toLocaleString()}
                    </span>
                </div>
                <div className="invSummaryCard">
                    <span className="invSummaryLabel">Inactive Stock Value</span>
                    <span className="invSummaryValue" style={{ color: '#6B7280' }}>
                        Rs {metrics.inactiveStockValue.toLocaleString()}
                    </span>
                </div>
            </div>


            {/* --- Main Content --- */}
            <div className="invMainContent">
                {/* Header */}
                <div className="invHeader">
                    <div className="invTitleGroup">
                        <div className="invTitle">Inventory Management</div>
                        <div className="invSubtitle">Manage and track your stock levels</div>
                    </div>
                    <div className="invControls">
                        <GlobalSelect
                            options={[
                                { label: 'All Types', value: 'ALL' },
                                { label: 'Direct Sale', value: 'DIRECT_SALE' },
                                { label: 'Raw Material', value: 'RAW_MATERIAL' }
                            ]}
                            value={filterType}
                            onChange={(val) => setFilterType(val)}
                            placeholder="Filter Type"
                            className="invDropdown"
                        />
                        <GlobalSelect
                            options={[
                                { label: 'All Status', value: 'ALL' },
                                { label: 'Active', value: 'ACTIVE' },
                                { label: 'Inactive', value: 'INACTIVE' }
                            ]}
                            value={filterProductStatus}
                            onChange={(val) => setFilterProductStatus(val)}
                            placeholder="Filter Status"
                            className="invDropdown"
                        />
                        <div className="invSearchWrapper">
                            <input
                                type="text"
                                className="invSearchInput"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="invSearchIcon">
                                <SearchIcon />
                            </div>
                        </div>
                        <button className="invPrimaryBtn" onClick={openAddModal}>
                            <PlusIcon /> Add Inventory
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="invTableContainer">
                    <table className="invTable">
                        <thead>
                            <tr>
                                <th className="col-product" onClick={() => handleSort('name')}>Product Select</th>
                                <th className="col-stock" onClick={() => handleSort('stock')}>Current Stock</th>
                                <th className="col-alert" onClick={() => handleSort('alert_threshold')}>Stock Health</th>
                                <th className="col-status">Product Status</th>
                                <th className="col-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="invEmptyState">
                                            <div className="invEmptyIcon">📦</div>
                                            <div className="invEmptyTitle">No inventory items found</div>
                                            <div className="invEmptySub">
                                                Add your first product to start tracking stock.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedItems.map(item => (
                                    <motion.tr
                                        key={item.id}
                                        className="invRow"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        layout
                                    >
                                        <td>
                                            <div className="invProductName">{item.name}</div>
                                            <div className={`invProductTypeBadge ${item.type === 'DIRECT_SALE' ? 'badge-direct' : 'badge-raw'}`}>
                                                {item.type === 'DIRECT_SALE' ? 'Direct Sale' : 'Raw Material'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="invStockWrapper">
                                                <span className="invStockValue">{item.stock}</span>
                                                <span className="invStockUnit">{item.unit}s</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="invAlertWrapper">
                                                <div className="invProgressBarBG">
                                                    <div
                                                        className="invProgressBarFill"
                                                        style={{
                                                            width: `${Math.min((item.stock / (item.max_stock_history || 100)) * 100, 100)}%`,
                                                            backgroundColor: getProgressColor(item)
                                                        }}
                                                        title={`Max recorded: ${item.max_stock_history || 'N/A'}`}
                                                    />
                                                </div>
                                                <div className="invAlertText">
                                                    {item.status} | Alert at {item.alert_threshold}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {getProductStatusBadge(item)}
                                        </td>
                                        <td>
                                            <div className="invActionGroup">
                                                {/* Quick Adjust */}
                                                <div className="invQuickAdjust">
                                                    <button
                                                        className="invQuickBtn"
                                                        onClick={() => handleQuickAdjust(item, -1)}
                                                        disabled={item.is_locked}
                                                        title={item.is_locked ? 'Product is inactive. Reactivate from Management.' : 'Decrease stock'}
                                                    >
                                                        -
                                                    </button>
                                                    <button
                                                        className="invQuickBtn"
                                                        onClick={() => handleQuickAdjust(item, 1)}
                                                        disabled={item.is_locked}
                                                        title={item.is_locked ? 'Product is inactive. Reactivate from Management.' : 'Increase stock'}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    className="invIconBtn"
                                                    title={item.is_locked ? 'Product is inactive. Reactivate from Management.' : 'Adjust Stock'}
                                                    onClick={() => openAdjustModal(item)}
                                                    disabled={item.is_locked}
                                                >
                                                    <AdjustIcon />
                                                </button>
                                                <button
                                                    className="invIconBtn"
                                                    title={item.is_locked ? 'Product is inactive. Reactivate from Management.' : 'Edit'}
                                                    onClick={() => openEditModal(item)}
                                                    disabled={item.is_locked}
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    className="invIconBtn delete"
                                                    title={item.is_locked ? 'Inactive inventory is locked.' : 'Delete'}
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={item.is_locked}
                                                >
                                                    <TrashIcon />
                                                </button>
                                                {item.is_locked && (
                                                    <span className="invLockedTag" title="Product is inactive. Reactivate from Management.">
                                                        <LockIcon /> Locked
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer */}
                <div className="invTableFooter">
                    <div>Showing {sortedItems.length} of {items.length} products</div>
                    <div>{filterStatus !== 'ALL' ? `Filtered by ${filterStatus.replace('_', ' ').toLowerCase()}` : 'All items'}</div>
                </div>
            </div>

            {/* --- Modals (Unchanged logic, just ensure existing ones are present) --- */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="invModalOverlay">
                        <motion.div
                            className="invModal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className="invModalHeader">
                                <div className="invModalTitle">{selectedItem ? 'Edit Inventory' : 'Add New Inventory'}</div>
                                <button className="invIconBtn" onClick={() => setShowAddModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleSaveInventory}>
                                <div className="invModalBody">
                                    <div className="invFormGroup">
                                        <label className="invLabel">Inventory Type</label>
                                        <div className="invRadioGroup">
                                            <label className="invRadioLabel">
                                                <input
                                                    type="radio"
                                                    checked={formData.type === 'DIRECT_SALE'}
                                                    onChange={() => handleFormChange('type', 'DIRECT_SALE')}
                                                /> Direct Sale (Product)
                                            </label>
                                            <label className="invRadioLabel">
                                                <input
                                                    type="radio"
                                                    checked={formData.type === 'RAW_MATERIAL'}
                                                    onChange={() => handleFormChange('type', 'RAW_MATERIAL')}
                                                /> Raw Material
                                            </label>
                                        </div>
                                    </div>

                                    {formData.type === 'DIRECT_SALE' ? (
                                        <div className="invFormGroup">
                                            <label className="invLabel">Select Product</label>
                                            <GlobalSelect
                                                options={activeProducts.map(p => ({ label: p.name, value: p.product_id }))}
                                                value={formData.product_id}
                                                onChange={(val) => handleFormChange('product_id', val)}
                                                placeholder="Select Product..."
                                                className="invDropdown"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="invFormGroup">
                                                <label className="invLabel">Item Name</label>
                                                <input
                                                    className="invInput"
                                                    value={formData.name}
                                                    onChange={(e) => handleFormChange('name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="invFormGroup">
                                                <label className="invLabel">Unit Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="invInput"
                                                    value={formData.unit_price}
                                                    onChange={(e) => handleFormChange('unit_price', parseFloat(e.target.value))}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="invFormGroup">
                                            <label className="invLabel">Initial Stock</label>
                                            <input
                                                type="number"
                                                className="invInput"
                                                value={formData.stock}
                                                onChange={(e) => handleFormChange('stock', parseFloat(e.target.value))}
                                                required
                                            />
                                        </div>
                                        <div className="invFormGroup">
                                            <label className="invLabel">Unit</label>
                                            <GlobalSelect
                                                options={[
                                                    { label: 'Piece', value: 'piece' },
                                                    { label: 'Packet', value: 'packet' },
                                                    { label: 'Kg', value: 'kg' },
                                                    { label: 'Litre', value: 'litre' },
                                                    { label: 'Box', value: 'box' }
                                                ]}
                                                value={formData.unit}
                                                onChange={(val) => handleFormChange('unit', val)}
                                                placeholder="Select Unit"
                                                className="invDropdown"
                                            />
                                        </div>
                                    </div>

                                    <div className="invFormGroup">
                                        <label className="invLabel">Low Stock Alert Level</label>
                                        <div className="invSliderContainer">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                className="invSlider"
                                                value={formData.alert_threshold}
                                                onChange={(e) => handleFormChange('alert_threshold', parseFloat(e.target.value))}
                                            />
                                            <div className="invSliderValue">{formData.alert_threshold}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="invModalFooter">
                                    <button type="button" className="invBtn" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="invPrimaryBtn">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Adjust Modal */}
            <AnimatePresence>
                {showAdjustModal && (
                    <div className="invModalOverlay">
                        <motion.div
                            className="invModal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className="invModalHeader">
                                <div className="invModalTitle">Adjust Stock: {selectedItem?.name}</div>
                                <button className="invIconBtn" onClick={() => setShowAdjustModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleAdjustStock}>
                                <div className="invModalBody">
                                    <div className="invFormGroup">
                                        <label className="invLabel">Action</label>
                                        <div className="invRadioGroup">
                                            <label className="invRadioLabel">
                                                <input
                                                    type="radio"
                                                    checked={adjustData.type === 'add'}
                                                    onChange={() => setAdjustData(prev => ({ ...prev, type: 'add' }))}
                                                /> Add Stock
                                            </label>
                                            <label className="invRadioLabel">
                                                <input
                                                    type="radio"
                                                    checked={adjustData.type === 'reduce'}
                                                    onChange={() => setAdjustData(prev => ({ ...prev, type: 'reduce' }))}
                                                /> Reduce Stock
                                            </label>
                                        </div>
                                    </div>
                                    <div className="invFormGroup">
                                        <label className="invLabel">Quantity</label>
                                        <input
                                            type="number"
                                            className="invInput"
                                            value={adjustData.amount}
                                            onChange={(e) => setAdjustData(prev => ({ ...prev, amount: e.target.value }))}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="invModalFooter">
                                    <button type="button" className="invBtn" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                                    <button type="submit" className="invPrimaryBtn">Update Stock</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
