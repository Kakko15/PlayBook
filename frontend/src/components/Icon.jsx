import { cn } from '@/lib/utils';

const Icon = ({ name, className, ...props }) => {
  return (
    <span
      className={cn(
        'material-symbols-rounded inline-flex select-none items-center justify-center',
        className
      )}
      {...props}
    >
      {name}
    </span>
  );
};

export default Icon;
