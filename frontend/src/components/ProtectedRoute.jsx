import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps any route that requires authentication and, optionally, a specific role.
 *
 * Props:
 *   children      — the page/component to render when access is granted
 *   requiredRole  — (optional) if provided, the user must have this exact role
 *                   in addition to being authenticated. Unauthorised users are
 *                   redirected to '/' rather than '/login' (they're logged in,
 *                   just not privileged).
 *
 * Flow:
 *   1. Still reading localStorage → render nothing (prevents logged-out flash)
 *   2. Not authenticated         → redirect to /login, preserving destination
 *   3. Wrong role                → redirect to /
 *   4. All clear                 → render children
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
