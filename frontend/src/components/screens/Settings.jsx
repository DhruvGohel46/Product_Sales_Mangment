import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/Settings.css';
import Dropdown from '../ui/Dropdown';
import GlobalTimePicker from '../ui/GlobalTimePicker';
import Card from '../ui/Card'; // Import Shared Card Component

const Settings = () => {
    const { showSuccess, showError } = useToast();
    const { isDark } = useTheme();
    const { settings: globalSettings, loading, updateSettings } = useSettings();

    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('shop');

    const [formSettings, setFormSettings] = useState({
        // Shop
        shop_name: '',
        shop_address: '',
        shop_contact: '',
        gst_no: '',
        currency_symbol: '₹',
        shop_open_time: '',
        shop_close_time: '',

        // Billing
        bill_reset_daily: 'true',
        default_tax_rate: '0',
        tax_enabled: 'false',

        // Printer
        printer_enabled: 'false',
        printer_width: '58mm',
        auto_print: 'false',

        // App
        show_product_images: 'true',
        dark_mode: 'false',
        sound_enabled: 'true'
    });

    // Sync form with global settings when they load
    useEffect(() => {
        if (globalSettings && Object.keys(globalSettings).length > 0) {
            setFormSettings(prev => ({
                ...prev,
                ...globalSettings
            }));
        }
    }, [globalSettings]);

    const handleChange = (key, value) => {
        setFormSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateSettings(formSettings);
            showSuccess('Settings saved successfully');
        } catch (error) {
            showError('Failed to save settings');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (globalSettings) {
            setFormSettings(prev => ({ ...prev, ...globalSettings }));
        }
        showSuccess('Changes discarded');
    };

    const tabs = [
        { id: 'shop', label: 'Shop Details' },
        { id: 'billing', label: 'Billing Configuration' },
        { id: 'printer', label: 'Printer Settings' },
        { id: 'app', label: 'App Preferences' }
    ];

    if (loading) {
        return <div className="stShell"><div className="stPage">Loading settings...</div></div>;
    }

    return (
        <div className="stShell">
            <div className="stPage">
                {/* Header using Card for consistency */}
                <Card className="stHeader" padding="md" shadow="card">
                    <div className="stTitle">System Settings</div>
                </Card>

                <div className="stTabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`stTabButton ${activeTab === tab.id ? 'stTabActive' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Using Shared Card Component for Consistency */}
                <Card
                    className="stSection"
                    padding="lg"
                    shadow="card"
                    hover={false} // Disable global hover effect
                    key={activeTab} // Retain key for animation reset on tab switch if needed
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'shop' && (
                            <>
                                <div className="stSectionTitle">Store Information</div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Shop Name</span>
                                        <span className="stLabelDesc">Appears on bills and reports</span>
                                    </div>
                                    <input
                                        className="stInput"
                                        value={formSettings.shop_name || ''}
                                        onChange={(e) => handleChange('shop_name', e.target.value)}
                                        placeholder="e.g. Burger Bhau"
                                    />
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Address</span>
                                        <span className="stLabelDesc">Shop location for bill header</span>
                                    </div>
                                    <input
                                        className="stInput"
                                        value={formSettings.shop_address || ''}
                                        onChange={(e) => handleChange('shop_address', e.target.value)}
                                        placeholder="Shop address"
                                    />
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Contact Number</span>
                                        <span className="stLabelDesc">Displayed on bills</span>
                                    </div>
                                    <input
                                        className="stInput"
                                        value={formSettings.shop_contact || ''}
                                        onChange={(e) => handleChange('shop_contact', e.target.value)}
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">GST / Tax ID</span>
                                        <span className="stLabelDesc">Optional tax identification number</span>
                                    </div>
                                    <input
                                        className="stInput"
                                        value={formSettings.gst_no || ''}
                                        onChange={(e) => handleChange('gst_no', e.target.value)}
                                        placeholder="GSTIN (Optional)"
                                    />
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Currency Symbol</span>
                                        <span className="stLabelDesc">Default currency for prices</span>
                                    </div>
                                    <Dropdown
                                        options={[
                                            { label: 'India (INR) - ₹', value: '₹' },
                                            { label: 'USA (USD) - $', value: '$' },
                                            { label: 'Europe (EUR) - €', value: '€' },
                                            { label: 'UK (GBP) - £', value: '£' },
                                            { label: 'Japan (JPY) - ¥', value: '¥' }
                                        ]}
                                        value={formSettings.currency_symbol || '₹'}
                                        onChange={(val) => handleChange('currency_symbol', val)}
                                        placeholder="Select Currency"
                                        className="stDropdown"
                                        zIndex={60}
                                    />
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Shop Timings</span>
                                        <span className="stLabelDesc">For automated stock alerts</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Open Time</label>
                                            <GlobalTimePicker
                                                value={formSettings.shop_open_time || ''}
                                                onChange={(val) => handleChange('shop_open_time', val)}
                                                placeholder="Open Time"
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Close Time</label>
                                            <GlobalTimePicker
                                                value={formSettings.shop_close_time || ''}
                                                onChange={(val) => handleChange('shop_close_time', val)}
                                                placeholder="Close Time"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'billing' && (
                            <>
                                <div className="stSectionTitle">Billing Rules</div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Daily Bill Reset</span>
                                        <span className="stLabelDesc">Reset bill number to 1 every day</span>
                                    </div>
                                    <label className="stToggle">
                                        <input
                                            type="checkbox"
                                            checked={formSettings.bill_reset_daily === 'true'}
                                            onChange={(e) => handleChange('bill_reset_daily', e.target.checked ? 'true' : 'false')}
                                        />
                                        <span className="stSlider"></span>
                                    </label>
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Enable Tax</span>
                                        <span className="stLabelDesc">Calculate tax on bills</span>
                                    </div>
                                    <label className="stToggle">
                                        <input
                                            type="checkbox"
                                            checked={formSettings.tax_enabled === 'true'}
                                            onChange={(e) => handleChange('tax_enabled', e.target.checked ? 'true' : 'false')}
                                        />
                                        <span className="stSlider"></span>
                                    </label>
                                </div>

                                {formSettings.tax_enabled === 'true' && (
                                    <div className="stFormGroup">
                                        <div className="stLabel">
                                            <span className="stLabelTitle">Default Tax Rate (%)</span>
                                            <span className="stLabelDesc">Percentage added to total</span>
                                        </div>
                                        <input
                                            type="number"
                                            className="stInput"
                                            style={{ width: '100px' }}
                                            value={formSettings.default_tax_rate || ''}
                                            onChange={(e) => handleChange('default_tax_rate', e.target.value)}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'printer' && (
                            <>
                                <div className="stSectionTitle">Printer Configuration</div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Enable Thermal Printer</span>
                                        <span className="stLabelDesc">Send print commands to connected printer</span>
                                    </div>
                                    <label className="stToggle">
                                        <input
                                            type="checkbox"
                                            checked={formSettings.printer_enabled === 'true'}
                                            onChange={(e) => handleChange('printer_enabled', e.target.checked ? 'true' : 'false')}
                                        />
                                        <span className="stSlider"></span>
                                    </label>
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Auto Print</span>
                                        <span className="stLabelDesc">Print automatically after saving bill</span>
                                    </div>
                                    <label className="stToggle">
                                        <input
                                            type="checkbox"
                                            checked={formSettings.auto_print === 'true'}
                                            onChange={(e) => handleChange('auto_print', e.target.checked ? 'true' : 'false')}
                                        />
                                        <span className="stSlider"></span>
                                    </label>
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Page Width</span>
                                        <span className="stLabelDesc">Paper roll width</span>
                                    </div>
                                    <Dropdown
                                        options={[
                                            { label: '58mm', value: '58mm' },
                                            { label: '80mm', value: '80mm' }
                                        ]}
                                        value={formSettings.printer_width || '58mm'}
                                        onChange={(val) => handleChange('printer_width', val)}
                                        placeholder="Select Width"
                                        className="stDropdown"
                                        zIndex={50}
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'app' && (
                            <>
                                <div className="stSectionTitle">Application Preferences</div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Show Product Images</span>
                                        <span className="stLabelDesc">Disable to improve performance on low-end devices</span>
                                    </div>
                                    <label className="stToggle">
                                        <input
                                            type="checkbox"
                                            checked={formSettings.show_product_images !== 'false'}
                                            onChange={(e) => handleChange('show_product_images', e.target.checked ? 'true' : 'false')}
                                        />
                                        <span className="stSlider"></span>
                                    </label>
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Dark Mode (Default)</span>
                                        <span className="stLabelDesc">Set dark mode as default on startup</span>
                                    </div>
                                    <label className="stToggle">
                                        <input
                                            type="checkbox"
                                            checked={formSettings.dark_mode === 'true'}
                                            onChange={(e) => handleChange('dark_mode', e.target.checked ? 'true' : 'false')}
                                        />
                                        <span className="stSlider"></span>
                                    </label>
                                </div>

                                <div className="stFormGroup">
                                    <div className="stLabel">
                                        <span className="stLabelTitle">Sound Effects</span>
                                        <span className="stLabelDesc">Play sound on successful bill</span>
                                    </div>
                                    <label className="stToggle">
                                        <input
                                            type="checkbox"
                                            checked={formSettings.sound_enabled === 'true'}
                                            onChange={(e) => handleChange('sound_enabled', e.target.checked ? 'true' : 'false')}
                                        />
                                        <span className="stSlider"></span>
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="stActions">
                            <button className="stButton" onClick={handleDiscard}>Discard Changes</button>
                            <button
                                className="stButton stButtonPrimary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </motion.div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
