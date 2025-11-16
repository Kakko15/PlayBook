import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '@/components/Loader';

const ProtectedRoute = ({ children, role }) => {
  const { user, logoutPath, loading, isSessionExpiredModalOpen } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user && !isSessionExpiredModalOpen) {
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

  if (role === 'super_admin' && user.role !== 'super_admin') {
    return <Navigate to='/admin' replace />;
  }

  if (role === 'admin' && user.role === 'super_admin') {
    return <Navigate to='/superadmin' replace />;
  }

  return children;
};

export default ProtectedRoute;
