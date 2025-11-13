import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import AuthLayout from '@/components/AuthLayout';
import OAuthButtons from '@/components/OAuthButtons';
import ParticleBackground from '@/components/ParticleBackground';
import { itemVariants } from '@/lib/animations';
import { getWelcomeMessage, navigateAfterLogin } from '@/lib/authUtils';

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email('Please enter a valid email.'),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const from = location.state?.from?.pathname || '/admin';

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);

    if (!executeRecaptcha) {
      toast.error('reCAPTCHA not ready. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('login');
      const { otpRequired, user } = await login(
        values.email,
        values.password,
        recaptchaToken
      );

      if (otpRequired) {
        toast.success('Login successful. Please verify your 2FA code.');
        navigate('/verify-2fa');
      } else if (user) {
        toast.success(getWelcomeMessage(user));
        navigateAfterLogin(user, navigate, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ParticleBackground numParticles={60} />
      <AuthLayout
        title='Sign in to your account'
        description={
          <>
            Don't have an account?{' '}
            <Link
              to='/signup'
              className='font-semibold text-primary hover:text-primary/90'
              replace
            >
              Sign up
            </Link>
          </>
        }
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
            noValidate
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete='email'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <div className='text-sm'>
                      <Link
                        to='/reset-password'
                        className='font-semibold text-primary hover:text-primary/90'
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='current-password'
                        disabled={isLoading}
                        className='pr-10'
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <button
                        type='button'
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className='text-on-surface-variant absolute inset-y-0 right-0 flex items-center pr-3'
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className='h-5 w-5' />
                        ) : (
                          <Eye className='h-5 w-5' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <motion.div variants={itemVariants} className='pt-2'>
              <Button
                type='submit'
                className='w-full'
                size='lg'
                disabled={isLoading}
              >
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </motion.div>
          </form>
        </Form>

        <motion.div variants={itemVariants} className='mt-8'>
          <div className='relative'>
            <div
              className='absolute inset-0 flex items-center'
              aria-hidden='true'
            >
              <div className='w-full border-t border-outline-variant' />
            </div>
            <div className='relative flex justify-center text-sm font-medium leading-6'>
              <span className='bg-surface px-6 text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>

          <OAuthButtons disabled={isLoading} from='login' />
        </motion.div>
      </AuthLayout>
    </>
  );
};

export default LoginPage;
