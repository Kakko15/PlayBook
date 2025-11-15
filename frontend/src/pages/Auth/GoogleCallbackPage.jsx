import Loader from '@/components/Loader';
import api from '@/lib/api';
import { useOAuthCallback } from '@/hooks/useOAuthCallback';

const GoogleCallbackPage = () => {
  useOAuthCallback(api.googleOAuthLogin, 'Google');

  return <Loader />;
};

export default GoogleCallbackPage;
