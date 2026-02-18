import React from 'react';
import { motion } from 'framer-motion';
import { IoPeople, IoPerson, IoCalendar, IoCash } from 'react-icons/io5';
import { formatCurrency } from '../../utils/api';
import Card from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
    const { currentTheme, isDark } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{ flex: 1, minWidth: '220px' }}
        >
            <Card style={{
                padding: '24px', // More breathing room
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                // Premium Card Styles
                border: 'none', // Remove default border
                background: isDark ? '#18181B' : '#FFFFFF',
                boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.35)'
                    : '0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(255,255,255,0.05)' : `${color}10`, // Subtle icon bg
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'none'
                    }}>
                        <Icon size={20} />
                    </div>
                </div>
                <div>
                    <h3 style={{
                        fontSize: '24px', // Slightly smaller, refined
                        fontWeight: 600,
                        color: isDark ? '#FAFAFA' : '#111827',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.02em'
                    }}>
                        {value}
                    </h3>
                    <p style={{
                        fontSize: '13px',
                        color: isDark ? '#A1A1AA' : '#6B7280',
                        margin: 0,
                        fontWeight: 500
                    }}>
                        {title}
                    </p>
                </div>
            </Card>
        </motion.div>
    );
};

const WorkerStats = ({ stats }) => {
    return (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <StatCard
                title="Total Workers"
                value={stats.totalWorkers || 0}
                icon={IoPeople}
                color="#3B82F6"
                delay={0}
            />
            <StatCard
                title="Active Workers"
                value={stats.activeWorkers || 0}
                icon={IoPerson}
                color="#10B981"
                delay={0.1}
            />
            <StatCard
                title="Present Today"
                value={stats.presentToday || 0}
                icon={IoCalendar}
                color="#F97316"
                delay={0.2}
            />
            <StatCard
                title="Est. Monthly Salary"
                value={formatCurrency(stats.totalSalary || 0)}
                icon={IoCash}
                color="#8B5CF6"
                delay={0.3}
            />
            <StatCard
                title="Net Payable (after advances)"
                value={formatCurrency(stats.netPayable || 0)}
                icon={IoCash}
                color="#EF4444"
                delay={0.4}
            />
        </div>
    );
};

export default WorkerStats;
