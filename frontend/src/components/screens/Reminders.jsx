/**
 * =============================================================================
 * SMART REMINDERS SCREEN — Reminders.jsx
 * =============================================================================
 * A business assistant inside ReBill — helps shop owners manage supplier
 * payments, inventory restocking, staff salaries, daily tasks, and more.
 * =============================================================================
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
    REMINDER_CATEGORIES, PRIORITY_LEVELS, REPEAT_TYPES, SNOOZE_OPTIONS,
    generateId, loadReminders, saveReminders, formatSmartTime,
    isOverdue, isDueNow, categorizeReminders, generateMockSuggestions,
    createDefaultReminder, loadDismissedSuggestions, saveDismissedSuggestions,
    resetRecurringReminder,
} from '../../utils/reminderUtils';
import { getLocalDateString } from '../../utils/api';
import GlobalDatePicker from '../ui/GlobalDatePicker';
import GlobalTimePicker from '../ui/GlobalTimePicker';
import GlobalSelect from '../ui/GlobalSelect';
import '../../styles/Reminders.css';

// ─── Inline icon helpers ─────────────────────────────────────────────────────
const Icons = {
    bell: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
    ),
    check: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
    ),
    clock: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
    trash: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
    ),
    edit: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
    ),
    repeat: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
    ),
    x: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
    ),
    chevron: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
    ),
    sparkle: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" /></svg>
    ),
};

const TABS = [
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'completed', label: 'Completed' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Reminders() {
    const { currentTheme, isDark } = useTheme();
    const t = currentTheme;

    // ─── State ──────────────────────────────────────────────────────────────────
    const [reminders, setReminders] = useState(() => loadReminders());
    const [activeTab, setActiveTab] = useState('today');
    const [showModal, setShowModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [completingIds, setCompletingIds] = useState(new Set());
    const [toasts, setToasts] = useState([]);
    const [dismissedSuggestions, setDismissedSuggestions] = useState(() => loadDismissedSuggestions());
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [snoozeMenuId, setSnoozeMenuId] = useState(null);

    // Quick-add state
    const [quickTitle, setQuickTitle] = useState('');
    const [quickDate, setQuickDate] = useState(getLocalDateString());
    const [quickTime, setQuickTime] = useState('09:00');
    const [quickRepeat, setQuickRepeat] = useState('once');
    const [quickPriority, setQuickPriority] = useState('medium');
    const [quickCategory, setQuickCategory] = useState('custom');

    const triggeredRef = useRef(new Set());

    // ─── Persist ────────────────────────────────────────────────────────────────
    useEffect(() => { saveReminders(reminders); }, [reminders]);
    useEffect(() => { saveDismissedSuggestions(dismissedSuggestions); }, [dismissedSuggestions]);

    // ─── Notification Timer (30s) ───────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            reminders.forEach((r) => {
                if (isDueNow(r) && !triggeredRef.current.has(r.id)) {
                    triggeredRef.current.add(r.id);
                    addToast(`⏰ ${r.title}`, formatSmartTime(r.date, r.time, r.repeatType));
                    if (Notification.permission === 'granted') {
                        new Notification('ReBill Reminder', { body: r.title, icon: '/favicon.ico' });
                    }
                }
            });
        }, 30000);
        return () => clearInterval(interval);
    }, [reminders]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // ─── Actions ────────────────────────────────────────────────────────────────
    const addToast = useCallback((title, message) => {
        const id = generateId();
        setToasts((prev) => [...prev, { id, title, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
    }, []);

    const handleQuickAdd = () => {
        if (!quickTitle.trim()) return;
        const newReminder = createDefaultReminder({
            title: quickTitle.trim(),
            date: quickDate,
            time: quickTime,
            repeatType: quickRepeat,
            priority: quickPriority,
            category: quickCategory,
        });
        setReminders((prev) => [newReminder, ...prev]);
        setQuickTitle('');
        setQuickRepeat('once');
        setQuickPriority('medium');
        setQuickCategory('custom');
        addToast('✅ Reminder created', newReminder.title);
    };

    const handleComplete = (id) => {
        setCompletingIds((prev) => new Set(prev).add(id));
        setTimeout(() => {
            setReminders((prev) => prev.map((r) => {
                if (r.id !== id) return r;
                if (r.repeatType !== 'once') return resetRecurringReminder(r);
                return { ...r, status: 'completed' };
            }));
            setCompletingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
        }, 500);
    };

    const handleDelete = (id) => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
    };

    const handleSnooze = (id, minutes) => {
        const until = new Date(Date.now() + minutes * 60000).toISOString();
        setReminders((prev) => prev.map((r) => r.id === id ? { ...r, snoozeUntil: until, status: 'active' } : r));
        setSnoozeMenuId(null);
        addToast('😴 Snoozed', `Reminder snoozed for ${minutes} minutes`);
    };

    const handleConvertToRecurring = (id) => {
        setReminders((prev) => prev.map((r) => r.id === id ? { ...r, repeatType: 'weekly' } : r));
        addToast('🔄 Converted', 'Reminder is now weekly recurring');
    };

    const handleSaveModal = (reminder) => {
        if (editingReminder) {
            setReminders((prev) => prev.map((r) => r.id === reminder.id ? reminder : r));
        } else {
            setReminders((prev) => [reminder, ...prev]);
        }
        setShowModal(false);
        setEditingReminder(null);
    };

    const handleAcceptSuggestion = (preset) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const r = createDefaultReminder({ ...preset, date: tomorrow.toISOString().split('T')[0], time: '09:00' });
        setReminders((prev) => [r, ...prev]);
        addToast('✅ Suggestion accepted', r.title);
    };

    const handleDismissSuggestion = (sugId) => {
        setDismissedSuggestions((prev) => [...prev, sugId]);
    };

    // ─── Categorized Data ──────────────────────────────────────────────────────
    const categories = categorizeReminders(reminders);
    const suggestions = generateMockSuggestions(dismissedSuggestions);
    const activeCount = reminders.filter((r) => r.status === 'active').length;
    const overdueCount = reminders.filter((r) => isOverdue(r)).length;
    const completedTodayCount = reminders.filter((r) => {
        if (r.status !== 'completed') return false;
        const today = new Date().toISOString().split('T')[0];
        return r.date === today;
    }).length;

    const currentList = categories[activeTab] || [];

    // ─── Style Helpers ─────────────────────────────────────────────────────────
    const cardBg = isDark ? '#1B1D22' : '#FFFFFF';
    const cardBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e4e7ec';
    const cardShadow = isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 4px 12px rgba(16,24,40,0.06)';
    const subtleBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const hoverBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

    const getPriorityObj = (p) => PRIORITY_LEVELS.find((l) => l.id === p) || PRIORITY_LEVELS[1];
    const getCategoryObj = (c) => REMINDER_CATEGORIES.find((cat) => cat.id === c) || REMINDER_CATEGORIES[6];

    // ─── Action Button ─────────────────────────────────────────────────────────
    const ActionBtn = ({ icon, label, onClick, color, hoverColor }) => {
        const [hovered, setHovered] = useState(false);
        return (
            <button
                title={label}
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', 
                    padding: 'calc(6px * var(--display-zoom))',
                    borderRadius: 'calc(8px * var(--display-zoom))', 
                    color: hovered ? (hoverColor || '#FF6A00') : (color || t.colors.text.muted),
                    backgroundColor: hovered ? 'rgba(255,106,0,0.1)' : 'transparent',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >{icon}</button>
        );
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="reminders-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 40px' }}>

                {/* ─── Header ────────────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        marginBottom: 'calc(24px * var(--display-zoom))',
                        padding: '0 calc(4px * var(--display-zoom))'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(16px * var(--display-zoom))' }}>
                        <div className="glass-panel" style={{
                            width: 'calc(48px * var(--display-zoom))', 
                            height: 'calc(48px * var(--display-zoom))', 
                            borderRadius: 'calc(14px * var(--display-zoom))',
                            backgroundImage: 'linear-gradient(135deg, #FF6A00, #FF8A3D)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                            boxShadow: '0 8px 24px rgba(255,106,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>{Icons.bell}</div>
                        <div>
                            <h1 style={{ 
                                fontSize: 'calc(24px * var(--text-scale))', 
                                fontWeight: 800, 
                                color: t.colors.text.primary, 
                                margin: 0, 
                                letterSpacing: '-0.02em' 
                            }}>
                                Smart Reminders
                            </h1>
                            <p style={{ 
                                fontSize: 'calc(13px * var(--text-scale))', 
                                color: t.colors.text.muted, 
                                margin: 0, 
                                marginTop: 'calc(2px * var(--display-zoom))',
                                opacity: 0.8
                            }}>
                                Your intelligent business assistant
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'calc(12px * var(--display-zoom))', alignItems: 'center' }}>
                        {/* Consolidated Glass Stats Bar */}
                        <div className="glass-panel" style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: 'calc(44px * var(--display-zoom))',
                            padding: '0 calc(4px * var(--display-zoom))',
                            borderRadius: 'calc(12px * var(--display-zoom))',
                            backgroundImage: 'var(--glass-card)',
                            border: '1px solid var(--glass-border)',
                        }}>
                            {[
                                { label: 'Active', value: activeCount, color: '#FF6A00' },
                                { label: 'Overdue', value: overdueCount, color: '#f87171' },
                                { label: 'Done', value: completedTodayCount, color: '#22c55e' },
                            ].map((s, idx) => (
                                <React.Fragment key={s.label}>
                                    {idx > 0 && (
                                        <div style={{ 
                                            width: 1, 
                                            height: 'calc(16px * var(--display-zoom))', 
                                            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                            margin: '0 calc(4px * var(--display-zoom))' 
                                        }} />
                                    )}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 calc(12px * var(--display-zoom))',
                                        minWidth: 'calc(60px * var(--display-zoom))'
                                    }}>
                                        <span style={{ fontSize: 'calc(14px * var(--text-scale))', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
                                        <span style={{ fontSize: 'calc(8px * var(--text-scale))', color: t.colors.text.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.05, translateY: -2 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setEditingReminder(null); setShowModal(true); }}
                            className="lift-3d"
                            style={{
                            backgroundImage: 'linear-gradient(135deg, #FF6A00, #FF8A3D)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 'calc(12px * var(--display-zoom))', 
                            height: 'calc(44px * var(--display-zoom))',
                                padding: '0 calc(18px * var(--display-zoom))', 
                                color: '#fff', 
                                fontWeight: 700,
                                fontSize: 'calc(13px * var(--text-scale))', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'calc(8px * var(--display-zoom))',
                                boxShadow: '0 8px 20px rgba(255,106,0,0.25)',
                            }}>
                            {Icons.plus} <span>New Reminder</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* ─── Quick Add Panel ────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}
                    className="glass-panel lift-3d"
                    style={{
                        padding: 'calc(16px * var(--display-zoom)) calc(20px * var(--display-zoom))',
                        marginBottom: 'calc(24px * var(--display-zoom))',
                        borderRadius: 'calc(20px * var(--display-zoom))',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'calc(12px * var(--display-zoom))',
                        flexWrap: 'wrap'
                    }}>
                    <div style={{ flex: '1 1 calc(200px * var(--display-zoom))', minWidth: 0 }}>
                        <input
                            value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                            placeholder="Quick add a task or reminder..."
                            style={{
                                width: '100%', 
                                padding: 'calc(10px * var(--display-zoom)) calc(16px * var(--display-zoom))', 
                                borderRadius: 'calc(12px * var(--display-zoom))',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(0,0,0,0.05)',
                                color: t.colors.text.primary, 
                                fontSize: 'calc(14px * var(--text-scale))', 
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#FF6A00'; e.target.style.background = 'rgba(255,106,0,0.03)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.background = 'rgba(0,0,0,0.05)'; }}
                        />
                    </div>

                    <div style={{ width: 'calc(150px * var(--display-zoom))' }}>
                        <GlobalDatePicker value={quickDate} onChange={setQuickDate} hideLabel forceDown />
                    </div>

                    <div style={{ width: 'calc(100px * var(--display-zoom))' }}>
                        <GlobalTimePicker value={quickTime} onChange={setQuickTime} hideLabel forceDown />
                    </div>

                    <div style={{ width: 'calc(110px * var(--display-zoom))' }}>
                        <GlobalSelect
                            options={REPEAT_TYPES.map(r => ({ label: r.label, value: r.id }))}
                            value={quickRepeat}
                            onChange={setQuickRepeat}
                            hideLabel
                            direction="bottom"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'calc(4px * var(--display-zoom))', background: 'rgba(0,0,0,0.05)', padding: 'calc(3px * var(--display-zoom))', borderRadius: 'calc(10px * var(--display-zoom))', border: '1px solid var(--glass-border)' }}>
                        {PRIORITY_LEVELS.map((p) => (
                            <button key={p.id} onClick={() => setQuickPriority(p.id)}
                                style={{
                                    padding: 'calc(6px * var(--display-zoom)) calc(12px * var(--display-zoom))', 
                                    borderRadius: 'calc(8px * var(--display-zoom))', 
                                    fontSize: 'calc(11px * var(--text-scale))', 
                                    fontWeight: 700,
                                    border: 'none',
                                    background: quickPriority === p.id ? (isDark ? p.bgDark : p.bgLight) : 'transparent',
                                    color: quickPriority === p.id ? p.color : t.colors.text.muted,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em'
                                }}>{p.label}</button>
                        ))}
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleQuickAdd} 
                        disabled={!quickTitle.trim()}
                        style={{
                            height: 'calc(38px * var(--display-zoom))',
                            padding: '0 calc(18px * var(--display-zoom))', 
                            borderRadius: 'calc(10px * var(--display-zoom))', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundImage: quickTitle.trim() ? 'linear-gradient(135deg, #FF6A00, #FF8A3D)' : 'none',
                            backgroundColor: quickTitle.trim() ? 'transparent' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                            color: quickTitle.trim() ? '#fff' : t.colors.text.muted,
                            fontWeight: 700, 
                            fontSize: 'calc(13px * var(--text-scale))', 
                            cursor: quickTitle.trim() ? 'pointer' : 'not-allowed',
                            boxShadow: quickTitle.trim() ? '0 4px 12px rgba(255,106,0,0.2)' : 'none',
                            transition: 'all 0.3s',
                        }}>Save</motion.button>
                </motion.div>

                {/* ─── Smart Suggestions ──────────────────────────────────────────── */}
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}
                        style={{ marginBottom: 'calc(20px * var(--display-zoom))' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'calc(12px * var(--display-zoom))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(8px * var(--display-zoom))', color: t.colors.text.secondary, fontSize: 'calc(13.5px * var(--text-scale))', fontWeight: 700 }}>
                                <span style={{ color: '#FF6A00' }}>{Icons.sparkle}</span> Smart Suggestions
                            </div>
                            <button onClick={() => setShowSuggestions(false)}
                                style={{ 
                                    background: 'none', border: 'none', color: t.colors.text.muted, cursor: 'pointer', 
                                    fontSize: 'calc(12px * var(--text-scale))', padding: 'calc(4px * var(--display-zoom)) calc(8px * var(--display-zoom))', 
                                    borderRadius: 'calc(6px * var(--display-zoom))' 
                                }}>
                                Hide
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(calc(280px * var(--display-zoom)), 1fr))', gap: 'calc(12px * var(--display-zoom))' }}>
                            {suggestions.slice(0, 3).map((sug) => (
                                <motion.div key={sug.id} className="suggestion-card glass-panel lift-3d" 
                                    style={{
                                        position: 'relative', overflow: 'hidden', 
                                        padding: 'calc(16px * var(--display-zoom)) calc(20px * var(--display-zoom))',
                                        backgroundImage: 'var(--glass-card)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'calc(16px * var(--display-zoom))', cursor: 'default',
                                    }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'calc(12px * var(--display-zoom))' }}>
                                        <span style={{ fontSize: 'calc(20px * var(--text-scale))', flexShrink: 0 }}>{sug.icon}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 'calc(13.5px * var(--text-scale))', fontWeight: 700, color: t.colors.text.primary, marginBottom: 'calc(4px * var(--display-zoom))' }}>{sug.title}</div>
                                            <div style={{ fontSize: 'calc(12.5px * var(--text-scale))', color: t.colors.text.muted, lineHeight: 1.4, opacity: 0.8 }}>{sug.description}</div>
                                            <div style={{ display: 'flex', gap: 'calc(8px * var(--display-zoom))', marginTop: 'calc(10px * var(--display-zoom))' }}>
                                                <button onClick={() => { handleAcceptSuggestion(sug.preset); handleDismissSuggestion(sug.id); }}
                                                    style={{
                                                        padding: 'calc(5px * var(--display-zoom)) calc(14px * var(--display-zoom))', 
                                                        borderRadius: 'calc(8px * var(--display-zoom))', border: 'none', 
                                                        fontSize: 'calc(12px * var(--text-scale))',
                                                        fontWeight: 700, backgroundImage: 'linear-gradient(135deg, #FF6A00, #FF8A3D)', color: '#fff', cursor: 'pointer',
                                                        boxShadow: '0 4px 10px rgba(255,106,0,0.2)'
                                                    }}>Create</button>
                                                <button onClick={() => handleDismissSuggestion(sug.id)}
                                                    style={{
                                                        padding: 'calc(5px * var(--display-zoom)) calc(12px * var(--display-zoom))', 
                                                        borderRadius: 'calc(8px * var(--display-zoom))', border: 'none', 
                                                        fontSize: 'calc(12px * var(--text-scale))',
                                                        fontWeight: 600, background: 'rgba(0,0,0,0.05)', color: t.colors.text.muted, cursor: 'pointer',
                                                    }}>Dismiss</button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ─── Category Tabs ──────────────────────────────────────────────── */}
                <div style={{ 
                    display: 'flex', 
                    gap: 'calc(8px * var(--display-zoom))', 
                    marginBottom: 'calc(20px * var(--display-zoom))', 
                    borderBottom: '1px solid var(--glass-border)', 
                    padding: '0 calc(8px * var(--display-zoom))' 
                }}>
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const count = (categories[tab.id] || []).length;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: 'calc(12px * var(--display-zoom)) calc(20px * var(--display-zoom))', 
                                    border: 'none', 
                                    background: 'transparent', 
                                    cursor: 'pointer',
                                    fontSize: 'calc(14px * var(--text-scale))', 
                                    fontWeight: isActive ? 800 : 500,
                                    color: isActive ? '#FF6A00' : t.colors.text.muted,
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    marginBottom: '-1px',
                                }}>
                                {tab.label}
                                {count > 0 && (
                                    <span style={{
                                        marginLeft: 'calc(8px * var(--display-zoom))', 
                                        padding: 'calc(2px * var(--display-zoom)) calc(8px * var(--display-zoom))', 
                                        borderRadius: 'calc(10px * var(--display-zoom))', 
                                        fontSize: 'calc(10px * var(--text-scale))', 
                                        fontWeight: 800,
                                        background: isActive ? 'rgba(255,106,0,0.15)' : 'rgba(0,0,0,0.05)',
                                        color: isActive ? '#FF6A00' : t.colors.text.muted,
                                        transition: 'all 0.3s'
                                    }}>{count}</span>
                                )}
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 'calc(15% * var(--display-zoom))',
                                            right: 'calc(15% * var(--display-zoom))',
                                            height: '3px',
                                            backgroundImage: 'linear-gradient(90deg, #FF6A00, #FF8A3D)',
                                            borderRadius: '3px 3px 0 0',
                                            boxShadow: '0 -2px 10px rgba(255,106,0,0.4)'
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ─── Reminder List ──────────────────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <AnimatePresence mode="popLayout">
                        {currentList.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ textAlign: 'center', padding: 'calc(60px * var(--display-zoom)) calc(20px * var(--display-zoom))' }}>
                                <div className="empty-state-icon" style={{ fontSize: 'calc(48px * var(--text-scale))', marginBottom: 'calc(16px * var(--display-zoom))', opacity: 0.3 }}>
                                    {activeTab === 'completed' ? '🎉' : '🔔'}
                                </div>
                                <div style={{ fontSize: 'calc(16px * var(--text-scale))', fontWeight: 800, color: t.colors.text.secondary, marginBottom: 'calc(6px * var(--display-zoom))', opacity: 0.6 }}>
                                    {activeTab === 'completed' ? 'No completed reminders yet' : 'All clear!'}
                                </div>
                                <div style={{ fontSize: 'calc(13.5px * var(--text-scale))', color: t.colors.text.muted, opacity: 0.5 }}>
                                    {activeTab === 'completed' ? 'Complete reminders to see them here' : 'Use the quick add above to create a reminder'}
                                </div>
                            </motion.div>
                        ) : currentList.map((reminder, idx) => {
                            const priority = getPriorityObj(reminder.priority);
                            const category = getCategoryObj(reminder.category);
                            const overdue = isOverdue(reminder);
                            const completing = completingIds.has(reminder.id);
                            const isCompleted = reminder.status === 'completed';

                            return (
                                <motion.div key={reminder.id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: completing ? 0.4 : 1, y: 0, scale: completing ? 0.98 : 1 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                                    className={`glass-panel lift-3d ${completing ? 'reminder-completing' : ''}`}
                                    style={{
                                        borderRadius: 'calc(18px * var(--display-zoom))',
                                        padding: 'calc(14px * var(--display-zoom)) calc(20px * var(--display-zoom))', 
                                        border: '1px solid var(--glass-border)',
                                        backgroundImage: 'var(--glass-card)',
                                        backdropFilter: 'var(--glass-blur)',
                                        marginBottom: 'calc(4px * var(--display-zoom))',
                                        cursor: 'default', 
                                        position: 'relative',
                                        overflow: 'visible'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(16px * var(--display-zoom))', position: 'relative', zIndex: 1, width: '100%' }}>
                                        {/* Complete button */}
                                        {!isCompleted && (
                                            <button onClick={() => handleComplete(reminder.id)}
                                                style={{
                                                    width: 'calc(26px * var(--display-zoom))', 
                                                    height: 'calc(26px * var(--display-zoom))', 
                                                    borderRadius: '50%', 
                                                    flexShrink: 0,
                                                    border: `2px solid ${priority.color}`, 
                                                    background: 'transparent',
                                                    cursor: 'pointer', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
                                                    color: priority.color,
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = priority.color; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = `0 0 15px ${priority.color}40`; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = priority.color; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                {Icons.check}
                                            </button>
                                        )}
                                        {isCompleted && (
                                            <div style={{
                                                width: 'calc(26px * var(--display-zoom))', 
                                                height: 'calc(26px * var(--display-zoom))', 
                                                borderRadius: '50%', 
                                                flexShrink: 0,
                                                background: '#22c55e', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                color: '#fff',
                                                boxShadow: '0 4px 10px rgba(34,197,94,0.3)'
                                            }}>
                                                {Icons.check}
                                            </div>
                                        )}

                                        {/* Content - Simplified and Decluttered */}
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'calc(16px * var(--display-zoom))' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(12px * var(--display-zoom))', minWidth: 0 }}>
                                                <span style={{
                                                    fontSize: 'calc(15px * var(--text-scale))', 
                                                    fontWeight: 700, 
                                                    color: t.colors.text.primary,
                                                    textDecoration: isCompleted ? 'line-through' : 'none',
                                                    opacity: isCompleted ? 0.5 : 1,
                                                    letterSpacing: '-0.01em',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>{reminder.title}</span>
                                                
                                                {overdue && !isCompleted && (
                                                    <span className="reminder-overdue-badge" style={{
                                                        padding: 'calc(2px * var(--display-zoom)) calc(8px * var(--display-zoom))', 
                                                        borderRadius: 'calc(6px * var(--display-zoom))', 
                                                        fontSize: 'calc(10px * var(--text-scale))', 
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        background: 'rgba(248,113,113,0.15)', 
                                                        color: '#f87171',
                                                        letterSpacing: '0.02em',
                                                        flexShrink: 0
                                                    }}>Overdue</span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(16px * var(--display-zoom))', flexShrink: 0 }}>
                                                <span style={{ 
                                                    fontSize: 'calc(13px * var(--text-scale))', 
                                                    color: t.colors.text.muted, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 'calc(6px * var(--display-zoom))', 
                                                    opacity: 0.8,
                                                    fontWeight: 500
                                                }}>
                                                    {Icons.clock} {formatSmartTime(reminder.date, reminder.time, reminder.repeatType)}
                                                </span>
                                                <span style={{
                                                    padding: 'calc(4px * var(--display-zoom)) calc(12px * var(--display-zoom))', 
                                                    borderRadius: 'calc(10px * var(--display-zoom))', 
                                                    fontSize: 'calc(11px * var(--text-scale))', 
                                                    fontWeight: 700,
                                                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                                    color: category.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'calc(4px * var(--display-zoom))',
                                                    border: `1px solid ${category.color}20`
                                                }}>{category.icon} {category.label}</span>
                                                
                                                {reminder.repeatType !== 'once' && (
                                                    <span style={{ color: t.colors.text.muted, display: 'flex', alignItems: 'center', opacity: 0.5 }}>{Icons.repeat}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {!isCompleted && (
                                            <div style={{ display: 'flex', gap: 'calc(4px * var(--display-zoom))', alignItems: 'center', position: 'relative' }}>
                                                <ActionBtn icon={Icons.edit} label="Edit" onClick={() => { setEditingReminder(reminder); setShowModal(true); }} />
                                                <div style={{ position: 'relative' }}>
                                                    <ActionBtn icon={Icons.clock} label="Snooze" onClick={() => setSnoozeMenuId(snoozeMenuId === reminder.id ? null : reminder.id)} color="#f59e0b" />
                                                    {snoozeMenuId === reminder.id && (
                                                        <div className="snooze-menu glass-panel" style={{
                                                            position: 'absolute', top: '100%', right: 0, zIndex: 50,
                                                            backgroundImage: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: 'calc(12px * var(--display-zoom))',
                                                            padding: 'calc(6px * var(--display-zoom))', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', minWidth: 'calc(150px * var(--display-zoom))',
                                                            backdropFilter: 'var(--glass-blur)'
                                                        }}>
                                                            {SNOOZE_OPTIONS.map((opt) => (
                                                                <button key={opt.minutes} onClick={() => handleSnooze(reminder.id, opt.minutes)}
                                                                    style={{
                                                                        display: 'block', width: '100%', padding: 'calc(10px * var(--display-zoom)) calc(14px * var(--display-zoom))', borderRadius: 'calc(8px * var(--display-zoom))',
                                                                        border: 'none', background: 'transparent', color: t.colors.text.primary,
                                                                        fontSize: 'calc(13px * var(--text-scale))', cursor: 'pointer', textAlign: 'left',
                                                                        transition: 'background 0.2s',
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                >{opt.label}</button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {reminder.repeatType === 'once' && (
                                                    <ActionBtn icon={Icons.repeat} label="Make recurring" onClick={() => handleConvertToRecurring(reminder.id)} color="#0ea5e9" />
                                                )}
                                                <ActionBtn icon={Icons.trash} label="Delete" onClick={() => handleDelete(reminder.id)} color="#ef4444" />
                                            </div>
                                        )}
                                        {isCompleted && (
                                            <ActionBtn icon={Icons.trash} label="Delete" onClick={() => handleDelete(reminder.id)} color="#ef4444" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── Toast Notifications ──────────────────────────────────────────── */}
            <div style={{ position: 'fixed', bottom: 'calc(24px * var(--display-zoom))', right: 'calc(24px * var(--display-zoom))', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 'calc(8px * var(--display-zoom))' }}>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div key={toast.id}
                            initial={{ opacity: 0, x: 80, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.9 }}
                            className="glass-panel lift-3d"
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                backgroundImage: 'var(--glass-card)', 
                                border: '1px solid var(--glass-border)', 
                                borderRadius: 'calc(14px * var(--display-zoom))',
                                padding: 'calc(12px * var(--display-zoom)) calc(18px * var(--display-zoom))', 
                                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                                backdropFilter: 'var(--glass-blur)',
                                borderLeft: '4px solid #FF6A00', 
                                minWidth: 'calc(260px * var(--display-zoom))', 
                                maxWidth: 'calc(340px * var(--display-zoom))',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: 'calc(14px * var(--text-scale))', fontWeight: 800, color: t.colors.text.primary, letterSpacing: '-0.01em' }}>{toast.title}</div>
                                {toast.message && <div style={{ fontSize: 'calc(12.5px * var(--text-scale))', color: t.colors.text.muted, marginTop: '2px', opacity: 0.8 }}>{toast.message}</div>}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* ─── Create / Edit Modal ──────────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <ReminderModal
                        isDark={isDark} theme={t} cardBg={cardBg} cardBorder={cardBorder} subtleBg={subtleBg}
                        reminder={editingReminder}
                        onSave={handleSaveModal}
                        onClose={() => { setShowModal(false); setEditingReminder(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ReminderModal({ isDark, theme: t, cardBg, cardBorder, subtleBg, reminder, onSave, onClose }) {
    const isEditing = !!reminder;
    const [form, setForm] = useState(() => {
        if (reminder) return { ...reminder };
        return createDefaultReminder();
    });

    const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const inputStyle = {
        width: '100%', 
        padding: 'calc(10px * var(--display-zoom)) calc(14px * var(--display-zoom))', 
        borderRadius: 'calc(12px * var(--display-zoom))',
        border: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.05)',
        color: t.colors.text.primary, 
        fontSize: 'calc(14px * var(--text-scale))', 
        outline: 'none',
        transition: 'all 0.2s',
    };

    const labelStyle = { 
        fontSize: 'calc(12.5px * var(--text-scale))', 
        fontWeight: 700, 
        color: t.colors.text.secondary, 
        marginBottom: 'calc(6px * var(--display-zoom))', 
        display: 'block',
        opacity: 0.9
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
            <motion.div
                initial={{ opacity: 0, scale: 0.92, rotateX: 10, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, rotateX: 0, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.92, rotateX: 10, x: "-50%", y: "-50%" }}
                className="glass-panel"
                style={{
                    position: 'fixed', top: '50%', left: '50%',
                    zIndex: 1001, width: '90%', maxWidth: 'calc(540px * var(--display-zoom))', 
                    maxHeight: '85vh', overflowY: 'auto',
                    backgroundImage: 'var(--glass-card)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: 'calc(24px * var(--display-zoom))',
                    padding: 'calc(32px * var(--display-zoom))', 
                    boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                    backdropFilter: 'var(--glass-blur)',
                    perspective: '1200px'
                }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'calc(28px * var(--display-zoom))' }}>
                    <h2 style={{ fontSize: 'calc(20px * var(--text-scale))', fontWeight: 800, color: t.colors.text.primary, margin: 0, letterSpacing: '-0.01em' }}>
                        {isEditing ? 'Edit Reminder' : 'New Reminder'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.colors.text.muted, padding: 'calc(4px * var(--display-zoom))' }}>{Icons.x}</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Title */}
                    <div>
                        <label style={labelStyle}>Title *</label>
                        <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Restock Coca Cola" style={inputStyle} />
                    </div>
                    {/* Description */}
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={2}
                            placeholder="Optional notes..." style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} />
                    </div>
                    {/* Date + Time */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <GlobalDatePicker
                                label="Date"
                                value={form.date}
                                onChange={(val) => update('date', val)}
                                forceDown
                            />
                        </div>
                        <div>
                            <GlobalTimePicker
                                label="Time"
                                value={form.time}
                                onChange={(val) => update('time', val)}
                                forceDown
                            />
                        </div>
                    </div>
                    {/* Repeat Type */}
                    <div>
                        <GlobalSelect
                            label="Repeat"
                            options={REPEAT_TYPES.map(rt => ({ label: rt.label, value: rt.id }))}
                            value={form.repeatType}
                            onChange={(val) => update('repeatType', val)}
                            direction="bottom"
                        />
                    </div>
                    {/* Priority */}
                    <div>
                        <label style={labelStyle}>Priority</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {PRIORITY_LEVELS.map((p) => (
                                <button key={p.id} onClick={() => update('priority', p.id)}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600,
                                        border: form.priority === p.id ? `2px solid ${p.color}` : '2px solid transparent',
                                        background: form.priority === p.id ? (isDark ? p.bgDark : p.bgLight) : subtleBg,
                                        color: form.priority === p.id ? p.color : t.colors.text.muted,
                                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                                    }}>{p.label}</button>
                            ))}
                        </div>
                    </div>
                    {/* Category */}
                    <div>
                        <label style={labelStyle}>Category</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {REMINDER_CATEGORIES.map((cat) => (
                                <button key={cat.id} onClick={() => update('category', cat.id)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 500,
                                        border: form.category === cat.id ? `1.5px solid ${cat.color}` : `1.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e4e7ec'}`,
                                        background: form.category === cat.id ? `${cat.color}15` : 'transparent',
                                        color: form.category === cat.id ? cat.color : t.colors.text.muted,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}>{cat.icon} {cat.label}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'calc(12px * var(--display-zoom))', justifyContent: 'flex-end', marginTop: 'calc(28px * var(--display-zoom))' }}>
                    <button onClick={onClose}
                        style={{
                            padding: 'calc(10px * var(--display-zoom)) calc(20px * var(--display-zoom))', 
                            borderRadius: 'calc(12px * var(--display-zoom))', 
                            border: '1px solid var(--glass-border)', 
                            background: 'transparent',
                            color: t.colors.text.secondary, fontWeight: 600, fontSize: 'calc(14px * var(--text-scale))', cursor: 'pointer',
                        }}>Cancel</button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => { if (form.title.trim()) onSave(form); }}
                        disabled={!form.title.trim()}
                        style={{
                            padding: 'calc(10px * var(--display-zoom)) calc(24px * var(--display-zoom))', 
                            borderRadius: 'calc(12px * var(--display-zoom))', 
                            border: 'none',
                            backgroundImage: form.title.trim() ? 'linear-gradient(135deg, #FF6A00, #FF8A3D)' : 'none',
                            backgroundColor: form.title.trim() ? 'transparent' : 'rgba(0,0,0,0.1)',
                            color: form.title.trim() ? '#fff' : t.colors.text.muted,
                            fontWeight: 700, fontSize: 'calc(14px * var(--text-scale))', cursor: form.title.trim() ? 'pointer' : 'not-allowed',
                            boxShadow: form.title.trim() ? '0 8px 16px rgba(255,106,0,0.2)' : 'none',
                        }}>{isEditing ? 'Save Changes' : 'Create'}</motion.button>
                </div>
            </motion.div>
        </>
    );
}
