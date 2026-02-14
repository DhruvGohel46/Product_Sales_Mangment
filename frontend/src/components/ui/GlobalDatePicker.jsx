import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/global.css';

// Icons
const CalendarIcon = ({ size = 16, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const ChevronDown = ({ size = 16, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const ChevronLeft = ({ size = 16, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRight = ({ size = 16, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const GlobalDatePicker = ({
    label,
    value,
    onChange,
    type = 'date', // 'date' | 'month'
    placeholder = 'Select date',
    disabled = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    // Internal state for navigation (which month/year is currently visible)
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setViewDate(d);
            }
        }
    }, [value, isOpen]); // Reset view when opening

    // Update position when opening
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const updatePosition = () => {
                const rect = containerRef.current.getBoundingClientRect();
                setDropdownPos({
                    top: rect.top + window.scrollY - 8, // Align with top of input, -8px gap
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            };

            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        }
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                // Check portal
                const dropdown = document.getElementById(`datepicker-dropdown-${label || 'global'}`);
                if (dropdown && dropdown.contains(event.target)) return;
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, label]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        // 0 = Sunday, 1 = Monday...
        // We want Monday to be first if possible, but standard calendar usually starts Sun
        // Let's stick to standard Sunday start for simplicity or Monday if preferred.
        // Let's do Standard Sunday start.
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format YYYY-MM-DD using local time part logic manually to avoid UTC shifts
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        onChange(dateStr);
        setIsOpen(false);
    };

    const handleMonthClick = (monthIndex) => {
        const year = viewDate.getFullYear();
        const month = String(monthIndex + 1).padStart(2, '0');
        const monthStr = `${year}-${month}`;

        onChange(monthStr);
        setIsOpen(false);
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(viewDate.getMonth() + direction);
        setViewDate(newDate);
    };

    const navigateYear = (direction) => {
        const newDate = new Date(viewDate);
        newDate.setFullYear(viewDate.getFullYear() + direction);
        setViewDate(newDate);
    };

    // Render Logic
    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ width: '32px', height: '32px' }}></div>);
        }

        const currentDate = new Date();
        const isToday = (d) =>
            d === currentDate.getDate() &&
            month === currentDate.getMonth() &&
            year === currentDate.getFullYear();

        const isSelected = (d) => {
            if (!value || type !== 'date') return false;
            const sel = new Date(value);
            return d === sel.getDate() && month === sel.getMonth() && year === sel.getFullYear();
        };

        for (let d = 1; d <= daysInMonth; d++) {
            const selected = isSelected(d);
            const today = isToday(d);

            days.push(
                <button
                    key={d}
                    onClick={(e) => { e.stopPropagation(); handleDateClick(d); }}
                    style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        border: 'none',
                        background: selected ? 'var(--primary-500)' : (today ? 'var(--bg-tertiary)' : 'transparent'),
                        color: selected ? '#fff' : 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: selected || today ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.1s'
                    }}
                    onMouseEnter={(e) => {
                        if (!selected) e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                        if (!selected) e.currentTarget.style.background = today ? 'var(--bg-tertiary)' : 'transparent';
                    }}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    // Display formatted value
    const getDisplayValue = () => {
        if (!value) return placeholder;
        if (type === 'month') {
            if (typeof value !== 'string') return placeholder; // Safety check
            const parts = value.split('-');
            if (parts.length !== 2) return placeholder;
            const [y, m] = parts;
            const date = new Date(parseInt(y), parseInt(m) - 1);
            return date.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) return placeholder;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div
            className={`global-datepicker-container ${className}`}
            ref={containerRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%', // Respect container width or class override
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? 'none' : 'auto'
            }}
        >
            {label && (
                <label style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginLeft: '2px'
                }}>
                    {label}
                </label>
            )}

            <div style={{ position: 'relative', width: '100%' }}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 12px',
                        borderRadius: '10px',
                        border: isOpen ? '1px solid var(--primary-500)' : '1px solid var(--border-primary)',
                        background: 'var(--bg-secondary)',
                        color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isOpen ? '0 0 0 3px rgba(var(--primary-rgb), 0.1)' : 'none',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}><CalendarIcon /></span>
                        <span style={{ whiteSpace: 'nowrap' }}>{getDisplayValue()}</span>
                    </div>

                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)' }}
                    >
                        <ChevronDown size={16} />
                    </motion.div>
                </button>

                {createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                id={`datepicker-dropdown-${label || 'global'}`}
                                initial={{ opacity: 0, y: "-95%", scale: 0.98 }}
                                animate={{ opacity: 1, y: "-100%", scale: 1 }}
                                exit={{ opacity: 0, y: "-95%", scale: 0.98 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                style={{
                                    position: 'absolute',
                                    top: dropdownPos.top,
                                    left: dropdownPos.left,
                                    width: dropdownPos.width,
                                    zIndex: 99999,
                                    transformOrigin: 'bottom center',
                                    background: 'var(--surface-primary)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: '12px',
                                    boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.15), 0 -8px 10px -6px rgba(0, 0, 0, 0.1)',
                                    padding: '16px',
                                    minWidth: '280px'
                                }}
                                className="glass-panel"
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); type === 'date' ? navigateMonth(-1) : navigateYear(-1); }}
                                        style={{ background: 'transparent', border: 'none', padding: '4px', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <ChevronLeft />
                                    </button>

                                    <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                                        {type === 'date'
                                            ? viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                                            : viewDate.getFullYear()
                                        }
                                    </span>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); type === 'date' ? navigateMonth(1) : navigateYear(1); }}
                                        style={{ background: 'transparent', border: 'none', padding: '4px', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <ChevronRight />
                                    </button>
                                </div>

                                {type === 'date' ? (
                                    <>
                                        {/* Weekdays */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{d}</div>
                                            ))}
                                        </div>
                                        {/* Days */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                            {renderCalendar()}
                                        </div>
                                    </>
                                ) : (
                                    /* Month Selection Grid */
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {months.map((m, idx) => {
                                            const isSelected = typeof value === 'string' && value === `${viewDate.getFullYear()}-${String(idx + 1).padStart(2, '0')}`;
                                            return (
                                                <button
                                                    key={m}
                                                    onClick={(e) => { e.stopPropagation(); handleMonthClick(idx); }}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: isSelected ? 'var(--primary-500)' : 'transparent',
                                                        color: isSelected ? '#fff' : 'var(--text-primary)',
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        fontWeight: isSelected ? 600 : 400
                                                    }}
                                                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    {m.slice(0, 3)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default GlobalDatePicker;
