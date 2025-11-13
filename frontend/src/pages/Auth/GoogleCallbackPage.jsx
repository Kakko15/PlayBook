import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useOAuthCallback } from '@/hooks/useOAuthCallback';

const GoogleCallbackPage = () => {
  useOAuthCallback(api.googleOAuthLogin, 'Google');

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  );
};

export default GoogleCallbackPage;
