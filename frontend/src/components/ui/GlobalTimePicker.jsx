import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/global.css';

// Icons
const ClockIcon = ({ size = 16, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const ChevronDown = ({ size = 16, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const GlobalTimePicker = ({
    label,
    value, // Expected in "HH:MM" 24-hour format
    onChange,
    placeholder = 'Select time',
    disabled = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

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

    // Internal state for 12-hour format
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('AM');

    // Sync internal state with external value
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            let hourInt = parseInt(h);
            const minuteStr = m;

            let p = 'AM';
            if (hourInt >= 12) {
                p = 'PM';
                if (hourInt > 12) hourInt -= 12;
            }
            if (hourInt === 0) hourInt = 12;

            setHour(String(hourInt).padStart(2, '0'));
            setMinute(minuteStr);
            setPeriod(p);
        }
    }, [value]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelection = (type, val) => {
        let newHour = hour;
        let newMinute = minute;
        let newPeriod = period;

        if (type === 'hour') newHour = val;
        if (type === 'minute') newMinute = val;
        if (type === 'period') newPeriod = val;

        // Update internal state immediately for UI response
        setHour(newHour);
        setMinute(newMinute);
        setPeriod(newPeriod);

        // Convert to 24-hour format for parent
        let h = parseInt(newHour);
        if (newPeriod === 'PM' && h !== 12) h += 12;
        if (newPeriod === 'AM' && h === 12) h = 0;

        const timeStr = `${String(h).padStart(2, '0')}:${newMinute}`;
        onChange(timeStr);
    };

    // Generate arrays
    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    const getDisplayValue = () => {
        if (!value) return placeholder;
        return `${hour}:${minute} ${period}`;
    };

    return (
        <div
            className={`global-timepicker-container ${className}`}
            ref={containerRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
                position: 'relative' // Ensure z-index context
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
                        <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}><ClockIcon /></span>
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
                                id={`timepicker-dropdown-${label || 'global'}`}
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
                                    padding: '12px',
                                    display: 'flex',
                                    gap: '8px',
                                    height: '240px', // Fixed height for scrolling
                                    minWidth: '220px'
                                }}
                                className="glass-panel"
                            >
                                {/* Hours Column */}
                                <div className="time-column" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'none' }}>
                                    <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', position: 'sticky', top: 0, background: 'var(--surface-primary)', padding: '4px 0', zIndex: 1 }}>HR</div>
                                    {hours.map(h => (
                                        <button
                                            key={h}
                                            onClick={(e) => { e.stopPropagation(); handleSelection('hour', h); }}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: hour === h ? 'var(--primary-500)' : 'transparent',
                                                color: hour === h ? '#fff' : 'var(--text-primary)',
                                                fontSize: '14px',
                                                fontWeight: hour === h ? 600 : 400,
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                            onMouseEnter={(e) => { if (hour !== h) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                            onMouseLeave={(e) => { if (hour !== h) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>

                                {/* Separator */}
                                <div style={{ width: '1px', background: 'var(--border-primary)', marginTop: '24px', marginBottom: '8px' }}></div>

                                {/* Minutes Column */}
                                <div className="time-column" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'none' }}>
                                    <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', position: 'sticky', top: 0, background: 'var(--surface-primary)', padding: '4px 0', zIndex: 1 }}>MIN</div>
                                    {minutes.map(m => (
                                        <button
                                            key={m}
                                            onClick={(e) => { e.stopPropagation(); handleSelection('minute', m); }}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: minute === m ? 'var(--primary-500)' : 'transparent',
                                                color: minute === m ? '#fff' : 'var(--text-primary)',
                                                fontSize: '14px',
                                                fontWeight: minute === m ? 600 : 400,
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                            onMouseEnter={(e) => { if (minute !== m) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                            onMouseLeave={(e) => { if (minute !== m) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>

                                {/* Separator */}
                                <div style={{ width: '1px', background: 'var(--border-primary)', marginTop: '24px', marginBottom: '8px' }}></div>

                                {/* Period Column */}
                                <div className="time-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px' }}>AM/PM</div>
                                    {['AM', 'PM'].map(p => (
                                        <button
                                            key={p}
                                            onClick={(e) => { e.stopPropagation(); handleSelection('period', p); }}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: period === p ? 'var(--primary-500)' : 'transparent',
                                                color: period === p ? '#fff' : 'var(--text-primary)',
                                                fontSize: '14px',
                                                fontWeight: period === p ? 600 : 400,
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => { if (period !== p) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                            onMouseLeave={(e) => { if (period !== p) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
            <style>{`
                .time-column::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default GlobalTimePicker;
