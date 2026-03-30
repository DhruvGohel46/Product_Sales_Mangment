import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoAlarmOutline, IoCloseCircle, IoRepeatOutline } from 'react-icons/io5';
import { useReminders } from '../../context/ReminderContext';
import '../../styles/Reminder.css';

const ReminderAlert = () => {
    const { activeAlerts, snoozeReminder, dismissReminder } = useReminders();

    if (activeAlerts.length === 0) return null;

    return (
        <div className="reminderOverlay">
            <AnimatePresence>
                {activeAlerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ x: 300, opacity: 0, scale: 0.9 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: 300, opacity: 0, scale: 0.9 }}
                        transition={{ 
                            type: 'spring', 
                            damping: 20, 
                            stiffness: 100,
                            delay: index * 0.1 
                        }}
                        className="reminderAlertCard"
                        style={{
                            // Stack multiple alerts with offset
                            marginBottom: '16px',
                            zIndex: 1000 - index
                        }}
                    >
                        {/* Header with Pulsing Glow */}
                        <div className="reminderAlertHeader">
                            <div className="reminderIconGlow">
                                <IoAlarmOutline size={24} color="#ffffff" className="ringing" />
                            </div>
                            <div className="reminderTitleGroup">
                                <h3 className="reminderTitle">{alert.title}</h3>
                                <span className="reminderTimeLabel">
                                    {new Date(alert.reminder_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {alert.description && (
                            <p className="reminderDesc">{alert.description}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="reminderActions">
                            {/* Snooze Options */}
                            <div className="snoozeGroup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => snoozeReminder(alert.id, 5)}
                                    className="snoozeBtn"
                                    title="Snooze 5m"
                                >
                                    <IoRepeatOutline size={16} /> 5m
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => snoozeReminder(alert.id, 15)}
                                    className="snoozeBtn"
                                    title="Snooze 15m"
                                >
                                    <IoRepeatOutline size={16} /> 15m
                                </motion.button>
                            </div>

                            {/* Dismiss Button */}
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.16)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => dismissReminder(alert.id)}
                            className="dismissBtn"
                        >
                                <IoCloseCircle size={18} /> DISMISS
                            </motion.button>
                        </div>

                        {/* Persistent Sound Reminder Indicator */}
                        <div className="soundIndicator">
                            <div className="soundWave" /> 
                            <span>Alerting...</span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ReminderAlert;
