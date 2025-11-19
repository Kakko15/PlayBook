import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { Loader2, Copy, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { OTP_LENGTH } from '@/lib/constants';
import { navigateAfterLogin } from '@/lib/authUtils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const OtpSetupPage = () => {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    const generateSecret = async () => {
      try {
        const data = await api.generateOtp();
        setSecret(data.secret);
        setQrCodeUrl(data.qrCodeUrl);
      } catch (error) {
        const status = error.response?.status;
        if (status !== 401 && status !== 403) {
          toast.error('Failed to generate 2FA secret. Please refresh.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    generateSecret();
  }, []);

  useEffect(() => {
    if (!isLoading && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isLoading]);

  const verifyOtp = async (code) => {
    if (code.length !== OTP_LENGTH) return;

    setIsVerifying(true);
    try {
      await api.verifyOtpSetup(code);

      const updatedUser = { ...user, otp_enabled: true };
      setUser(updatedUser);
      localStorage.setItem('playbook-user', JSON.stringify(updatedUser));

      toast.success('2FA enabled successfully!');
      navigateAfterLogin(user, navigate);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP code.');
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('Secret key copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className='w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-900/5'
      >
        <div className='bg-green-600 p-8 text-center text-white'>
          <div className='mb-4 flex justify-center'>
            <div className='rounded-full bg-white/20 p-3 backdrop-blur-sm'>
              <Logo size='md' className='text-white' />
            </div>
          </div>
          <h2 className='text-2xl font-bold tracking-tight'>Setup 2FA</h2>
          <p className='mt-2 text-green-100 opacity-90'>
            Secure your account with Two-Factor Authentication
          </p>
        </div>

        <div className='p-8'>
          <div className='mb-8 text-center'>
            <p className='text-sm text-gray-600'>
              Scan the QR code with your authenticator app (e.g., Google
              Authenticator).
            </p>
          </div>

          <div className='mb-8 flex justify-center'>
            {isLoading ? (
              <div className='flex h-48 w-48 items-center justify-center rounded-2xl bg-gray-100'>
                <Loader2 className='h-10 w-10 animate-spin text-green-600' />
              </div>
            ) : (
              <div className='relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200'>
                {qrCodeUrl ? (
                  <QRCode value={qrCodeUrl} size={180} level='L' />
                ) : (
                  <div className='flex h-[180px] w-[180px] items-center justify-center text-sm text-gray-500'>
                    QR Unavailable
                  </div>
                )}
              </div>
            )}
          </div>

          {!isLoading && (
            <div className='mb-8 rounded-xl bg-gray-50 p-4'>
              <p className='mb-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                Manual Entry Key
              </p>
              <div className='flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-gray-200'>
                <code className='font-mono text-sm font-semibold tracking-wide text-gray-800'>
                  {secret}
                </code>
                <button
                  onClick={copyToClipboard}
                  className='rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700'
                  title='Copy to clipboard'
                >
                  {copied ? (
                    <Check className='h-4 w-4 text-green-600' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='space-y-2'>
              <Label htmlFor='otp-0' className='sr-only'>
                Verification Code
              </Label>
              <div
                className='flex justify-center gap-2 sm:gap-3'
                onPaste={handlePaste}
              >
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
                    disabled={isVerifying || isLoading}
                    className={cn(
                      'h-12 w-10 rounded-xl border-gray-200 bg-gray-50 text-center text-xl font-semibold text-gray-900 transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 sm:h-14 sm:w-12 sm:text-2xl',
                      (isVerifying || isLoading) && 'opacity-50'
                    )}
                    autoFocus={index === 0}
                    autoComplete='off'
                  />
                ))}
              </div>
            </div>

            <Button
              type='submit'
              className='group h-12 w-full rounded-full bg-green-600 text-base font-medium text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 hover:shadow-green-600/30 disabled:opacity-70'
              disabled={
                isVerifying || isLoading || otp.join('').length < OTP_LENGTH
              }
            >
              {isVerifying ? (
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              ) : (
                <>
                  Verify & Enable
                  <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpSetupPage;
