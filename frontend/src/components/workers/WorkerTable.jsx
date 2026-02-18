import React from 'react';
import { motion } from 'framer-motion';
import { IoEye, IoPencil, IoTrash } from 'react-icons/io5';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/api';
import Button from '../ui/Button';

const WorkerRow = ({ worker, onView, onEdit, onDelete }) => {
    const { currentTheme, isDark } = useTheme();

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            layout
            // Row Hover Interaction
            whileHover={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                x: 2, // Subtle slide
                transition: { duration: 0.2, ease: "easeOut" }
            }}
            transition={{ duration: 0.1 }}
            style={{
                borderBottom: `1px solid ${isDark ? '#27272A' : '#E5E7EB'}`,
                cursor: 'pointer',
                position: 'relative' // relative is fine on tr in modern browsers for z-index context usually, but box-shadow is safest
            }}
        >

            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Avatar with Micro-interaction */}
                    <motion.div
                        variants={{
                            hover: { scale: 1.06 }
                        }}
                        transition={{ duration: 0.15 }}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            // Premium Avatar Gradients
                            background: isDark
                                ? 'linear-gradient(145deg, #27272A, #18181B)'
                                : 'linear-gradient(145deg, #F3F4F6, #E5E7EB)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#F97316',
                            fontWeight: 600,
                            fontSize: '14px',
                            flexShrink: 0,
                            boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.4)' : 'inset 0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        {worker.photo ? (
                            <img src={worker.photo} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            (worker.name || '?').charAt(0).toUpperCase()
                        )}
                    </motion.div>
                    <div>
                        <div style={{ fontWeight: 500, color: isDark ? '#FAFAFA' : '#111827', fontSize: '14px' }}>
                            {worker.name}
                        </div>
                        {worker.phone && (
                            <div style={{ fontSize: '12px', color: isDark ? '#71717A' : '#6B7280', marginTop: '2px' }}>
                                {worker.phone}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            <td style={{ padding: '16px', color: isDark ? '#A1A1AA' : '#4B5563', fontSize: '13px' }}>
                {worker.role}
            </td>
            <td style={{ padding: '16px' }}>
                <span style={{ color: isDark ? '#FAFAFA' : '#111827', fontWeight: 600, fontSize: '14px' }}>
                    {formatCurrency(worker.salary)}
                </span>
                <span style={{ fontSize: '12px', color: isDark ? '#71717A' : '#6B7280', marginLeft: '4px' }}>/mo</span>
            </td>
            <td style={{ padding: '16px', color: '#EF4444', fontWeight: 500, fontSize: '13px' }}>
                {worker.current_advance > 0 ? (
                    <span style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                        {formatCurrency(worker.current_advance)}
                    </span>
                ) : (
                    <span style={{ color: '#52525B' }}>-</span>
                )}
            </td>

            <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <ActionButton
                        onClick={() => onView(worker)}
                        icon={<IoEye size={16} />}
                        label="View"
                        color={isDark ? "#A1A1AA" : "#6B7280"}
                        hoverColor="#F97316"
                        hoverBg="rgba(249,115,22,0.12)"
                    />
                    <ActionButton
                        onClick={() => onEdit(worker)}
                        icon={<IoPencil size={16} />}
                        label="Edit"
                        color={isDark ? "#A1A1AA" : "#6B7280"}
                        hoverColor="#3B82F6"
                        hoverBg="rgba(59,130,246,0.12)"
                    />
                    <ActionButton
                        onClick={() => onDelete(worker)}
                        icon={<IoTrash size={16} />}
                        label="Delete"
                        color={isDark ? "#A1A1AA" : "#6B7280"}
                        hoverColor="#EF4444"
                        hoverBg="rgba(239,68,68,0.12)"
                    />
                </div>
            </td>
        </motion.tr>
    );
};

// Helper for Action Buttons
const ActionButton = ({ onClick, icon, label, color, hoverColor, hoverBg }) => (
    <motion.button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        whileHover={{
            scale: 1, // No scale up, just color/bg change as per premium feel (or subtle lift?) Request said "Main buttons press on click". Action buttons: Hover: rgba(239,68,68,0.2)
            backgroundColor: hoverBg || 'rgba(255,255,255,0.05)',
            color: hoverColor
        }}
        whileTap={{ scale: 0.96 }} // Request: Press: Scale: 0.96
        style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '8px', // Slightly softer
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'color 0.2s',
            fontSize: '13px',
            fontWeight: 500
        }}
    >
        {icon}
        {label}
    </motion.button>
);

const WorkerTable = ({ workers, onView, onEdit, onDelete }) => {
    const { currentTheme, isDark } = useTheme();

    return (
        <div style={{
            background: 'transparent',
            borderRadius: '0px',
            border: 'none',
            overflow: 'visible',
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{
                    background: 'transparent',
                    borderBottom: `1px solid ${isDark ? '#27272A' : '#E5E7EB'}`
                }}>
                    <tr>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: currentTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worker</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: currentTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: currentTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salary</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: currentTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advance</th>
                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: currentTheme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {workers.map(worker => (
                        <WorkerRow
                            key={worker.worker_id}
                            worker={worker}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkerTable;
