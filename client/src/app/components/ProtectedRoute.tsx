import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: User['role'][];
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user } = useApp();
  const location = useLocation();

  if (requireAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
