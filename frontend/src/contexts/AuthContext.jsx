import { createContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import eventBus from '@/lib/eventBus';
import Loader from '@/components/Loader';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutPath, setLogoutPath] = useState('/login');

  const fetchProfile = async () => {
    try {
      const profileData = await api.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch profile in context', error);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setLogoutPath('/login');
    localStorage.removeItem('playbook-token');
    localStorage.removeItem('playbook-user');
    sessionStorage.removeItem('playbook-otp-email');
    api.setAuthToken(null);
    eventBus.dispatch('sessionEnded', { path: '/login' });
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Fetch CSRF token first
        await api.getHealth();
      } catch (error) {
        console.error('Failed to initialize session. CSRF might fail.', error);
      }

      const token = localStorage.getItem('playbook-token');
      const storedUser = localStorage.getItem('playbook-user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          api.setAuthToken(token);
          await fetchProfile();
        } catch (error) {
          console.error('Failed to parse user from localStorage', error);
          localStorage.removeItem('playbook-token');
          localStorage.removeItem('playbook-user');
        }
      }
      setLoading(false);

      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 300);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const userChannel = supabase
      .channel(`user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('User delete event received', payload);
          toast.error('Your account has been deleted by an administrator.');
          setLogoutPath('/deleted');
          eventBus.dispatch('sessionEnded', { path: '/deleted' });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.status === 'suspended') {
            console.log('User suspend event received', payload);
            toast.error('Your account has been suspended.');
            setLogoutPath('/suspended');
            eventBus.dispatch('sessionEnded', { path: '/suspended' });
          }
        }
      )
      .subscribe();

    // Polling check every 3 seconds to verify user still exists
    const checkUserStatus = async () => {
      try {
        await api.getProfile();
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || '';

        if (status === 401 || status === 403) {
          if (message.includes('User not found')) {
            console.log('User account no longer exists (polling check)');
            toast.error('Your account has been deleted by an administrator.');
            setLogoutPath('/deleted');
            eventBus.dispatch('sessionEnded', { path: '/deleted' });
          } else if (message.includes('suspended')) {
            console.log('User account suspended (polling check)');
            toast.error('Your account has been suspended.');
            setLogoutPath('/suspended');
            eventBus.dispatch('sessionEnded', { path: '/suspended' });
          }
        }
      }
    };

    const pollInterval = setInterval(checkUserStatus, 1000);

    return () => {
      if (userChannel) {
        supabase.removeChannel(userChannel);
      }
      clearInterval(pollInterval);
    };
  }, [user]);

  const login = async (email, password) => {
    // Ensure CSRF token is fresh before login
    try {
      await api.getHealth();
    } catch (error) {
      console.error('Failed to fetch CSRF token before login', error);
    }

    const data = await api.login(email, password);

    if (data.otpRequired) {
      sessionStorage.setItem('playbook-otp-email', email);
      return { otpRequired: true };
    }

    if (data.token && data.user) {
      localStorage.setItem('playbook-token', data.token);
      localStorage.setItem('playbook-user', JSON.stringify(data.user));
      api.setAuthToken(data.token);
      setUser(data.user);
      await fetchProfile();
      return { user: data.user, otpRequired: false };
    }

    return data;
  };

  const signup = async (name, email, password, recaptchaToken) => {
    const data = await api.signup(name, email, password, recaptchaToken);
    return data;
  };

  const completeOtpLogin = async (token, user) => {
    localStorage.setItem('playbook-token', token);
    localStorage.setItem('playbook-user', JSON.stringify(user));
    api.setAuthToken(token);
    setUser(user);
    await fetchProfile();
  };

  const value = {
    user,
    setUser,
    profile,
    setProfile,
    logoutPath,
    loading,
    login,
    signup,
    logout,
    completeOtpLogin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
