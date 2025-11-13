import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const hasError = props['aria-invalid'] === true;

  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-lg border bg-transparent px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
        'focus-visible:border-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError
          ? 'border-destructive focus-visible:border-destructive'
          : 'border-outline focus-visible:border-primary',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
