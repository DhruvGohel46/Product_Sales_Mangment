import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
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

    const [worker, setWorker] = useState(null);
    const [advances, setAdvances] = useState([]);
    const [salaryHistory, setSalaryHistory] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
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
            alert("Failed to add advance");
        } finally {
            setSubmittingAdvance(false);
        }
    };

    const handleGenerateSalary = async () => {
        if (!window.confirm('Generate salary for the current month?')) return;
        try {
            const date = new Date();
            await workerAPI.generateSalary(id, date.getMonth() + 1, date.getFullYear());
            loadData();
            alert("Salary generated successfully");
        } catch (error) {
            alert("Failed to generate salary: " + error.response?.data?.error || error.message);
        }
    };

    const handleDeleteWorker = async () => {
        if (window.confirm('Are you sure you want to delete this worker? This action cannot be undone.')) {
            try {
                await workerAPI.deleteWorker(worker.worker_id);
                navigate('/workers');
            } catch (e) {
                alert('Failed to delete worker');
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
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                borderBottom: `1px solid ${currentTheme.colors.border}`,
                marginBottom: '24px',
                display: 'flex',
                gap: '8px'
            }}>
                <TabButton id="overview" label="Overview" icon={IoBriefcase} />
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
                    {activeTab === 'overview' && (
                        <div className="wpStatsGrid">
                            {/* Days Present */}
                            <motion.div
                                className="wpStatCard"
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            >
                                <div className="wpStatHeader">
                                    <IoCalendar size={18} />
                                    <span>Attendance</span>
                                </div>
                                <div className="wpStatValue">
                                    {attendance.filter(a => a.status === 'Present').length} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Days</span>
                                </div>
                                <div className="wpStatSub">
                                    Present this month
                                </div>
                                <IoCalendar size={48} className="wpStatIcon" />
                            </motion.div>

                            {/* Daily Wage */}
                            <motion.div
                                className="wpStatCard"
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            >
                                <div className="wpStatHeader">
                                    <IoCash size={18} />
                                    <span>Daily Wage</span>
                                </div>
                                <div className="wpStatValue">
                                    {formatCurrency(worker.salary / 30)}
                                </div>
                                <div className="wpStatSub">
                                    Calculated from monthly
                                </div>
                                <IoCash size={48} className="wpStatIcon" />
                            </motion.div>

                            {/* Outstanding Advances */}
                            <motion.div
                                className="wpStatCard"
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                style={{ borderColor: advances.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-primary)' }}
                            >
                                <div className="wpStatHeader" style={{ color: advances.length > 0 ? '#EF4444' : 'inherit' }}>
                                    <IoWarning size={18} />
                                    <span>Outstanding Advances</span>
                                </div>
                                <div className="wpStatValue" style={{ color: advances.length > 0 ? '#EF4444' : 'inherit' }}>
                                    {formatCurrency(advances.reduce((acc, curr) => acc + curr.amount, 0))}
                                </div>
                                <div className="wpStatSub">
                                    To be deducted
                                </div>
                                <IoWarning size={48} className="wpStatIcon" style={{ color: advances.length > 0 ? '#EF4444' : 'inherit' }} />
                            </motion.div>

                            {/* Net Payable Projection (New) */}
                            <motion.div
                                className="wpStatCard"
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                style={{ background: 'var(--bg-secondary)', borderStyle: 'dashed' }}
                            >
                                <div className="wpStatHeader">
                                    <IoBriefcase size={18} />
                                    <span>Est. Net Pay</span>
                                </div>
                                <div className="wpStatValue" style={{ color: 'var(--accent)' }}>
                                    {formatCurrency(
                                        (worker.salary) - (advances.reduce((acc, curr) => acc + curr.amount, 0))
                                    )}
                                </div>
                                <div className="wpStatSub">
                                    Base Salary - Advances
                                </div>
                                <IoBriefcase size={48} className="wpStatIcon" style={{ color: 'var(--accent)' }} />
                            </motion.div>
                        </div>
                    )}

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
                                                        Finalize & Pay
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
                                                                } catch (e) { alert('Failed to mark paid'); }
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


