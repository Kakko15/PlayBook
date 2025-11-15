import { Link, Outlet, useLocation } from 'react-router-dom';
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

const navItems = [
  { to: '/superadmin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/superadmin/users', icon: 'group', label: 'User Management' },
  { to: '/superadmin/system', icon: 'settings', label: 'System' },
  { to: '/superadmin/analytics', icon: 'analytics', label: 'Analytics' },
  { to: '/superadmin/activity', icon: 'manage_history', label: 'Activity Log' },
];

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const { profile } = useAuth();
  const location = useLocation();

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <div className='flex h-screen min-h-screen w-full bg-background'>
      <aside className='flex w-64 flex-col border-r border-outline-variant bg-surface p-4'>
        <Link to='/superadmin' className='mb-6 flex items-center gap-2 px-2'>
          <Logo className='h-8 w-auto' />
          <span className='text-xl font-bold text-on-surface'>PlayBook</span>
        </Link>
        <span className='px-2 text-xs font-medium uppercase text-on-surface-variant'>
          Super Admin
        </span>
        <nav className='mt-2 flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Button
                key={item.label}
                asChild
                variant='ghost'
                className={cn(
                  'h-11 justify-start rounded-full text-base',
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-accent'
                )}
              >
                <Link to={item.to}>
                  <Icon
                    name={item.icon}
                    className={cn('mr-4 text-2xl', isActive && 'filled')}
                  />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
        <div className='mt-auto'>
          <Separator className='my-2' />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant='ghost'
                  className='flex h-12 w-full items-center justify-start gap-2 rounded-full p-2'
                >
                  <Link to='/account-settings'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage
                        src={profile?.profile_picture_url}
                        alt={user?.name}
                      />
                      <AvatarFallback className='bg-primary-container text-on-primary-container'>
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col items-start text-on-surface-variant'>
                      <span className='text-sm font-medium'>{user?.name}</span>
                    </div>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Account Settings</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={logout}
                  className='mt-2 rounded-full'
                >
                  <Icon name='logout' className='text-on-surface-variant' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      <main className='flex-1 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
