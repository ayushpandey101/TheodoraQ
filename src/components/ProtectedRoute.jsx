import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute component to restrict access based on authentication and role
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string|string[]} allowedRoles - Role(s) that can access this route
 * @param {function} onNavigate - Navigation function to redirect unauthorized users
 */
const ProtectedRoute = ({ children, allowedRoles, onNavigate }) => {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        onNavigate('login');
        return;
      }

      // Authenticated but wrong role - redirect based on their role
      if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!roles.includes(user?.role)) {
          // Redirect to their appropriate dashboard
          if (user?.role === 'admin') {
            onNavigate('adminDashboard');
          } else {
            onNavigate('candidateDashboard');
          }
        }
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, onNavigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Check role authorization
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user?.role)) {
      return null; // Will redirect via useEffect
    }
  }

  // Authorized - render children
  return <>{children}</>;
};

export default ProtectedRoute;
