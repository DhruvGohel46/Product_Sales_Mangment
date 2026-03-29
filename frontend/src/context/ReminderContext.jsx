import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAlert } from './AlertContext';

const ReminderContext = createContext();

// Microservice URL
const REMINDER_API_URL = 'http://localhost:5052';

export const ReminderProvider = ({ children }) => {
    const [reminders, setReminders] = useState([]);
    const [activeAlerts, setActiveAlerts] = useState([]); // Currently triggering alerts
    const [socket, setSocket] = useState(null);
    const audioRef = useRef(null);
    const { addToast } = useAlert();

    // ─── Sound Management ───────────────────────────────────────────────────────
    useEffect(() => {
        // Initialize Audio object
        // NOTE: Sound file should be placed in public/sounds/reminder.mp3
        audioRef.current = new Audio('/sounds/reminder.mp3');
        audioRef.current.loop = true; // Loop as per requirement
    }, []);

    const playAlertSound = useCallback(() => {
        if (audioRef.current && activeAlerts.length > 0) {
            audioRef.current.play().catch(err => {
                console.warn("Autoplay blocked. Sound will play after interaction.", err);
            });
        }
    }, [activeAlerts]);

    const stopAlertSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    useEffect(() => {
        if (activeAlerts.length > 0) {
            playAlertSound();
        } else {
            stopAlertSound();
        }
    }, [activeAlerts, playAlertSound, stopAlertSound]);

    // ─── API Methods ────────────────────────────────────────────────────────────
    const fetchReminders = async () => {
        try {
            const response = await axios.get(`${REMINDER_API_URL}/api/reminders`);
            setReminders(response.data);
            
            // Fail-safe: Check for triggered but not dismissed
            const triggered = response.data.filter(r => r.status === 'triggered' && !r.is_dismissed);
            if (triggered.length > 0) {
                setActiveAlerts(prev => {
                    const existingIds = new Set(prev.map(a => a.id));
                    const newAlerts = triggered.filter(a => !existingIds.has(a.id));
                    return [...prev, ...newAlerts];
                });
            }
        } catch (error) {
            console.error("Failed to fetch reminders:", error);
        }
    };

    const createReminder = async (data) => {
        try {
            const response = await axios.post(`${REMINDER_API_URL}/api/reminders`, data);
            setReminders(prev => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error("Failed to create reminder:", error);
            throw error;
        }
    };

    const snoozeReminder = async (id, minutes = 5) => {
        try {
            await axios.put(`${REMINDER_API_URL}/api/reminders/${id}/snooze`, { minutes });
            setActiveAlerts(prev => prev.filter(a => a.id !== id));
            fetchReminders();
        } catch (error) {
            console.error("Snooze failed:", error);
        }
    };

    const dismissReminder = async (id) => {
        try {
            await axios.put(`${REMINDER_API_URL}/api/reminders/${id}/dismiss`);
            setActiveAlerts(prev => prev.filter(a => a.id !== id));
            fetchReminders();
        } catch (error) {
            console.error("Dismiss failed:", error);
        }
    };

    // ─── WebSocket Connection ──────────────────────────────────────────────────
    useEffect(() => {
        const newSocket = io(REMINDER_API_URL, {
            transports: ['websocket'],
            autoConnect: true
        });

        newSocket.on('connect', () => {
            console.log("🔔 Connected to Reminder Service via WebSocket");
            newSocket.emit('join', { user_id: 'admin' });
        });

        newSocket.on('reminder_alert', (reminder) => {
            console.log("🚨 REMINDER TRIGGERED:", reminder.title);
            setActiveAlerts(prev => {
                // Prevent duplicate alerts
                if (prev.find(a => a.id === reminder.id)) return prev;
                return [...prev, reminder];
            });
            
            // Also add a toast
            addToast(`🚨 ${reminder.title}`, reminder.description || 'Action required');
        });

        newSocket.on('reminder_created', (reminder) => {
            setReminders(prev => [...prev, reminder]);
        });

        setSocket(newSocket);
        fetchReminders();

        return () => newSocket.disconnect();
    }, [addToast]);

    return (
        <ReminderContext.Provider value={{
            reminders,
            activeAlerts,
            createReminder,
            snoozeReminder,
            dismissReminder,
            fetchReminders
        }}>
            {children}
        </ReminderContext.Provider>
    );
};

export const useReminders = () => {
    const context = useContext(ReminderContext);
    if (!context) throw new Error("useReminders must be used within ReminderProvider");
    return context;
};
