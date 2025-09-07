import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRedirectPath } from '../utils/roleUtils';

/**
 * RoleBasedRedirect Component
 * 
 * What: Redirects users to their appropriate dashboard based on their role
 * When: Used on login success or when accessing the root path
 * Why: Ensures users land on the right page for their role
 */
const RoleBasedRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth() || {};
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while still loading user data
    if (loading) return;
    
    if (isAuthenticated && user?.role) {
      const redirectPath = getDefaultRedirectPath(user.role);
      navigate(redirectPath, { replace: true });
    } else if (!loading && !isAuthenticated) {
      navigate('/landing', { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate, loading]);

  // Show loading state while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div>Redirecting...</div>
      <div style={{ 
        width: '20px', 
        height: '20px', 
        border: '2px solid #e2e8f0', 
        borderTop: '2px solid #3b82f6', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default RoleBasedRedirect;
