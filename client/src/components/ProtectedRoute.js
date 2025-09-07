import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canUserAccess, getDefaultRedirectPath } from '../utils/roleUtils';

/**
 * ProtectedRoute Component
 * 
 * What: Route protection component that enforces role-based access control
 * When: Used to wrap routes that require specific user roles
 * Why: Ensures users can only access pages they're authorized for
 * 
 * Role Access Rules:
 * - Customer: Can access customer/user pages only
 * - Provider: Can access customer/user pages AND provider pages
 * - Admin: Can access customer/user pages AND admin pages
 */
const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, isAuthenticated, loading } = useAuth() || {};
  const location = useLocation();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Loading...</div>
        <div style={{ 
          width: '20px', 
          height: '20px', 
          border: '2px solid #e2e8f0', 
          borderTop: '2px solid #3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  // If no specific roles are required, allow access for authenticated users
  if (allowedRoles.length === 0) {
    return requireAuth ? (isAuthenticated ? children : <Navigate to="/login" />) : children;
  }

  // Check if user has one of the allowed roles
  const userRole = user?.role || 'customer';
  const hasAccess = canUserAccess(userRole, allowedRoles);

  if (!hasAccess) {
    // Redirect based on user role to their default area
    const redirectPath = getDefaultRedirectPath(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
