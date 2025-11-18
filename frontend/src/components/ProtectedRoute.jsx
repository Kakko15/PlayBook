import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '@/components/Loader';
import { useEffect, useRef } from 'react';

const ProtectedRoute = ({ children, role }) => {
  const { user, logoutPath, loading, isSessionExpiredModalOpen } = useAuth();
  const location = useLocation();

  const wasLoggedIn = useRef(!!user);

  useEffect(() => {
    if (user) {
      wasLoggedIn.current = true;
    }
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  if (!user && !isSessionExpiredModalOpen) {
    if (wasLoggedIn.current) {
      return null;
    }
    return <Navigate to={logoutPath} state={{ from: location }} replace />;
  }

  if (!user && isSessionExpiredModalOpen) {
    return children;
  }

  if (!user.otp_enabled) {
    if (location.pathname !== '/setup-2fa') {
      return <Navigate to='/setup-2fa' state={{ from: location }} replace />;
    }
  }

  if (role && user.role !== role) {
    if (user.role === 'super_admin')
      return <Navigate to='/superadmin' replace />;
    if (user.role === 'admin') return <Navigate to='/admin' replace />;
    if (user.role === 'scorer') return <Navigate to='/scorer' replace />;
    return <Navigate to='/' replace />;
  }

  return children;
};

export default ProtectedRoute;
