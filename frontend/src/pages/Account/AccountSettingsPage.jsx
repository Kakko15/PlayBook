import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Icon from '@/components/Icon';
import { cn } from '@/lib/utils';

const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};

const navItems = [
  {
    to: '/account-settings/my-account',
    icon: 'manage_accounts',
    label: 'My Account',
  },
  {
    to: '/account-settings/profile',
    icon: 'account_circle',
    label: 'User Profile',
  },
];

const AccountSettingsPage = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'super_admin' ? '/superadmin' : '/admin';

  return (
    <div className='flex h-screen min-h-screen w-full bg-background'>
      <aside className='flex w-80 flex-shrink-0 flex-col border-r border-outline-variant bg-surface p-4'>
        <div className='flex h-16 items-center px-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate(dashboardPath)}
            className='h-14 w-14 rounded-full'
          >
            <Icon
              name='arrow_back'
              className='text-2xl text-on-surface-variant'
            />
          </Button>
          <span className='ml-4 text-xl font-bold text-on-surface'>
            Settings
          </span>
        </div>

        <div className='mt-6 flex items-center gap-4 rounded-lg bg-surface-variant p-4'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src={profile?.profile_picture_url} alt={user?.name} />
            <AvatarFallback className='bg-primary-container text-on-primary-container'>
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className='overflow-hidden'>
            <p className='truncate font-semibold text-on-surface-variant'>
              {user?.name}
            </p>
            <p className='truncate text-sm text-on-surface-variant/80'>
              {user?.email}
            </p>
          </div>
        </div>

        <nav className='mt-6 flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Button
                key={item.label}
                asChild
                variant='ghost'
                className={cn(
                  'h-14 justify-start rounded-full px-5 text-base',
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
      </aside>
      <main className='flex-1 overflow-y-auto bg-surface-variant/20'>
        <Outlet />
      </main>
    </div>
  );
};

export default AccountSettingsPage;
