import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { Loader2 } from 'lucide-react';

const OtpVerifyPage = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('📧 OtpVerifyPage useEffect running');
    const storedEmail = sessionStorage.getItem('playbook-otp-email');
    console.log('📧 Stored email in session:', storedEmail);
    if (!storedEmail) {
      console.log('⚠️ No email found, redirecting to login');
      navigate('/login', { replace: true });
    } else {
      console.log('✅ Email found, setting state');
      setEmail(storedEmail);
    }
  }, [navigate]);

  if (!email) {
    return null;
  }

  const verifyOtp = async (code) => {
    if (code.length !== 6) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Starting OTP verification for email:', email);
      const data = await api.verifyOtpLogin(email, code);
      console.log('✅ OTP verification response:', data);

      if (!data.token || !data.user) {
        console.error('❌ Missing token or user in response:', data);
        toast.error('Invalid response from server');
        setIsLoading(false);
        return;
      }

      // Store credentials in localStorage
      console.log('💾 Storing credentials in localStorage');
      localStorage.setItem('playbook-token', data.token);
      localStorage.setItem('playbook-user', JSON.stringify(data.user));
      api.setAuthToken(data.token);

      // Show success message
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);

      // Clear the OTP email from session storage
      console.log('🧹 Clearing session storage');
      sessionStorage.removeItem('playbook-otp-email');

      // Use window.location to force a full page reload with new auth state
      const redirectPath =
        data.user.role === 'super_admin' ? '/superadmin' : '/admin';
      console.log('🚀 Redirecting to:', redirectPath);
      window.location.href = redirectPath;
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      console.error('Error response:', error.response?.data);
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
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);

    if (value.length === 6 && !isLoading) {
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
                maxLength={6}
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
