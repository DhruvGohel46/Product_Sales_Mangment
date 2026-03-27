import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/api';
import { FiX, FiCalendar, FiClock, FiCreditCard, FiAlignLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function ExpenseDetailsModal({ expense, onClose, onEdit, onDelete }) {
  if (!expense) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(1px)',
      WebkitBackdropFilter: 'blur(1px)', padding: 'var(--spacing-4)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              {expense.supplier_name || (expense.items && expense.items[0]?.product_id) || 'Expense Record'}
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
              {expense.category}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '1.25rem', padding: 'var(--spacing-2)'
          }}>
            <FiX />
          </button>
        </div>

        <div style={{ padding: 'var(--spacing-6)', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <div style={{ color: 'var(--text-tertiary)' }}><FiCalendar /></div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Date</div>
                <div style={{ color: 'var(--text-primary)' }}>{formatDate(expense.expense_date)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <div style={{ color: 'var(--text-tertiary)' }}><FiCreditCard /></div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Payment Method</div>
                <div style={{ color: 'var(--text-primary)' }}>{expense.payment_method}</div>
              </div>
            </div>
          </div>

          {expense.notes && (
            <div style={{ 
              marginBottom: 'var(--spacing-6)', 
              padding: 'var(--spacing-4)',
              background: 'var(--glass-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>Notes</div>
              <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{expense.notes}</div>
            </div>
          )}

          <h3 style={{ margin: '0 0 var(--spacing-4) 0', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
            Expense Details
          </h3>

          {!expense.items || expense.items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 'var(--spacing-4)' }}>
              No item details recorded for this expense.
            </div>
          ) : (
            <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--glass-header)', borderBottom: '1px solid var(--glass-border)' }}>
                  <tr>
                    <th style={{ padding: 'var(--spacing-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Product / Service</th>
                    <th style={{ padding: 'var(--spacing-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Qty</th>
                    <th style={{ padding: 'var(--spacing-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expense.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < expense.items.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                      <td style={{ padding: 'var(--spacing-3)', color: 'var(--text-primary)' }}>
                        {item.name || item.product_id || `Item #${i+1}`}
                      </td>
                      <td style={{ padding: 'var(--spacing-3)', color: 'var(--text-primary)' }}>{item.quantity}</td>
                      <td style={{ padding: 'var(--spacing-3)', color: 'var(--text-primary)', textAlign: 'right' }}>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        <div style={{
          padding: 'var(--spacing-5) var(--spacing-6)',
          borderTop: '1px solid var(--glass-border)',
          background: 'var(--glass-header)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button 
              variant="ghost" 
              onClick={onEdit}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--primary-500)' }}
            >
              <FiEdit2 size={16} /> Edit
            </Button>
            <Button 
              variant="ghost" 
              onClick={onDelete}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: '#ef4444' }}
            >
              <FiTrash2 size={16} /> Delete
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Grand Total</span>
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--primary-500)' }}>
              {formatCurrency(expense.total_amount)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
