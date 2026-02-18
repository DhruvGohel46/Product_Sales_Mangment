import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoAdd, IoSearch } from 'react-icons/io5';
import { useTheme } from '../../context/ThemeContext';
import { workerService } from '../../services/workerService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import WorkerStats from './WorkerStats';
import WorkerTable from './WorkerTable';
import WorkerEmpty from './WorkerEmpty';
import AddWorkerModal from './AddWorkerModal';

const WorkersPage = () => {
    const { currentTheme, isDark } = useTheme();
    const navigate = useNavigate();

    const [stats, setStats] = useState({});
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Initial Data Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, workersData] = await Promise.all([
                workerService.getStats(),
                workerService.getWorkers()
            ]);
            setStats(statsData || {});
            setWorkers(workersData || []);
        } catch (err) {
            console.error('Failed to load worker data', err);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleAddClick = () => {
        setEditingWorker(null);
        setShowAddModal(true);
    };

    const handleEditClick = (worker) => {
        setEditingWorker(worker);
        setShowAddModal(true);
    };

    const handleViewClick = (worker) => {
        navigate(`/workers/${worker.worker_id}`);
    };

    const handleDeleteClick = async (worker) => {
        if (window.confirm(`Are you sure you want to delete ${worker.name}?`)) {
            try {
                await workerService.deleteWorker(worker.worker_id);
                await loadData(); // Reload to reflect changes
            } catch (err) {
                alert('Failed to delete worker');
            }
        }
    };

    const handleModalSave = async () => {
        await loadData();
        setShowAddModal(false);
    };

    // Filtering
    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.phone && w.phone.includes(searchQuery))
    );

    return (
        <PageContainer>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                // marginBottom: '32px' // PageContainer has gap: 24, so we might not need big margin here or can reduce it
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 600, // Reduced from 700 for premium feel
                        margin: '0 0 4px 0',
                        color: isDark ? '#FFFFFF' : '#111827',
                        letterSpacing: '-0.02em'
                    }}>
                        Workers
                    </h1>
                    <p style={{
                        margin: 0,
                        color: isDark ? '#A1A1AA' : '#52525B',
                        fontSize: '14px',
                        fontWeight: 400
                    }}>
                        Manage your staff, attendance and salary
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Button
                        variant="primary"
                        onClick={handleAddClick}
                        style={{
                            background: '#F97316',
                            border: 'none',
                            borderRadius: '10px', // More modern
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        // Breathing animation
                        animate={{
                            boxShadow: [
                                '0 4px 12px rgba(249, 115, 22, 0.25)',
                                '0 4px 20px rgba(249, 115, 22, 0.4)',
                                '0 4px 12px rgba(249, 115, 22, 0.25)'
                            ]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        whileHover={{
                            scale: 1.02,
                            boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)'
                        }}
                        whileTap={{ scale: 0.96 }}
                    >
                        <IoAdd size={18} />
                        Add Worker
                    </Button>
                </motion.div>
            </div>

            {/* Stats Row */}
            <WorkerStats stats={stats} />

            {/* Content Area */}
            <div>
                {/* Search Bar (Only if workers exist) */}
                {workers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        style={{ marginBottom: '24px', maxWidth: '320px' }}
                    >
                        <div style={{ position: 'relative', group: 'search-group' }}>
                            <IoSearch
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#71717A', // Tertiary text color
                                    zIndex: 1,
                                    pointerEvents: 'none'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Search workers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 36px',
                                    borderRadius: '10px',
                                    border: '1px solid transparent', // Default transparent
                                    background: isDark ? 'rgba(255,255,255,0.03)' : '#F4F4F5',
                                    color: currentTheme.colors.text.primary,
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.background = isDark ? '#18181B' : '#FFFFFF';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(249, 115, 22, 0.25)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#F4F4F5';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: currentTheme.colors.text.secondary }}>
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Table or Empty State */}
                        {workers.length > 0 ? (
                            <WorkerTable
                                workers={filteredWorkers}
                                onView={handleViewClick}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                            />
                        ) : (
                            <WorkerEmpty onAdd={handleAddClick} />
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AddWorkerModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSaved={handleModalSave}
                initialData={editingWorker}
            />

        </PageContainer>
    );
};

export default WorkersPage;

import PageContainer from '../layout/PageContainer';
