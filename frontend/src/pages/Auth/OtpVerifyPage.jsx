import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { Loader2 } from 'lucide-react';
import { OTP_LENGTH } from '@/lib/constants';

const OtpVerifyPage = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('playbook-otp-email');
    if (!storedEmail) {
      navigate('/login', { replace: true });
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  if (!email) {
    return null;
  }

  const verifyOtp = async (code) => {
    if (code.length !== OTP_LENGTH) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.verifyOtpLogin(email, code);

      if (!data.token || !data.user) {
        toast.error('Invalid response from server');
        setIsLoading(false);
        return;
      }

      // Store credentials in localStorage
      localStorage.setItem('playbook-token', data.token);
      localStorage.setItem('playbook-user', JSON.stringify(data.user));
      api.setAuthToken(data.token);

      // Show success message
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);

      // Clear the OTP email from session storage
      sessionStorage.removeItem('playbook-otp-email');

      // Use window.location to force a full page reload with new auth state
      const redirectPath =
        data.user.role === 'super_admin' ? '/superadmin' : '/admin';
      window.location.href = redirectPath;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP code.');
      setToken('');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await verifyOtp(token);
  };

  const handleTokenChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setToken(value);

    if (value.length === OTP_LENGTH && !isLoading) {
      verifyOtp(value);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='mx-auto w-full max-w-sm text-center'>
        <div className='mb-8 flex justify-center'>
          <Logo size='md' />
        </div>
        <h2 className='mt-6 text-3xl font-bold tracking-tight text-foreground'>
          Two-Factor Verification
        </h2>
        <p className='mt-4 text-base text-muted-foreground'>
          Enter the 6-digit code from your authenticator app.
        </p>

        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          <div className='text-left'>
            <Label htmlFor='token'>6-Digit Code</Label>
            <div className='mt-2'>
              <Input
                id='token'
                name='token'
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                autoComplete='one-time-code'
                autoFocus
                required
                value={token}
                onChange={handleTokenChange}
                disabled={isLoading}
                maxLength={OTP_LENGTH}
                className='text-center text-2xl tracking-[0.3em]'
              />
            </div>
          </div>

          <div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
