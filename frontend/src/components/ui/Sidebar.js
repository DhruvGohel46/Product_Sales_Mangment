import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

const Sidebar = ({
    activeTab,
    onTabChange,
    isCollapsed,
    toggleCollapse,
    navItems = []
}) => {
    const { currentTheme, isDark } = useTheme();

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
                backgroundColor: currentTheme.colors.card || currentTheme.colors.surface,
                borderRight: `1px solid ${currentTheme.colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                flexShrink: 0,
                userSelect: 'none',
                touchAction: 'manipulation', // Improves touch response
            }}
        >
            {/* Header / Logo Area */}
            <div style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '0' : `0 ${currentTheme.spacing[4]}`,
                borderBottom: `1px solid ${currentTheme.colors.border}`,
            }}>
                {!isCollapsed && (
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: currentTheme.typography.fontWeight.bold,
                        background: `linear-gradient(135deg, ${currentTheme.colors.primary[500]}, ${currentTheme.colors.primary[600]})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        whiteSpace: 'nowrap',
                    }}>
                        Burger Bhau
                    </div>
                )}
                {isCollapsed && (
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: currentTheme.typography.fontWeight.bold,
                        color: currentTheme.colors.primary[500],
                    }}>
                        BB
                    </div>
                )}
            </div>

            {/* Navigation Items */}
            <div style={{
                flex: 1,
                padding: currentTheme.spacing[3],
                display: 'flex',
                flexDirection: 'column',
                gap: currentTheme.spacing[2],
                overflowY: 'auto',
            }}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <div key={item.id} title={isCollapsed ? item.label : ''}>
                            <Button
                                variant={isActive ? 'primary' : 'ghost'}
                                fullWidth
                                onClick={() => onTabChange(item.id)}
                                style={{
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    padding: isCollapsed ? currentTheme.spacing[3] : `${currentTheme.spacing[3]} ${currentTheme.spacing[4]}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    marginRight: isCollapsed ? 0 : currentTheme.spacing[3]
                                }}>
                                    {item.icon}
                                </span>

                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}

                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: '15%',
                                            bottom: '15%',
                                            width: '4px',
                                            backgroundColor: currentTheme.colors.white,
                                            borderTopLeftRadius: '4px',
                                            borderBottomLeftRadius: '4px',
                                            opacity: 0.6
                                        }}
                                    />
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Collapse Toggle */}
            <div style={{
                padding: currentTheme.spacing[4],
                borderTop: `1px solid ${currentTheme.colors.border}`,
                display: 'flex',
                justifyContent: isCollapsed ? 'center' : 'flex-end',
            }}>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleCollapse}
                    style={{
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
