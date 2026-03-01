import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { workerAPI } from '../../api/workers';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { formatCurrency } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack, IoTrash, IoCall, IoCash, IoBriefcase, IoCalendar, IoCheckmarkCircle, IoWarning, IoTime, IoAddCircle } from 'react-icons/io5';
import PageContainer from '../layout/PageContainer';
import '../../styles/Workers.css';

const WorkerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentTheme, isDark } = useTheme();
    const { showSuccess, showError, showConfirm } = useAlert();

    const [worker, setWorker] = useState(null);
    const [advances, setAdvances] = useState([]);
    const [salaryHistory, setSalaryHistory] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [activeTab, setActiveTab] = useState('attendance');
    const [loading, setLoading] = useState(true);

    // Advance Form
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [advanceReason, setAdvanceReason] = useState('');
    const [submittingAdvance, setSubmittingAdvance] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [w, a, s, att] = await Promise.all([
                workerAPI.getWorker(id),
                workerAPI.getAdvances(id),
                workerAPI.getSalaryHistory(id),
                workerAPI.getWorkerAttendance(id)
            ]);
            setWorker(w);
            setAdvances(a || []);
            setSalaryHistory(s || []);
            setAttendance(att || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdvance = async (e) => {
        e.preventDefault();
        setSubmittingAdvance(true);
        try {
            await workerAPI.addAdvance(id, { amount: advanceAmount, reason: advanceReason });
            setAdvanceAmount('');
            setAdvanceReason('');
            loadData();
        } catch (error) {
            showError('Failed to add advance');
        } finally {
            setSubmittingAdvance(false);
        }
    };

    const handleGenerateSalary = async () => {
        const confirmed = await showConfirm({
            title: 'Mark Salary as Paid?',
            description: 'Generate and mark the salary for the current month as paid? This will deduct any advances and consider attendance.',
            confirmLabel: 'Mark Paid',
            cancelLabel: 'Cancel',
            variant: 'primary',
        });
        if (!confirmed) return;
        try {
            const date = new Date();
            await workerAPI.generateSalary(id, date.getMonth() + 1, date.getFullYear());
            loadData();
            showSuccess('Salary generated successfully');
        } catch (error) {
            showError('Failed to generate salary: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteWorker = async () => {
        const confirmed = await showConfirm({
            title: 'Delete Worker',
            description: 'Are you sure you want to delete this worker? This action cannot be undone.',
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            variant: 'danger',
        });
        if (confirmed) {
            try {
                await workerAPI.deleteWorker(worker.worker_id);
                navigate('/workers');
            } catch (e) {
                showError('Failed to delete worker');
            }
        }
    }

    const calculateScore = () => {
        if (!attendance || !attendance.length) return 100;
        const present = attendance.filter(a => a.status === 'Present').length;
        return Math.round((present / attendance.length) * 100);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: currentTheme.colors.text.secondary }}>
            Loading Profile...
        </div>
    );

    if (!worker) return (
        <div style={{ padding: '24px', textAlign: 'center', color: currentTheme.colors.text.secondary }}>
            Worker not found
        </div>
    );

    const score = calculateScore();

    // Tab Components
    const TabButton = ({ id, label, icon: Icon }) => (
        <motion.button
            onClick={() => setActiveTab(id)}
            className={`wpTabButton ${activeTab === id ? 'wpTabActive' : ''}`}
            whileHover={{ y: -1 }} // Tactile hover
            transition={{ duration: 0.2 }}
        >
            {Icon && <Icon size={18} />}
            {label}
            {activeTab === id && (
                <motion.div
                    layoutId="activeTab"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px', // Tactile underline
                        background: '#F97316',
                        borderRadius: '2px',
                    }}
                    transition={{ duration: 0.18 }}
                />
            )}
        </motion.button>
    );

    return (
        <PageContainer>
            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Button
                    onClick={() => navigate('/workers')}
                    variant="ghost"
                    style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '8px', color: currentTheme.colors.text.secondary }}
                >
                    <IoArrowBack size={20} />
                    Back to List
                </Button>
                <Button
                    onClick={handleDeleteWorker}
                    variant="ghost"
                    style={{
                        color: '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                    }}
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                    whileTap={{ scale: 0.96 }}
                >
                    <IoTrash size={18} />
                    Delete Worker
                </Button>
            </div>

            {/* Profile Header Card */}
            <div className="wpHeader">
                {/* Avatar */}
                <div className="wpAvatar">
                    {worker.photo ? (
                        <img src={worker.photo} alt={worker.name} />
                    ) : (
                        worker.name.charAt(0).toUpperCase()
                    )}
                    {/* Gradient Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(145deg, transparent, rgba(0,0,0,0.2))',
                        pointerEvents: 'none'
                    }} />
                </div>

                {/* Info */}
                <div className="wpInfo">
                    <h1 className="wpName">{worker.name}</h1>
                    <div className="wpRoleRow">
                        <IoBriefcase style={{ color: 'var(--accent)' }} />
                        <span className="wpRole">{worker.role}</span>
                        <span className={`wpStatusBadge ${worker.status === 'active' ? 'wpStatusActive' : 'wpStatusInactive'}`}>
                            {worker.status.toUpperCase()}
                        </span>
                    </div>

                    <div className="wpMetaGrid">
                        <div className="wpMetaItem">
                            <IoCall style={{ color: 'var(--text-tertiary)' }} />
                            {worker.phone || 'No Phone'}
                        </div>
                        <div className="wpMetaItem">
                            <IoCash style={{ color: 'var(--text-tertiary)' }} />
                            {formatCurrency(worker.salary)}/mo
                        </div>
                        <div className="wpMetaItem">
                            <IoCalendar style={{ color: 'var(--text-tertiary)' }} />
                            Joined {new Date(worker.join_date || worker.joinDate).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Stats Info Bar — merged from Overview tab */}
                    {(() => {
                        const presentDays = attendance.filter(a => a.status === 'Present').length;
                        const totalAdvance = advances.reduce((acc, curr) => acc + curr.amount, 0);
                        const netPay = worker.salary - totalAdvance;
                        const hasAdvance = totalAdvance > 0;
                        const items = [
                            { label: 'Attendance', value: `${presentDays} Days`, color: '#3B82F6' },
                            { label: 'Daily Wage', value: formatCurrency(worker.salary / 30), color: '#10B981' },
                            { label: 'Advances', value: formatCurrency(totalAdvance), color: hasAdvance ? '#EF4444' : '#71717A' },
                            { label: 'Est. Net Pay', value: formatCurrency(netPay), color: '#F97316' },
                        ];
                        return (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 0,
                                padding: '0 4px', height: 38, marginTop: 16,
                                background: 'transparent',
                                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            }}>
                                {items.map((item, i) => (
                                    <React.Fragment key={item.label}>
                                        {i > 0 && (
                                            <div style={{
                                                width: 1, height: 18, flexShrink: 0,
                                                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
                                            }} />
                                        )}
                                        <div style={{
                                            flex: 1, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: 6, padding: '0 10px', minWidth: 0,
                                        }}>
                                            <span style={{
                                                width: 5, height: 5, borderRadius: '50%',
                                                background: item.color, display: 'inline-block', flexShrink: 0,
                                            }} />
                                            <span style={{
                                                fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
                                                color: isDark ? '#71717A' : '#6B7280',
                                            }}>
                                                {item.label}
                                            </span>
                                            <span style={{
                                                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                                                fontVariantNumeric: 'tabular-nums',
                                                color: item.label === 'Advances' && hasAdvance
                                                    ? '#EF4444' : (isDark ? '#FAFAFA' : '#111827'),
                                            }}>
                                                {item.value}
                                            </span>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                borderBottom: `1px solid ${currentTheme.colors.border}`,
                marginBottom: '24px',
                display: 'flex',
                gap: '8px'
            }}>

                <TabButton id="attendance" label="Attendance" icon={IoTime} />
                <TabButton id="advances" label="Advances" icon={IoWarning} />
                <TabButton id="salary" label="Salary History" icon={IoCash} />
            </div>

            {/* Tab Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >

                    {activeTab === 'attendance' && (
                        <Card title="Attendance Log" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB' }}>
                                    <tr>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: currentTheme.colors.text.tertiary }}>Date</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: currentTheme.colors.text.tertiary }}>Status</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: currentTheme.colors.text.tertiary }}>Check In</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((a, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}>
                                            <td style={{ padding: '16px', fontWeight: 500 }}>{new Date(a.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                                                    background: a.status === 'Present' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: a.status === 'Present' ? '#16A34A' : '#DC2626'
                                                }}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', color: currentTheme.colors.text.secondary }}>{a.check_in || '-'}</td>
                                        </tr>
                                    ))}
                                    {attendance.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: currentTheme.colors.text.secondary }}>
                                                No attendance records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Card>
                    )}

                    {activeTab === 'advances' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            <Card title="Advance History" style={{ overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB' }}>
                                        <tr>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: currentTheme.colors.text.tertiary }}>Date</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: currentTheme.colors.text.tertiary }}>Reason</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: currentTheme.colors.text.tertiary }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {advances.map((adv, i) => (
                                            <tr key={i} style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}>
                                                <td style={{ padding: '16px', fontWeight: 500 }}>{new Date(adv.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '16px', color: currentTheme.colors.text.secondary }}>{adv.reason}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#EF4444' }}>
                                                    {formatCurrency(adv.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                        {advances.length === 0 && (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: currentTheme.colors.text.secondary }}>
                                                    No advances found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </Card>

                            <Card title="Add New Advance">
                                <form onSubmit={handleAddAdvance} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
                                    <Input
                                        label="Amount (₹)"
                                        type="number"
                                        value={advanceAmount}
                                        onChange={e => setAdvanceAmount(e.target.value)}
                                        required
                                        icon={<IoCash />}
                                    />
                                    <Input
                                        label="Reason"
                                        value={advanceReason}
                                        onChange={e => setAdvanceReason(e.target.value)}
                                        placeholder="e.g. Medical Emergency"
                                        required
                                    />
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        loading={submittingAdvance}
                                        style={{
                                            background: '#EF4444',
                                            border: 'none',
                                            marginTop: '8px',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        Deduct Advance
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'salary' && (
                        <div>
                            {/* Real-time salary calculation display, no generation button */}
                            <Card style={{ overflow: 'hidden' }}>
                                <table className="wpTable">
                                    <thead>
                                        <tr>
                                            <th>Period</th>
                                            <th>Base Salary</th>
                                            <th>Deductions</th>
                                            <th>Final Pay</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Current Month Row (Real-time) - Only show if not generated yet */}
                                        {!salaryHistory.some(p => p.month === new Date().getMonth() + 1 && p.year === new Date().getFullYear()) && (
                                            <tr style={{ background: isDark ? 'rgba(249, 115, 22, 0.05)' : '#FFF7ED' }}>
                                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} (Current)
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(worker.salary)}</td>
                                                <td style={{ color: '#EF4444' }}>
                                                    - {formatCurrency(advances
                                                        .filter(a => {
                                                            const d = new Date(a.date);
                                                            return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
                                                        })
                                                        .reduce((acc, curr) => acc + curr.amount, 0)
                                                    )}
                                                </td>
                                                <td style={{ color: '#10B981', fontWeight: 700, fontSize: '1.05rem' }}>
                                                    {formatCurrency(
                                                        worker.salary - advances
                                                            .filter(a => {
                                                                const d = new Date(a.date);
                                                                return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
                                                            })
                                                            .reduce((acc, curr) => acc + curr.amount, 0)
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                        color: '#F59E0B',
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                    }}>
                                                        <IoTime /> Pending
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleGenerateSalary}
                                                        style={{ background: '#10B981', border: 'none', color: 'white' }}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                </td>
                                            </tr>
                                        )}

                                        {/* History Rows */}
                                        {salaryHistory.map((pay, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {new Date(pay.year, pay.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(pay.base_salary)}</td>
                                                <td style={{ color: '#EF4444' }}>- {formatCurrency(pay.advance_deduction)}</td>
                                                <td style={{ color: '#10B981', fontWeight: 700, fontSize: '1.05rem' }}>{formatCurrency(pay.final_salary)}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                                                        background: pay.paid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                        color: pay.paid ? '#16A34A' : '#F59E0B',
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                    }}>
                                                        {pay.paid ? <IoCheckmarkCircle /> : <IoTime />}
                                                        {pay.paid ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {!pay.paid && (
                                                        <Button
                                                            size="sm"
                                                            onClick={async () => {
                                                                try {
                                                                    await workerAPI.markPaid(pay.payment_id);
                                                                    loadData();
                                                                } catch (e) { showError('Failed to mark paid'); }
                                                            }}
                                                            style={{ background: '#10B981', border: 'none', color: 'white' }}
                                                        >
                                                            Mark Paid
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence >
        </PageContainer>
    );
};

export default WorkerProfile;


