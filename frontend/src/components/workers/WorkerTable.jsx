/**
 * WorkerTable — Premium worker list with card-style rows
 * Each row is a hoverable card with avatar, metadata, and contextual actions
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoEye, IoPencil, IoTrash, IoEllipsisVertical, IoCall, IoBriefcase, IoCash } from 'react-icons/io5';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/api';

/* ─── Action Menu ─── */
const ActionMenu = ({ worker, onView, onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const { isDark } = useTheme();

    return (
        <div style={{ position: 'relative' }}>
            <motion.button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                whileTap={{ scale: 0.92 }}
                style={{
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderRadius: 8,
                    color: isDark ? '#71717A' : '#9CA3AF',
                }}
            >
                <IoEllipsisVertical size={16} />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Invisible backdrop to close menu */}
                        <div
                            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            style={{
                                position: 'absolute', right: 0, top: '100%', marginTop: 4,
                                zIndex: 100,
                                minWidth: 140,
                                background: isDark ? '#1E1E22' : '#FFFFFF',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                borderRadius: 10,
                                boxShadow: isDark
                                    ? '0 8px 24px rgba(0,0,0,0.5)'
                                    : '0 8px 24px rgba(0,0,0,0.1)',
                                padding: 4,
                                overflow: 'hidden',
                            }}
                        >
                            <MenuItem icon={IoEye} label="View Profile" onClick={() => { onView(worker); setOpen(false); }} color="#F97316" />
                            <MenuItem icon={IoPencil} label="Edit" onClick={() => { onEdit(worker); setOpen(false); }} color="#3B82F6" />
                            <div style={{
                                height: 1, margin: '4px 8px',
                                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                            }} />
                            <MenuItem icon={IoTrash} label="Delete" onClick={() => { onDelete(worker); setOpen(false); }} color="#EF4444" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, onClick, color }) => {
    const { isDark } = useTheme();
    return (
        <motion.button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', border: 'none', background: 'transparent',
                cursor: 'pointer', borderRadius: 6,
                fontSize: 13, fontWeight: 500,
                color: isDark ? '#D4D4D8' : '#374151',
            }}
        >
            <Icon size={14} style={{ color, flexShrink: 0 }} />
            <span>{label}</span>
        </motion.button>
    );
};

/* ─── Worker Row ─── */
const WorkerRow = ({ worker, onView, onEdit, onDelete, index }) => {
    const { isDark } = useTheme();

    const statusColor = worker.status === 'active' ? '#10B981' : '#71717A';
    const hasAdvance = worker.current_advance > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={() => onView(worker)}
            whileHover={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.015)',
                transition: { duration: 0.15 }
            }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                transition: 'background-color 0.15s',
            }}
        >
            {/* Avatar */}
            <div style={{
                width: 42, height: 42, borderRadius: 12,
                overflow: 'hidden', flexShrink: 0,
                background: isDark
                    ? 'linear-gradient(145deg, #27272A, #1C1C1F)'
                    : 'linear-gradient(145deg, #F9FAFB, #F0F1F3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#F97316', fontWeight: 600, fontSize: 15,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}>
                {worker.photo ? (
                    <img src={worker.photo} alt={worker.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    (worker.name || '?').charAt(0).toUpperCase()
                )}
            </div>

            {/* Name + Phone */}
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <span style={{
                        fontSize: 14, fontWeight: 600,
                        color: isDark ? '#FAFAFA' : '#111827',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {worker.name}
                    </span>
                    {/* Status dot */}
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: statusColor, flexShrink: 0,
                        boxShadow: worker.status === 'active' ? '0 0 6px rgba(16,185,129,0.4)' : 'none',
                    }} />
                </div>
                {worker.phone && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, color: isDark ? '#52525B' : '#9CA3AF',
                        marginTop: 2,
                    }}>
                        <IoCall size={10} />
                        {worker.phone}
                    </div>
                )}
            </div>

            {/* Role */}
            <div style={{
                flex: '0 1 120px', minWidth: 0,
                display: 'flex', alignItems: 'center', gap: 6,
            }}>
                <div style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    fontSize: 12, fontWeight: 500,
                    color: isDark ? '#A1A1AA' : '#6B7280',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <IoBriefcase size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
                    {worker.role}
                </div>
            </div>

            {/* Salary */}
            <div style={{
                flex: '0 1 130px', minWidth: 0,
                textAlign: 'right',
            }}>
                <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: isDark ? '#FAFAFA' : '#111827',
                    fontVariantNumeric: 'tabular-nums',
                }}>
                    {formatCurrency(worker.salary)}
                </span>
                <span style={{
                    fontSize: 11, color: isDark ? '#52525B' : '#9CA3AF',
                    marginLeft: 2,
                }}>/mo</span>
            </div>

            {/* Advance */}
            <div style={{
                flex: '0 1 100px', minWidth: 0,
                textAlign: 'right',
            }}>
                {hasAdvance ? (
                    <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: '#EF4444',
                        fontVariantNumeric: 'tabular-nums',
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(239,68,68,0.08)',
                    }}>
                        {formatCurrency(worker.current_advance)}
                    </span>
                ) : (
                    <span style={{
                        fontSize: 12,
                        color: isDark ? '#3F3F46' : '#D1D5DB',
                    }}>
                        —
                    </span>
                )}
            </div>

            {/* Action Menu */}
            <div style={{ flexShrink: 0, marginLeft: 4 }}>
                <ActionMenu
                    worker={worker}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>
        </motion.div>
    );
};

/* ─── Table Container ─── */
const WorkerTable = ({ workers, onView, onEdit, onDelete }) => {
    const { isDark } = useTheme();

    return (
        <div>
            {/* Column labels */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '0 16px 10px 16px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}>
                {/* Avatar spacer */}
                <div style={{ width: 42, flexShrink: 0 }} />
                <div style={{
                    flex: '1 1 180px', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: isDark ? '#52525B' : '#9CA3AF',
                }}>Name</div>
                <div style={{
                    flex: '0 1 120px', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: isDark ? '#52525B' : '#9CA3AF',
                }}>Role</div>
                <div style={{
                    flex: '0 1 130px', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: isDark ? '#52525B' : '#9CA3AF', textAlign: 'right',
                }}>Salary</div>
                <div style={{
                    flex: '0 1 100px', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: isDark ? '#52525B' : '#9CA3AF', textAlign: 'right',
                }}>Advance</div>
                {/* Action spacer */}
                <div style={{ width: 36, flexShrink: 0 }} />
            </div>

            {/* Rows */}
            <div style={{ marginTop: 4 }}>
                {workers.map((worker, i) => (
                    <WorkerRow
                        key={worker.worker_id}
                        worker={worker}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        index={i}
                    />
                ))}
            </div>
        </div>
    );
};

export default WorkerTable;
