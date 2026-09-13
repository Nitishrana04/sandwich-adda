import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role doesn't match required role, redirect them to their own dashboard
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'RIDER') {
      return <Navigate to="/rider" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
