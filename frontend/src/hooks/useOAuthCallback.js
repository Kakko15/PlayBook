import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  storeAuthData,
  getWelcomeMessage,
  navigateAfterLogin,
} from '@/lib/authUtils';

/**
 * Custom hook for handling OAuth callbacks
 * @param {Function} oauthApiCall - API function to call (e.g., api.googleOAuthLogin)
 * @param {string} providerName - Name of OAuth provider for error messages
 * @returns {Object} Loading state
 */
export const useOAuthCallback = (oauthApiCall, providerName = 'OAuth') => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, user } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      const state = searchParams.get('state');
      const stateData = state ? JSON.parse(decodeURIComponent(state)) : {};
      const welcomeMessage = getWelcomeMessage(
        user,
        stateData.from === 'signup'
      );

      toast.success(welcomeMessage);
      navigateAfterLogin(user, navigate);
      return;
    }

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast.error(`${providerName} authentication cancelled.`);
        navigate('/login');
        return;
      }

      if (!code) {
        toast.error('No authorization code received.');
        navigate('/login');
        return;
      }

      try {
        const data = await oauthApiCall(code);

        // Handle pending approval
        if (data.requiresApproval) {
          toast.success(data.message);
          navigate('/pending-approval');
          return;
        }

        // Handle OTP requirement
        if (data.otpRequired) {
          sessionStorage.setItem('playbook-otp-email', data.email);
          toast.success('Please verify your 2FA code.');
          navigate('/verify-2fa');
          return;
        }

        // Handle successful login
        if (data.token && data.user) {
          storeAuthData(data.token, data.user, api.setAuthToken);
          setUser(data.user);
          toast.success(getWelcomeMessage(data.user));
          navigateAfterLogin(data.user, navigate);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            `${providerName} authentication failed.`
        );
        navigate('/login');
      }
    };

    if (!user) {
      handleCallback();
    }
  }, [searchParams, navigate, setUser, user, oauthApiCall, providerName]);

  return { loading: true };
};
