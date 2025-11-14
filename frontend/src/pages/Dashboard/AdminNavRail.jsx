import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import Icon from '@/components/Icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  {
    to: '/admin/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    exact: true,
  },
  {
    to: '/admin/tournaments',
    icon: 'emoji_events',
    label: 'Tournaments',
    exact: false,
  },
];

const NavItem = ({ to, icon, label, isActive, isCollapsed }) => {
  const content = (
    <div className='flex items-center gap-4'>
      <Icon name={icon} className={cn('text-2xl', isActive && 'filled')} />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
            exit={{ opacity: 0 }}
            className='whitespace-nowrap'
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant='ghost'
          className={cn(
            'h-14 justify-start rounded-full px-5 text-base',
            isActive
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-accent',
            isCollapsed && 'w-14 justify-center px-0'
          )}
        >
          <Link to={to}>{content}</Link>
        </Button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side='right'>
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

const AdminNavRail = () => {
  const { user, logout, profile } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 88 : 288 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className='flex h-screen flex-shrink-0 flex-col overflow-x-hidden border-r border-outline-variant bg-surface p-3'
      >
        <div className='flex h-16 items-center px-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='h-14 w-14 rounded-full'
          >
            <Icon name='menu' className='text-2xl text-on-surface-variant' />
          </Button>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                exit={{ opacity: 0 }}
                className='ml-2 flex items-center gap-2'
              >
                <Logo className='h-8 w-auto' />
                <span className='text-xl font-bold text-on-surface'>
                  PlayBook
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className='mt-4 flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </nav>

        <div className='mt-auto'>
          <Separator className='my-2' />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant='ghost'
                className={cn(
                  'flex h-14 w-full items-center justify-start gap-3 rounded-full p-2.5',
                  isCollapsed && 'w-14 justify-center p-0'
                )}
              >
                <Link to='/account-settings'>
                  <Avatar className='h-10 w-10 flex-shrink-0'>
                    <AvatarImage
                      src={profile?.profile_picture_url}
                      alt={user?.name}
                    />
                    <AvatarFallback className='bg-primary-container text-on-primary-container'>
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: 0.1 },
                        }}
                        exit={{ opacity: 0 }}
                        className='flex flex-col items-start overflow-hidden'
                      >
                        <span className='truncate text-sm font-medium text-on-surface'>
                          {user?.name}
                        </span>
                        <span className='truncate text-xs text-on-surface-variant'>
                          {user?.email}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side='right'>
                <p>{user?.name}</p>
                <p>Account Settings</p>
              </TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                onClick={logout}
                className={cn(
                  'mt-1 h-14 w-full justify-start rounded-full px-5 text-base text-on-surface-variant hover:bg-accent',
                  isCollapsed && 'w-14 justify-center px-0'
                )}
              >
                <Icon name='logout' className='text-2xl' />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                      exit={{ opacity: 0 }}
                      className='ml-4 whitespace-nowrap'
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side='right'>
                <p>Logout</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default AdminNavRail;
