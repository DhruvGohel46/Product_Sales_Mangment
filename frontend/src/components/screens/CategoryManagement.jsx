import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../hooks/useAnimation';
import { categoriesAPI, handleAPIError } from '../../utils/api';
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

const IconTrash = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconPower = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.38 6.38a9 9 0 1 0 11.24 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CategoryManagement = () => {
    const { staggerContainer, staggerItem } = useAnimation();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null); // { used: boolean, reason: string }

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        active: true
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await categoriesAPI.getAllCategories(true);
            setCategories(response.data.categories || []);
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
            description: '',
            active: true
        });
        setEditingCategory(null);
        setShowAddForm(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            if (editingCategory) {
                await categoriesAPI.updateCategory(editingCategory.id, formData);
            } else {
                await categoriesAPI.createCategory(formData);
            }
            resetForm();
            loadCategories();
        } catch (err) {
            const apiError = handleAPIError(err);
            setError(apiError.message);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            active: category.active
        });
        setShowAddForm(true);
    };

    const onRequestDelete = async (category) => {
        try {
            const response = await categoriesAPI.checkUsage(category.id);
            setDeleteStatus(response.data.usage);
            setPendingDelete(category);
        } catch (err) {
            setError('Failed to check category usage');
        }
    };

    const handleConfirmDelete = async () => {
        if (!pendingDelete) return;
        try {
            const response = await categoriesAPI.deleteCategory(pendingDelete.id);
            setPendingDelete(null);
            setDeleteStatus(null);
            loadCategories();
            // Show success message if needed
        } catch (err) {
            const apiError = handleAPIError(err);
            setError(apiError.message);
        }
    };

    return (
        <div className="pmPage">
            {/* Header Actions */}
            <div className="pmHeader" style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: 0 }}>
                <div className="pmHeaderLeft">
                    <div className="pmTitleRow">
                        <div className="pmTitle" style={{ fontSize: '24px' }}>Category Management</div>
                    </div>
                </div>
                <div className="pmHeaderActions">
                    <button className="pmPrimaryCta" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
                        <IconPlus /> Add Category
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
                        className="pmFormWrap"
                    >
                        <div className="pmFormHeader">
                            <div className="pmFormTitle">{editingCategory ? 'Edit Category' : 'Add New Category'}</div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="pmFormGrid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                <div className="pmField">
                                    <div className="pmLabel">Category Name</div>
                                    <input
                                        className="pmInput"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="pmField">
                                    <div className="pmLabel">Description</div>
                                    <input
                                        className="pmInput"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="pmFormActions">
                                <button type="button" className="pmSecondaryBtn" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="pmPrimaryCta">
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            {error && <div className="pmError">{error}</div>}

            {/* Categories Grid */}
            <div className="pmPanel">
                <div className="pmGridHeader">
                    <div className="pmGridTitle" style={{ fontSize: '20px' }}>Available Categories</div>
                    <div className="pmGridHint">{loading ? 'Loading...' : `${categories.length} categories`}</div>
                </div>

                {loading ? (
                    <div className="pmEmpty">Loading categories...</div>
                ) : categories.length === 0 ? (
                    <div className="pmEmpty">No categories found. Add your first category!</div>
                ) : (
                    <motion.div className="pmGrid" variants={staggerContainer} initial="initial" animate="animate">
                        {categories.map((cat) => (
                            <motion.div key={cat.id} variants={staggerItem} className={`pmCard ${!cat.active ? 'pmCardInactive' : ''}`}>
                                <div className="pmCardTop">
                                    <div className="pmName">{cat.name}</div>
                                    <div className={`pmBadge ${cat.active ? 'pmBadgePaan' : 'pmBadgeOther'}`}>
                                        {cat.active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <div className="pmMetaRow">
                                    <div className="pmId" style={{ color: 'var(--text-secondary)' }}>
                                        {cat.description || 'No description'}
                                    </div>
                                </div>
                                <div className="pmMetaRow" style={{ marginTop: '10px' }}>
                                    <div className="pmStatusRow">
                                        <div className={`pmStatusDot ${cat.active ? 'pmStatusActive' : 'pmStatusInactive'}`} style={{ width: 8, height: 8, borderRadius: '50%' }} />
                                        <span className="pmStatusLabel">
                                            {cat.product_count} linked products
                                        </span>
                                    </div>
                                </div>
                                <div className="pmActions" style={{ marginTop: '15px' }}>
                                    <div className="pmButtonGrid">
                                        <button className="pmActionBtn" onClick={() => handleEdit(cat)}>
                                            <IconEdit /> Edit
                                        </button>
                                        <button className="pmActionBtn pmActionDanger" onClick={() => onRequestDelete(cat)}>
                                            <IconTrash /> Remove
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {pendingDelete && (
                    <motion.div className="pmOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="pmDialog" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="pmDialogTitle">
                                {deleteStatus?.used ? 'Cannot Remove Category' : 'Remove Category?'}
                            </div>
                            <div className="pmDialogBody">
                                {deleteStatus?.used ? (
                                    <div style={{ color: '#ef4444' }}>
                                        <p><strong>"{pendingDelete.name}"</strong> {deleteStatus.reason}.</p>
                                        <p>Per business rules, it will be <strong>deactivated</strong> instead of deleted to protect historical data.</p>
                                    </div>
                                ) : (
                                    <p>Are you sure you want to permanently remove <strong>"{pendingDelete.name}"</strong>? This category is unused.</p>
                                )}
                            </div>
                            <div className="pmDialogActions">
                                <button className="pmDialogBtn" onClick={() => { setPendingDelete(null); setDeleteStatus(null); }}>Cancel</button>
                                <button
                                    className={`pmDialogBtn ${deleteStatus?.used ? 'pmDialogBtnPrimary' : 'pmDialogBtnPrimary'}`}
                                    onClick={handleConfirmDelete}
                                    style={deleteStatus?.used ? { color: '#F59E0B', borderColor: '#F59E0B' } : {}}
                                >
                                    {deleteStatus?.used ? 'Deactivate Instead' : 'Remove Permanently'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryManagement;
