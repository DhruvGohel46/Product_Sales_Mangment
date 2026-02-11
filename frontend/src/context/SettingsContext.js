import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../api/settings';
import { useTheme } from './ThemeContext';
import { setCurrencySymbol } from '../utils/api';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { setTheme, isDark, toggleTheme } = useTheme();

    // Initialize from localStorage for offline support
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('pos_settings');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Failed to parse local settings", e);
            return {};
        }
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial load
    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await settingsAPI.getAllSettings();
            setSettings(data);
            localStorage.setItem('pos_settings', JSON.stringify(data));

            // Apply Global Configurations
            applyGlobalConfig(data);
        } catch (err) {
            console.error("Failed to load settings:", err);
            setError(err.message);
            // Fallback to local storage or defaults if API fails?
        } finally {
            setLoading(false);
        }
    }, [setTheme]);

    const applyGlobalConfig = (config) => {
        // 1. Currency
        if (config.currency_symbol) {
            setCurrencySymbol(config.currency_symbol);
        }

        // 2. Theme
        // If config.dark_mode is explicitly set, enforce it.
        // Otherwise, leave it to ThemeContext's default (system/localstorage)
        if (config.dark_mode === 'true') {
            setTheme('dark');
        } else if (config.dark_mode === 'false') {
            setTheme('light');
        }
    };

    // Update a single setting or multiple
    const updateSettings = async (newSettings) => {
        try {
            // newSettings can be { key: value } or [{key, value, group}]
            // Standardize to array for API
            let apiPayload = [];

            // Optimistic Update
            const updatedState = { ...settings };

            if (Array.isArray(newSettings)) {
                apiPayload = newSettings;
                newSettings.forEach(s => updatedState[s.key] = s.value);
            } else {
                // Formatting for API: convert object to array of objects
                // We need to know the group... but maybe API handles it or we default 'app'
                // The API updateSettings handles dict {key:value} by defaulting to 'general' or existing group
                // Let's use the dict format for the API call if supported, or convert manually.
                // Looking at the API code: it supports dict.
                apiPayload = newSettings;
                Object.assign(updatedState, newSettings);
            }

            setSettings(updatedState);
            localStorage.setItem('pos_settings', JSON.stringify(updatedState)); // Cache updates
            applyGlobalConfig(updatedState); // Apply immediately

            await settingsAPI.updateSettings(apiPayload);

            return true;
        } catch (err) {
            console.error("Failed to update settings:", err);
            // Revert state?
            // For now, just reload to be safe or show error
            loadSettings();
            throw err;
        }
    };

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const value = {
        settings,
        loading,
        error,
        updateSettings,
        refreshSettings: loadSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
