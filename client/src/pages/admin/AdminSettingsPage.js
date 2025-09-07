import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import { adminAPI } from '../../api/services';
import './AdminDashboard.css';

/**
 * AdminSettingsPage Component
 * 
 * What: System settings management interface for administrators
 * When: Admin needs to configure platform settings and preferences
 * Why: Provides centralized configuration management for the platform
 * 
 * Features:
 * - Platform general settings
 * - Email and notification settings
 * - Payment and commission settings
 * - Security and authentication settings
 * - System maintenance settings
 */
const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    general: {
      platformName: '',
      platformDescription: '',
      supportEmail: '',
      maintenanceMode: false,
      registrationEnabled: true
    },
    email: {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      notificationsEnabled: true
    },
    payment: {
      commissionRate: 0,
      paymentMethods: [],
      currencyCode: 'USD',
      minimumBookingAmount: 0
    },
    security: {
      passwordMinLength: 8,
      requireEmailVerification: true,
      maxLoginAttempts: 5,
      sessionTimeout: 30
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch real settings data from API
      const settingsData = await adminAPI.getSettings();
      setSettings(settingsData || settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Save settings via API
      await adminAPI.updateSettings(settings);
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(section, field, arrayValue);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="admin-dashboard-page">
          <div className="admin-main">
            <div className="admin-content">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading settings...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-dashboard-page">
        <div className="admin-main">
          <div className="admin-content">
            <div className="admin-header">
              <div className="header-content">
                <div className="breadcrumb">
                  <span className="breadcrumb-item">Admin</span>
                  <span className="breadcrumb-separator">›</span>
                  <span className="breadcrumb-item current">System Settings</span>
                </div>
                <h1>System Settings</h1>
                <p>Configure platform settings and preferences</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
                <button className="alert-close" onClick={() => setError('')}>×</button>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span>{success}</span>
                <button className="alert-close" onClick={() => setSuccess('')}>×</button>
              </div>
            )}

            {/* Settings Tabs */}
            <div className="admin-card">
              <div className="settings-tabs">
                <button
                  className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  🏢 General
                </button>
                <button
                  className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
                  onClick={() => setActiveTab('email')}
                >
                  📧 Email
                </button>
                <button
                  className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payment')}
                >
                  💳 Payment
                </button>
                <button
                  className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  🔒 Security
                </button>
              </div>
            </div>

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>General Settings</h3>
                  <p>Basic platform configuration</p>
                </div>
                
                <div className="settings-form">
                  <div className="form-group">
                    <label>Platform Name</label>
                    <input
                      type="text"
                      value={settings.general.platformName}
                      onChange={(e) => handleInputChange('general', 'platformName', e.target.value)}
                      placeholder="Enter platform name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Platform Description</label>
                    <textarea
                      value={settings.general.platformDescription}
                      onChange={(e) => handleInputChange('general', 'platformDescription', e.target.value)}
                      placeholder="Enter platform description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Support Email</label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                      placeholder="support@urbanease.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                      />
                      <span>Maintenance Mode</span>
                    </label>
                    <small>Enable to temporarily disable the platform for maintenance</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.general.registrationEnabled}
                        onChange={(e) => handleInputChange('general', 'registrationEnabled', e.target.checked)}
                      />
                      <span>Registration Enabled</span>
                    </label>
                    <small>Allow new users to register on the platform</small>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>Email Settings</h3>
                  <p>SMTP and notification configuration</p>
                </div>
                
                <div className="settings-form">
                  <div className="form-group">
                    <label>SMTP Host</label>
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>SMTP Port</label>
                    <input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleInputChange('email', 'smtpPort', e.target.value)}
                      placeholder="587"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>SMTP Username</label>
                    <input
                      type="text"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>SMTP Password</label>
                    <input
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                      placeholder="Enter SMTP password"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>From Email Address</label>
                    <input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                      placeholder="noreply@urbanease.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.email.notificationsEnabled}
                        onChange={(e) => handleInputChange('email', 'notificationsEnabled', e.target.checked)}
                      />
                      <span>Email Notifications Enabled</span>
                    </label>
                    <small>Enable automated email notifications</small>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>Payment Settings</h3>
                  <p>Payment processing and commission configuration</p>
                </div>
                
                <div className="settings-form">
                  <div className="form-group">
                    <label>Commission Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.payment.commissionRate}
                      onChange={(e) => handleInputChange('payment', 'commissionRate', parseFloat(e.target.value))}
                      placeholder="10.0"
                    />
                    <small>Percentage commission taken from each completed booking</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Payment Methods</label>
                    <input
                      type="text"
                      value={settings.payment.paymentMethods.join(', ')}
                      onChange={(e) => handleArrayChange('payment', 'paymentMethods', e.target.value)}
                      placeholder="credit_card, paypal, stripe"
                    />
                    <small>Comma-separated list of enabled payment methods</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Currency Code</label>
                    <select
                      value={settings.payment.currencyCode}
                      onChange={(e) => handleInputChange('payment', 'currencyCode', e.target.value)}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Minimum Booking Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.payment.minimumBookingAmount}
                      onChange={(e) => handleInputChange('payment', 'minimumBookingAmount', parseFloat(e.target.value))}
                      placeholder="25.00"
                    />
                    <small>Minimum amount required for a booking</small>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>Security Settings</h3>
                  <p>Authentication and security configuration</p>
                </div>
                
                <div className="settings-form">
                  <div className="form-group">
                    <label>Password Minimum Length</label>
                    <input
                      type="number"
                      min="6"
                      max="32"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                      placeholder="8"
                    />
                    <small>Minimum number of characters required for passwords</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.security.requireEmailVerification}
                        onChange={(e) => handleInputChange('security', 'requireEmailVerification', e.target.checked)}
                      />
                      <span>Require Email Verification</span>
                    </label>
                    <small>Require users to verify their email address during registration</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Maximum Login Attempts</label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      placeholder="5"
                    />
                    <small>Number of failed login attempts before account lockout</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      placeholder="30"
                    />
                    <small>Automatic logout after period of inactivity</small>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="admin-card">
              <div className="settings-actions">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save Settings
                    </>
                  )}
                </button>
                
                <button
                  onClick={fetchSettings}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  🔄 Reset to Saved
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettingsPage;
