import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { expensesAPI } from '../../api/expenses';
import { formatCurrency } from '../../utils/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ExpenseFormModal from '../expenses/ExpenseFormModal';
import ExpenseDetailsModal from '../expenses/ExpenseDetailsModal';
import { FiPlus, FiShoppingBag, FiTruck, FiTool, FiZap, FiMoreHorizontal, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function Expenses() {
  const { currentTheme } = useTheme();
  const { addToast } = useAlert();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expensesAPI.getExpenses();
      if (res.success) {
        setExpenses(res.expenses);
      } else {
        addToast({ type: 'error', title: 'Failed to load expenses' });
      }
    } catch (e) {
      addToast({ type: 'error', title: 'Error fetching expenses' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (expenseData) => {
    try {
      const res = await expensesAPI.createExpense(expenseData);
      if (res.success) {
        addToast({ type: 'success', title: 'Expense recorded successfully' });
        setIsFormOpen(false);
        fetchExpenses();
      } else {
        addToast({ type: 'error', title: res.message || 'Error recording expense' });
      }
    } catch (e) {
      addToast({ type: 'error', title: 'Error recording expense' });
    }
  };

  const handleUpdateExpense = async (expenseData) => {
    try {
      const res = await expensesAPI.updateExpense(editingExpense.id, expenseData);
      if (res.success) {
        addToast({ type: 'success', title: 'Expense updated successfully' });
        setEditingExpense(null);
        fetchExpenses();
      } else {
        addToast({ type: 'error', title: res.message || 'Error updating expense' });
      }
    } catch (e) {
      addToast({ type: 'error', title: 'Error updating expense' });
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await expensesAPI.deleteExpense(expenseId);
      if (res.success) {
        addToast({ type: 'success', title: 'Expense deleted' });
        fetchExpenses();
      } else {
        addToast({ type: 'error', title: res.message || 'Error deleting expense' });
      }
    } catch (e) {
      addToast({ type: 'error', title: 'Error deleting expense' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Inventory Purchase': return <FiShoppingBag />;
      case 'Supplier Payment': return <FiTruck />;
      case 'Equipment': return <FiTool />;
      case 'Utility Bill': return <FiZap />;
      default: return <FiMoreHorizontal />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        margin: 'var(--spacing-4)',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        background: 'var(--glass-panel)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-6)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>
            Expenses & Purchases
          </h2>
          <p style={{ margin: 'var(--spacing-1) 0 0 0', color: 'var(--text-secondary)' }}>
            Record inventory purchases and business expenses
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsFormOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
        >
          <FiPlus /> Record Expense
        </Button>
      </div>

      {/* Expenses List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-6)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--spacing-8)' }}>
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 'var(--spacing-8)' }}>
            No expenses recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {/* List Header */}
            <div style={{
              padding: '0 var(--spacing-4) var(--spacing-2) var(--spacing-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-4)',
              borderBottom: '1px solid var(--glass-border)',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <div style={{ width: '36px', flexShrink: 0 }}></div> {/* Icon spacer */}
              <div style={{ flex: 2, minWidth: '150px' }}>Product / Service</div>
              <div style={{ flex: 1, minWidth: '120px' }}>Category</div>
              <div style={{ width: '100px', textAlign: 'center' }}>Date</div>
              <div style={{ width: '110px', textAlign: 'right' }}>Amount</div>
              <div style={{ width: '90px', textAlign: 'center' }}>Payment</div>
              <div style={{ width: '80px', textAlign: 'right' }}>Actions</div>
            </div>

            {expenses.map((expense) => (
              <motion.div
                key={expense.id}
                whileHover={{ scale: 1.005 }}
                onClick={() => setSelectedExpense(expense)}
                style={{
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--glass-card)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-4)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                {/* Icon Column */}
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--glass-header)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-500)', fontSize: '1.2rem', flexShrink: 0
                }}>
                  {getCategoryIcon(expense.category)}
                </div>

                {/* Name Column */}
                <div style={{ flex: 2, minWidth: '150px' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {expense.supplier_name || (expense.items && expense.items[0]?.product_id) || expense.category}
                  </h3>
                </div>

                {/* Category Column */}
                <div style={{ flex: 1, minWidth: '120px', color: 'var(--text-secondary)' }}>
                  {expense.category}
                </div>

                {/* Date Column */}
                <div style={{ width: '100px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {formatDate(expense.expense_date)}
                </div>

                {/* Amount Column */}
                <div style={{ width: '110px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {formatCurrency(expense.total_amount)}
                </div>

                {/* Payment Column */}
                <div style={{ width: '90px', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--glass-border)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                  }}>
                    {expense.payment_method}
                  </span>
                </div>
                
                {/* Actions Column */}
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', width: '80px', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingExpense(expense);
                    }}
                    style={{
                      background: 'none', border: 'none',
                      padding: '4px', borderRadius: '4px',
                      color: 'var(--primary-500)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteExpense(expense.id);
                    }}
                    style={{
                      background: 'none', border: 'none',
                      padding: '4px', borderRadius: '4px',
                      color: '#ef4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {(isFormOpen || editingExpense) && (
        <ExpenseFormModal 
          initialData={editingExpense}
          onClose={() => {
            setIsFormOpen(false);
            setEditingExpense(null);
          }} 
          onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense} 
        />
      )}

      {selectedExpense && (
        <ExpenseDetailsModal 
          expense={selectedExpense} 
          onClose={() => setSelectedExpense(null)} 
          onEdit={() => {
            setEditingExpense(selectedExpense);
            setSelectedExpense(null);
          }}
          onDelete={() => {
            handleDeleteExpense(selectedExpense.id);
            setSelectedExpense(null);
          }}
        />
      )}
    </motion.div>
  );
}
