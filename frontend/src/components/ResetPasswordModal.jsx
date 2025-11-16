import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PasswordValidationHints from '@/components/PasswordValidationHints';
import PasswordConfirmInput from '@/components/PasswordConfirmInput';
import {
  usePasswordValidation,
  usePasswordMatch,
} from '@/hooks/usePasswordValidation';

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
);

const formSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: 'Password is required.' })
      .regex(passwordValidation, {
        message: 'Password must meet all requirements.',
      }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const ResetPasswordModal = ({ isOpen, onClose, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = form.watch('password');
  const watchedConfirmPassword = form.watch('confirmPassword');

  const { validationState: passwordValidationState, allRulesMet } =
    usePasswordValidation(watchedPassword);
  const matchStatus = usePasswordMatch(
    watchedPassword,
    watchedConfirmPassword,
    allRulesMet
  );

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setShowPassword(false);
      setIsPasswordFocused(false);
    }
  }, [isOpen, form]);

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      await api.resetUserPassword(user.id, values.password);
      toast.success(`Password for ${user.email} has been reset.`);
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for{' '}
            <span className='font-medium text-foreground'>{user?.name}</span> (
            {user?.email}).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 pt-4'
          >
            <FormField
              control={form.control}
              name='password'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='new-password'
                        disabled={isLoading}
                        className='pr-10'
                        aria-invalid={!!fieldState.error}
                        {...field}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => {
                          setIsPasswordFocused(false);
                          field.onBlur();
                        }}
                      />
                      <button
                        type='button'
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant'
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
                  <div className='min-h-[1.25rem] pt-2'>
                    <AnimatePresence mode='wait'>
                      {(isPasswordFocused || field.value.length > 0) && (
                        <PasswordValidationHints
                          key='hints'
                          validationState={passwordValidationState}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordConfirmInput
                      {...field}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      matchStatus={matchStatus}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={
                  isLoading || !allRulesMet || matchStatus !== 'matching'
                }
              >
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Set New Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;
