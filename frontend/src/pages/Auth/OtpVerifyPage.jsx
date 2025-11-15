import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { Loader2 } from 'lucide-react';
import { OTP_LENGTH } from '@/lib/constants';
import { cn } from '@/lib/utils';

const OtpVerifyPage = () => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('playbook-otp-email');
    if (!storedEmail) {
      navigate('/login', { replace: true });
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  useEffect(() => {
    if (email && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email]);

  const verifyOtp = async (code) => {
    if (code.length !== OTP_LENGTH) {
      return;
    }

    if (!email) {
      toast.error('Session error. Please try logging in again.');
      navigate('/login', { replace: true });
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

      localStorage.setItem('playbook-token', data.token);
      localStorage.setItem('playbook-user', JSON.stringify(data.user));
      api.setAuthToken(data.token);

      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);

      sessionStorage.removeItem('playbook-otp-email');

      const redirectPath =
        data.user.role === 'super_admin' ? '/superadmin' : '/admin';
      window.location.href = redirectPath;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP code.');
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    await verifyOtp(code);
  };

  const handleChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, '');
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[value.length - 1];
    setOtp(newOtp);

    const code = newOtp.join('');
    if (code.length === OTP_LENGTH) {
      verifyOtp(code);
    } else if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] !== '') {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (paste.length === OTP_LENGTH) {
      const newOtp = paste.split('');
      setOtp(newOtp);
      verifyOtp(paste);
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
          <div className='space-y-2'>
            <Label htmlFor='otp-0' className='sr-only'>
              6-Digit Code
            </Label>
            <div className='flex justify-center gap-2' onPaste={handlePaste}>
              {otp.map((data, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]'
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  ref={(el) => (inputRefs.current[index] = el)}
                  disabled={isLoading || !email}
                  className={cn(
                    'h-14 w-12 rounded-lg text-center text-2xl font-semibold',
                    isLoading && 'opacity-50'
                  )}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <div>
            <Button
              type='submit'
              className='w-full'
              disabled={isLoading || !email || otp.join('').length < OTP_LENGTH}
            >
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
