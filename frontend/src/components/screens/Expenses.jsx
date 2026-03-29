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
import { FiPlus, FiShoppingBag, FiTruck, FiTool, FiZap, FiMoreHorizontal, FiEdit2, FiTrash2, FiSearch, FiFilter, FiUser, FiHome, FiCreditCard, FiDollarSign } from 'react-icons/fi';

export default function Expenses() {
  const { currentTheme } = useTheme();
  const { addToast } = useAlert();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory]);

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Salary': return <FiUser />;
      case 'Utilities': return <FiZap />;
      case 'Rent': return <FiHome />;
      case 'Supplies': return <FiShoppingBag />;
      case 'Equipment': return <FiTool />;
      case 'Transport': return <FiTruck />;
      case 'Maintenance': return <FiTool />;
      default: return <FiDollarSign />;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (expense.worker_name && expense.worker_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Salary', 'Utilities', 'Rent', 'Maintenance', 'Supplies', 'Equipment', 'Transport', 'Other'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        margin: 'var(--spacing-4)',
        borderRadius: 'var(--radius-3xl)',
        overflow: 'hidden',
        background: 'var(--glass-panel)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-8) var(--spacing-8) var(--spacing-6) var(--spacing-8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: '700', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Expenses
          </h2>
          <p style={{ margin: 'var(--spacing-1) 0 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
            Track business spending and operational costs
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsFormOpen(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-2)',
            padding: 'var(--spacing-3) var(--spacing-6)',
            borderRadius: 'var(--radius-xl)',
            fontSize: 'var(--text-base)',
            fontWeight: '600'
          }}
        >
          <FiPlus size={20} /> Add Expense
        </Button>
      </div>

      {/* Controls: Search & Filter */}
      <div style={{
        padding: '0 var(--spacing-8) var(--spacing-6) var(--spacing-8)',
        display: 'flex',
        gap: 'var(--spacing-4)',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Search expenses or workers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 48px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--glass-card)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                background: filterCategory === cat ? 'var(--primary-500)' : 'var(--glass-card)',
                color: filterCategory === cat ? 'white' : 'var(--text-secondary)',
                border: '1px solid ' + (filterCategory === cat ? 'var(--primary-500)' : 'var(--glass-border)'),
                fontSize: 'var(--text-xs)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--spacing-8) var(--spacing-8) var(--spacing-8)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--spacing-12)' }}>
            <div className="spinner" style={{ marginBottom: 'var(--spacing-4)' }}></div>
            Loading expenses...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-tertiary)', 
            padding: 'var(--spacing-12)',
            background: 'var(--glass-card)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px dashed var(--glass-border)'
          }}>
            No expenses found matching your criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {/* Table Header */}
            <div style={{
              padding: 'var(--spacing-2) var(--spacing-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-4)',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-xs)',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              <div style={{ width: '40px' }}></div>
              <div style={{ width: '100px' }}>Date</div>
              <div style={{ flex: 2 }}>Title</div>
              <div style={{ flex: 1 }}>Category</div>
              <div style={{ flex: 1 }}>Worker</div>
              <div style={{ width: '120px' }}>Payment</div>
              <div style={{ width: '120px', textAlign: 'right' }}>Amount</div>
              <div style={{ width: '80px' }}></div>
            </div>

            {filteredExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                layout
                whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                onClick={() => setSelectedExpense(expense)}
                style={{
                  padding: 'var(--spacing-4) var(--spacing-6)',
                  borderRadius: 'var(--radius-2xl)',
                  background: 'var(--glass-card)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-4)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Visual Accent */}
                <div style={{
                  position: 'absolute',
                  left: 0, top: '20%', bottom: '20%',
                  width: '3px',
                  borderRadius: '0 4px 4px 0',
                  background: 'var(--primary-500)',
                  opacity: 0.6
                }}></div>

                {/* Icon */}
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '12px',
                  background: 'var(--glass-header)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-400)', fontSize: '1.2rem', flexShrink: 0
                }}>
                  {getCategoryIcon(expense.category)}
                </div>

                {/* Date */}
                <div style={{ width: '100px', fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {formatDate(expense.date)}
                </div>

                {/* Title */}
                <div style={{ flex: 2, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {expense.title}
                  </h3>
                </div>

                {/* Category */}
                <div style={{ flex: 1 }}>
                  <span style={{ 
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    fontWeight: '500'
                  }}>
                    {expense.category}
                  </span>
                </div>

                {/* Worker */}
                <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {expense.worker_name ? (
                    <>
                      <FiUser size={14} style={{ color: 'var(--primary-400)' }} />
                      {expense.worker_name}
                    </>
                  ) : (
                    <span style={{ opacity: 0.3 }}>—</span>
                  )}
                </div>

                {/* Payment */}
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  <FiCreditCard size={14} />
                  {expense.payment_method}
                </div>

                {/* Amount */}
                <div style={{ width: '120px', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>
                  {formatCurrency(expense.amount)}
                </div>
                
                {/* Actions */}
                <div style={{ width: '80px', display: 'flex', gap: 'var(--spacing-1)', justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingExpense(expense);
                    }}
                    className="icon-button"
                    style={{ color: 'var(--primary-400)' }}
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteExpense(expense.id);
                    }}
                    className="icon-button"
                    style={{ color: '#ff4d4d' }}
                  >
                    <FiTrash2 size={16} />
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
