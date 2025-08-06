import React, { useState } from 'react';
import Header from '../components/Header';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    dateOfBirth: '1990-05-15',
    bio: 'I love using UrbanEase for all my home service needs. Great platform with reliable providers!',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    language: 'en',
    currency: 'USD',
    timezone: 'EST'
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: '2025-01-15',
    loginActivity: [
      { date: '2025-08-06', time: '10:30 AM', device: 'Windows PC', location: 'New York, NY' },
      { date: '2025-08-05', time: '02:15 PM', device: 'iPhone 13', location: 'New York, NY' },
      { date: '2025-08-04', time: '09:45 AM', device: 'Windows PC', location: 'New York, NY' }
    ]
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (category, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    alert('Password change functionality would be implemented here');
  };

  const handleToggle2FA = () => {
    setSecurityData(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
    alert(`Two-factor authentication ${!securityData.twoFactorEnabled ? 'enabled' : 'disabled'}`);
  };

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>Personal Information</h3>
        <button 
          className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-image-section">
        <div className="profile-image">
          <img src={profileData.profileImage} alt="Profile" />
          {isEditing && (
            <div className="image-upload">
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="profileImage" className="upload-btn">
                📷 Change Photo
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>First Name</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.firstName}</span>
          )}
        </div>

        <div className="form-group">
          <label>Last Name</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.lastName}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          {isEditing ? (
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.email}</span>
          )}
        </div>

        <div className="form-group">
          <label>Phone</label>
          {isEditing ? (
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.phone}</span>
          )}
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          {isEditing ? (
            <input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
          ) : (
            <span className="form-value">{new Date(profileData.dateOfBirth).toLocaleDateString()}</span>
          )}
        </div>

        <div className="form-group full-width">
          <label>Address</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.address}</span>
          )}
        </div>

        <div className="form-group">
          <label>City</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.city}</span>
          )}
        </div>

        <div className="form-group">
          <label>State</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.state}</span>
          )}
        </div>

        <div className="form-group">
          <label>Zip Code</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.zipCode}</span>
          )}
        </div>

        <div className="form-group full-width">
          <label>Bio</label>
          {isEditing ? (
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows="3"
            />
          ) : (
            <span className="form-value">{profileData.bio}</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="profile-section">
      <h3>Preferences & Settings</h3>
      
      <div className="preference-group">
        <h4>Notifications</h4>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.notifications.email}
              onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
            />
            Email Notifications
          </label>
        </div>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.notifications.sms}
              onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
            />
            SMS Notifications
          </label>
        </div>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.notifications.push}
              onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>
      </div>

      <div className="preference-group">
        <h4>Regional Settings</h4>
        <div className="form-group">
          <label>Language</label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences(prev => ({...prev, language: e.target.value}))}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div className="form-group">
          <label>Currency</label>
          <select
            value={preferences.currency}
            onChange={(e) => setPreferences(prev => ({...prev, currency: e.target.value}))}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences(prev => ({...prev, timezone: e.target.value}))}
          >
            <option value="EST">Eastern Time</option>
            <option value="CST">Central Time</option>
            <option value="PST">Pacific Time</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="profile-section">
      <h3>Security & Privacy</h3>
      
      <div className="security-group">
        <h4>Password & Authentication</h4>
        <div className="security-item">
          <div className="security-info">
            <span>Password</span>
            <small>Last changed: {new Date(securityData.lastPasswordChange).toLocaleDateString()}</small>
          </div>
          <button className="security-btn" onClick={handlePasswordChange}>
            Change Password
          </button>
        </div>
        
        <div className="security-item">
          <div className="security-info">
            <span>Two-Factor Authentication</span>
            <small>Add an extra layer of security to your account</small>
          </div>
          <button 
            className={`security-btn ${securityData.twoFactorEnabled ? 'enabled' : ''}`}
            onClick={handleToggle2FA}
          >
            {securityData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      <div className="security-group">
        <h4>Login Activity</h4>
        <div className="activity-list">
          {securityData.loginActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-info">
                <span className="activity-device">{activity.device}</span>
                <span className="activity-location">{activity.location}</span>
              </div>
              <div className="activity-time">
                {activity.date} at {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <Header />
      
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button 
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'preferences' && renderPreferences()}
          {activeTab === 'security' && renderSecurity()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
