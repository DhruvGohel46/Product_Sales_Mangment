import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { GlobalSelect, GlobalDatePicker } from '../ui';
import { formatCurrency } from '../../utils/api';
import { FiX } from 'react-icons/fi';

export default function ExpenseFormModal({ onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    supplier_name: '',
    category: 'Inventory Purchase',
    payment_method: 'Cash',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
    product_name: '',
    quantity: '1',
    total_amount: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Extract first item details for the simplified form
      const firstItem = initialData.items && initialData.items[0] ? initialData.items[0] : {};
      
      setFormData({
        supplier_name: initialData.supplier_name || '',
        category: initialData.category || 'Inventory Purchase',
        payment_method: initialData.payment_method || 'Cash',
        expense_date: initialData.expense_date ? new Date(initialData.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
        product_name: firstItem.product_id || '',
        quantity: firstItem.quantity || '1',
        total_amount: initialData.total_amount || ''
      });
    }
  }, [initialData]);

  const categoryOptions = [
    { value: 'Inventory Purchase', label: 'Inventory Purchase' },
    { value: 'Utility Bill', label: 'Utility Bill' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Supplier Payment', label: 'Supplier Payment' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Other', label: 'Other' }
  ];

  const paymentOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Card', label: 'Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Credit', label: 'Credit' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Send as a single item in the array for backend compatibility
    await onSubmit({
      ...formData,
      total_amount: Number(formData.total_amount),
      items: [{
        name: formData.product_name,
        quantity: formData.quantity,
        purchase_price: Number(formData.total_amount), // Use total as price since it's 1 entry
        subtotal: Number(formData.total_amount)
      }]
    });
    
    setIsSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(1px)',
      WebkitBackdropFilter: 'blur(1px)', padding: 'var(--spacing-4)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="liquid-glass-card"
        style={{
          width: '100%', maxWidth: '600px', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          borderRadius: 'var(--radius-2xl)',
          backgroundColor: 'var(--surface-primary, #18181b)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          zIndex: 1001
        }}
      >
        <div style={{
          padding: 'var(--spacing-5) var(--spacing-6)',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--glass-header)'
        }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
            {initialData ? 'Edit' : 'Record'} Expense / Purchase
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '1.25rem', padding: 'var(--spacing-2)'
          }}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--spacing-6)', overflowY: 'auto', flex: 1 }}>
            
            {/* Meta Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>Product / Service Name</label>
                <input
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Milk, Electricity Bill, New Chairs"
                  style={{
                    width: '100%', padding: 'var(--spacing-3)',
                    background: 'var(--glass-card)', border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>Quantity (Short Answer)</label>
                <input
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g. 5 kg, 10 units"
                  style={{
                    width: '100%', padding: 'var(--spacing-3)',
                    background: 'var(--glass-card)', border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>Total Amount</label>
                <input
                  type="number"
                  name="total_amount"
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                  style={{
                    width: '100%', padding: 'var(--spacing-3)',
                    background: 'var(--glass-card)', border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)',
                    fontSize: 'var(--text-lg)', fontWeight: 'bold'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>Supplier / Payee (Optional)</label>
                <input
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  placeholder="e.g. ABC Wholesale"
                  style={{
                    width: '100%', padding: 'var(--spacing-3)',
                    background: 'var(--glass-card)', border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <div>
                <GlobalSelect
                  label="Expense Category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(val) => handleInputChange({ target: { name: 'category', value: val } })}
                />
              </div>
              <div>
                <GlobalSelect
                  label="Payment Method"
                  options={paymentOptions}
                  value={formData.payment_method}
                  onChange={(val) => handleInputChange({ target: { name: 'payment_method', value: val } })}
                />
              </div>
              <div>
                <GlobalDatePicker
                  label="Date"
                  value={formData.expense_date}
                  onChange={(val) => handleInputChange({ target: { name: 'expense_date', value: val } })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Optional notes or remarks"
                rows={3}
                style={{
                  width: '100%', padding: 'var(--spacing-3)',
                  background: 'var(--glass-card)', border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
            </div>

          </div>

          <div style={{
            padding: 'var(--spacing-4) var(--spacing-6)',
            borderTop: '1px solid var(--glass-border)',
            background: 'var(--glass-card)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginRight: 'var(--spacing-3)' }}>Grand Total</span>
              <strong style={{ color: 'var(--primary-500)', fontSize: 'var(--text-2xl)' }}>
                {formatCurrency(Number(formData.total_amount) || 0)}
              </strong>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
              <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting || Number(formData.total_amount) <= 0}>
                {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Save Record'}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
