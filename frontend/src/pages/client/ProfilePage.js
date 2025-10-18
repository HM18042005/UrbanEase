import { useEffect, useState } from 'react';

import * as Auth from '../../api/auth';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
  });

  // Load user profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await Auth.getProfile();
        const userData = response.user;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await Auth.updateProfile(profileData);
      setIsEditing(false);
      // Update local state with server response
      const userData = response.user;
      setProfileData((prev) => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zipCode: userData.zipCode || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
      }));
      alert('Profile updated successfully!');
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>Personal Information</h3>
        <button
          className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={loading}
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          {isEditing ? (
            <input
              type="text"
              id="name"
              value={profileData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.name || 'Not provided'}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          {isEditing ? (
            <input
              type="email"
              id="email"
              value={profileData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.email || 'Not provided'}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              id="phone"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.phone || 'Not provided'}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          {isEditing ? (
            <input
              type="date"
              id="dateOfBirth"
              value={profileData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
          ) : (
            <span className="form-value">
              {profileData.dateOfBirth
                ? new Date(profileData.dateOfBirth).toLocaleDateString()
                : 'Not provided'}
            </span>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="address">Address</label>
          {isEditing ? (
            <input
              type="text"
              id="address"
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          ) : (
            <span className="form-value" id="addressValue">
              {profileData.address || 'Not provided'}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          {isEditing ? (
            <input
              type="text"
              id="city"
              value={profileData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.city || 'Not provided'}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="state">State</label>
          {isEditing ? (
            <input
              type="text"
              id="state"
              value={profileData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.state || 'Not provided'}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="zipCode">Zip Code</label>
          {isEditing ? (
            <input
              type="text"
              id="zipCode"
              value={profileData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
            />
          ) : (
            <span className="form-value">{profileData.zipCode || 'Not provided'}</span>
          )}
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
          <p>Manage your account information</p>
        </div>

        {loading && !isEditing && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading profile...</div>
        )}

        <div className="profile-content">{!loading && renderPersonalInfo()}</div>
      </div>
    </div>
  );
};

export default ProfilePage;
