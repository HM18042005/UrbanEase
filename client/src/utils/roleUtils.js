/**
 * Role-based Access Control Utilities
 * 
 * What: Utility functions for managing user roles and permissions
 * When: Used throughout the application to check user access rights
 * Why: Centralizes role-based logic and ensures consistent permission checking
 */

// Define role hierarchies and access levels
export const ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider', 
  ADMIN: 'admin'
};

// Define which roles can access which areas
export const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: {
    canAccess: ['customer', 'user'],
    defaultRedirect: '/home'
  },
  [ROLES.PROVIDER]: {
    canAccess: ['customer', 'user', 'provider'],
    defaultRedirect: '/provider'
  },
  [ROLES.ADMIN]: {
    canAccess: ['customer', 'user', 'admin'],
    defaultRedirect: '/admin'
  }
};

/**
 * Check if a user can access a specific route based on their role
 * @param {string} userRole - The user's role
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 * @returns {boolean} - Whether the user can access the route
 */
export const canUserAccess = (userRole, allowedRoles) => {
  if (!userRole || allowedRoles.length === 0) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Get the default redirect path for a user based on their role
 * @param {string} userRole - The user's role
 * @returns {string} - The default path to redirect to
 */
export const getDefaultRedirectPath = (userRole) => {
  return ROLE_PERMISSIONS[userRole]?.defaultRedirect || '/home';
};

/**
 * Check if a user is authorized to view/access certain navigation items
 * @param {string} userRole - The user's role
 * @param {string} targetArea - The area they want to access (e.g., 'provider', 'admin')
 * @returns {boolean} - Whether they can see/access that area
 */
export const canAccessArea = (userRole, targetArea) => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions?.canAccess.includes(targetArea) || false;
};

/**
 * Validate if a route path is accessible by a user role
 * @param {string} path - The route path
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the route is accessible
 */
export const isRouteAccessible = (path, userRole) => {
  // Public routes (no authentication required)
  const publicRoutes = ['/', '/login', '/register'];
  if (publicRoutes.includes(path)) return true;

  // User/Customer routes (accessible by all authenticated users)
  const userRoutes = ['/home', '/services', '/service', '/bookings', '/profile'];
  const isUserRoute = userRoutes.some(route => path.startsWith(route));
  if (isUserRoute) {
    return userRole && Object.values(ROLES).includes(userRole);
  }

  // Provider routes (only for providers)
  if (path.startsWith('/provider')) {
    return userRole === ROLES.PROVIDER;
  }

  // Admin routes (only for admins)
  if (path.startsWith('/admin')) {
    return userRole === ROLES.ADMIN;
  }

  return false;
};
