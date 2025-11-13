import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordConfirmInput = forwardRef(
  (
    {
      value,
      onChange,
      showPassword,
      onTogglePassword,
      matchStatus,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className='relative'>
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          autoComplete='new-password'
          disabled={disabled}
          className='pr-16'
          value={value}
          onChange={onChange}
          {...props}
        />
        <AnimatePresence>
          {matchStatus === 'matching' && (
            <motion.div
              className='absolute inset-y-0 right-10 flex items-center'
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <CheckCircle2 size={20} className='text-green-600' />
            </motion.div>
          )}
          {matchStatus === 'mismatch' && (
            <motion.div
              className='absolute inset-y-0 right-10 flex items-center'
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <XCircle size={20} className='text-destructive' />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type='button'
          tabIndex={-1}
          onClick={onTogglePassword}
          className='text-on-surface-variant absolute inset-y-0 right-0 flex items-center pr-3'
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className='h-5 w-5' />
          ) : (
            <Eye className='h-5 w-5' />
          )}
        </button>
      </div>
    );
  }
);

PasswordConfirmInput.displayName = 'PasswordConfirmInput';

export default PasswordConfirmInput;
