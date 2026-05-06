import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthSession } from '../../hooks/useAuthSession';

export default function ProtectedRoute({ children, requireRole }) {
  const auth = useAuthSession();
  const authSession = auth?.authSession;

  if (!authSession) {
    return <Navigate to="/auth" replace state={{ reason: 'auth-required' }} />;
  }

  if (requireRole && authSession.user?.role?.toLowerCase() !== requireRole?.toLowerCase()) {
    return <Navigate to="/auth" replace state={{ reason: 'admin-required' }} />;
  }

  return children;
}
