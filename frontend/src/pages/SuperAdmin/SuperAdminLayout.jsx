import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
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
import ProfilePictureManager from '@/components/ProfilePictureManager';
import api from '@/lib/api';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { to: '/superadmin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/superadmin/users', icon: 'group', label: 'User Management' },
  {
    to: '/superadmin/departments',
    icon: 'school',
    label: 'Departments',
  },
  { to: '/superadmin/system', icon: 'settings', label: 'System' },
  { to: '/superadmin/activity', icon: 'manage_history', label: 'Activity Log' },
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

import { useTheme } from '@/hooks/useTheme';

const SuperAdminLayout = () => {
  const { user, logout, profile, setProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);

  const handleProfileUpdate = async (imageBase64) => {
    try {
      if (imageBase64) {
        const { user: updatedUser } =
          await api.updateProfilePicture(imageBase64);
        setProfile((prev) => ({
          ...prev,
          profile_picture_url: updatedUser.profile_picture_url,
        }));
      } else {
        await api.removeProfilePicture();
        setProfile((prev) => ({
          ...prev,
          profile_picture_url: null,
        }));
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    }
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <div className='flex h-screen min-h-screen w-full bg-background'>
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
                  className='ml-2 flex flex-col'
                >
                  <div className='flex items-center gap-2'>
                    <Logo className='h-8 w-auto' />
                    <span className='text-xl font-bold text-on-surface'>
                      PlayBook
                    </span>
                  </div>
                  <span className='px-1 text-xs font-medium uppercase text-on-surface-variant'>
                    Super Admin
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <nav className='mt-4 flex flex-col gap-1'>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
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
        </motion.aside>
      </TooltipProvider>

      <div className='flex flex-1 flex-col overflow-hidden'>
        <header className='sticky top-0 z-10 flex h-16 items-center justify-end border-b border-outline-variant bg-surface px-6 py-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='relative h-10 w-10 rounded-full p-0 hover:bg-transparent'
              >
                <Avatar className='h-10 w-10 border border-outline-variant'>
                  <AvatarImage
                    src={profile?.profile_picture_url}
                    alt={user?.name}
                  />
                  <AvatarFallback className='bg-primary-container text-on-primary-container'>
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-72 p-0' align='end' forceMount>
              <DropdownMenuLabel className='bg-surface-variant/30 p-4 font-normal'>
                <div className='flex flex-col items-center space-y-2'>
                  <div className='relative'>
                    <Avatar className='h-16 w-16 border-2 border-primary'>
                      <AvatarImage
                        src={profile?.profile_picture_url}
                        alt={user?.name}
                      />
                      <AvatarFallback className='bg-primary-container text-xl text-on-primary-container'>
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsProfileManagerOpen(true);
                      }}
                      className='text-on-primary absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md hover:bg-primary/90'
                    >
                      <Icon name='photo_camera' className='h-3 w-3' />
                    </button>
                  </div>
                  <div className='flex flex-col items-center text-center'>
                    <p className='text-sm font-medium leading-none text-on-surface'>
                      {user?.name}
                    </p>
                    <p className='text-xs leading-none text-on-surface-variant'>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='my-0' />
              <div className='p-2'>
                <DropdownMenuItem asChild className='rounded-md p-3'>
                  <Link to='/account-settings' className='cursor-pointer'>
                    <Icon
                      name='person'
                      className='mr-3 h-5 w-5 text-on-surface-variant'
                    />
                    <span className='text-sm font-medium'>
                      Account Settings
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    className='cursor-pointer rounded-md p-3'
                    chevron={null}
                  >
                    <Icon
                      name='palette'
                      className='mr-3 h-5 w-5 text-on-surface-variant'
                    />
                    <span className='text-sm font-medium'>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className='w-40 p-1'>
                      <DropdownMenuItem
                        onClick={() => setTheme('light')}
                        className='cursor-pointer rounded-sm'
                      >
                        <Icon name='light_mode' className='mr-2 h-4 w-4' />
                        <span>Light</span>
                        {theme === 'light' && (
                          <Icon name='check' className='ml-auto h-4 w-4' />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme('dark')}
                        className='cursor-pointer rounded-sm'
                      >
                        <Icon name='dark_mode' className='mr-2 h-4 w-4' />
                        <span>Dark</span>
                        {theme === 'dark' && (
                          <Icon name='check' className='ml-auto h-4 w-4' />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme('system')}
                        className='cursor-pointer rounded-sm'
                      >
                        <Icon name='laptop' className='mr-2 h-4 w-4' />
                        <span>System</span>
                        {theme === 'system' && (
                          <Icon name='check' className='ml-auto h-4 w-4' />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem
                  onClick={logout}
                  className='text-error cursor-pointer rounded-md p-3'
                >
                  <Icon name='logout' className='mr-3 h-5 w-5' />
                  <span className='text-sm font-medium'>Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className='flex-1 overflow-y-auto'>
          <Outlet />
        </main>
      </div>
      <ProfilePictureManager
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        onSuccess={handleProfileUpdate}
        currentImage={profile?.profile_picture_url}
      />
    </div>
  );
};

export default SuperAdminLayout;
