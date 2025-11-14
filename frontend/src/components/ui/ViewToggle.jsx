import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import Icon from '@/components/Icon';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Checkmark = ({ isActive }) => (
  <motion.span
    key='check'
    initial={false}
    animate={{
      width: isActive ? '1.25rem' : 0,
      marginRight: isActive ? '0.25rem' : 0,
      opacity: isActive ? 1 : 0,
    }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className='overflow-hidden'
  >
    <Icon name='check' className='text-xl' />
  </motion.span>
);

const ViewToggle = ({ view, onViewChange }) => {
  const [isViewShortcutActive, setIsViewShortcutActive] = useState(false);
  const shortcutTimeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && (event.key === 'v' || event.key === 'V')) {
        event.preventDefault();
        setIsViewShortcutActive(true);

        if (shortcutTimeoutRef.current) {
          clearTimeout(shortcutTimeoutRef.current);
        }

        shortcutTimeoutRef.current = setTimeout(() => {
          setIsViewShortcutActive(false);
        }, 2000);
        return;
      }

      if (isViewShortcutActive) {
        if (event.key === 'l' || event.key === 'L') {
          event.preventDefault();
          onViewChange('list');
          setIsViewShortcutActive(false);
          if (shortcutTimeoutRef.current)
            clearTimeout(shortcutTimeoutRef.current);
        } else if (event.key === 'g' || event.key === 'G') {
          event.preventDefault();
          onViewChange('grid');
          setIsViewShortcutActive(false);
          if (shortcutTimeoutRef.current)
            clearTimeout(shortcutTimeoutRef.current);
        } else {
          setIsViewShortcutActive(false);
          if (shortcutTimeoutRef.current)
            clearTimeout(shortcutTimeoutRef.current);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (shortcutTimeoutRef.current) {
        clearTimeout(shortcutTimeoutRef.current);
      }
    };
  }, [isViewShortcutActive, onViewChange]);

  const baseStyles =
    'relative inline-flex h-9 items-center justify-center rounded-full transition-colors duration-200 ease-out';
  const activeStyles = 'bg-secondary-container text-on-secondary-container';
  const inactiveStyles = 'text-muted-foreground hover:bg-accent';

  return (
    <TooltipProvider>
      <div className='flex items-center rounded-full border border-outline-variant p-0.5'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onViewChange('list')}
              className={cn(
                baseStyles,
                'px-2.5 transition-all duration-300 ease-out',
                view === 'list' ? activeStyles : inactiveStyles
              )}
              aria-label='List view'
              data-state={view === 'list' ? 'active' : 'inactive'}
            >
              <div className='flex items-center'>
                <Checkmark isActive={view === 'list'} />
                <Icon name='format_list_bulleted' className='text-xl' />
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            <p>List layout (Alt+V then L)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onViewChange('grid')}
              className={cn(
                baseStyles,
                'px-2.5 transition-all duration-300 ease-out',
                view === 'grid' ? activeStyles : inactiveStyles
              )}
              aria-label='Grid view'
              data-state={view === 'grid' ? 'active' : 'inactive'}
            >
              <div className='flex items-center'>
                <Checkmark isActive={view === 'grid'} />
                <Icon name='grid_view' className='text-xl' />
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            <p>Grid layout (Alt+V then G)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ViewToggle;
