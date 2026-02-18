import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

const Sidebar = ({
    isCollapsed,
    toggleCollapse,
    navItems = []
}) => {
    const { currentTheme, isDark } = useTheme();
    const { settings } = useSettings();
    const location = useLocation();
    const navigate = useNavigate();
    const restaurantName = settings?.shop_name || 'ReBill POS';

    // Generate acronym
    const getAcronym = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const acronym = getAcronym(restaurantName);

    const sidebarVariants = {
        expanded: { width: '260px' },
        collapsed: { width: '80px' }
    };

    const [lastTap, setLastTap] = React.useState(0);

    const handleDoubleTap = (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            toggleCollapse();
            e.preventDefault();
        }
        setLastTap(currentTime);
    };

    return (
        <motion.div
            initial={isCollapsed ? 'collapsed' : 'expanded'}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onDoubleClick={toggleCollapse}
            onTouchEnd={handleDoubleTap}
            style={{
                height: '100%',
                // 1. Sidebar Surface Depth
                backgroundColor: isDark ? '#0C0C0D' : '#FAFAFA',
                backgroundImage: isDark
                    ? 'radial-gradient(circle at 0% 50%, rgba(249,115,22,0.05), transparent 60%)'
                    : 'none',
                boxShadow: isDark
                    ? 'inset -1px 0 0 rgba(255,255,255,0.04)'
                    : 'inset -1px 0 0 rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                flexShrink: 0,
                userSelect: 'none',
                position: 'relative'
            }}
        >
            {/* Header / Logo Area */}
            <div style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '0' : '0 24px',
                marginBottom: '8px'
            }}>
                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.div
                            key="full-logo"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                letterSpacing: '0.3px',
                                color: '#F97316',
                                cursor: 'default'
                            }}
                            whileHover={{ filter: 'brightness(1.1)' }}
                        >
                            {restaurantName}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="acronym-logo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#F97316',
                            }}
                        >
                            {acronym}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Items */}
            <div style={{
                flex: 1,
                padding: '0 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px', // 10. Vertical Rhythm
                overflowY: 'auto',
            }}>
                {navItems.map((item) => {
                    // Route-based active detection
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <motion.div
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            title={isCollapsed ? item.label : ''}
                            initial={false}
                            animate={{
                                backgroundColor: isActive ? '#F97316' : 'transparent',
                                color: isActive ? '#FFFFFF' : (isDark ? '#A1A1AA' : '#52525B'),
                                boxShadow: isActive
                                    ? '0 4px 12px rgba(249,115,22,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
                                    : 'none',
                            }}
                            whileHover={!isActive ? {
                                x: 3,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
                                color: isDark ? '#FFFFFF' : '#18181B', // White on dark, Black on light
                                transition: { duration: 0.16 }
                            } : {
                                x: 3,
                                transition: { duration: 0.16 }
                            }}
                            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s ease' // Smooth transition for non-framer props
                            }}
                        >
                            {/* Icon Wrapper */}
                            <motion.span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    marginRight: isCollapsed ? 0 : '12px',
                                    color: 'currentColor' // Inherits from parent
                                }}
                                animate={isActive ? {
                                    scale: [1, 1.05, 1],
                                    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                } : { scale: 1 }}
                            >
                                {item.icon}
                            </motion.span>

                            {/* Label */}
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '14px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Collapse Toggle */}
            <div style={{
                padding: '24px',
                display: 'flex',
                justifyContent: isCollapsed ? 'center' : 'flex-end',
            }}>
                <motion.button
                    onClick={toggleCollapse}
                    whileHover={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        scale: 1.05
                    }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '12px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isDark ? '#71717A' : '#A1A1AA',
                        transition: 'color 0.2s'
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)'
                        }}
                    >
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
