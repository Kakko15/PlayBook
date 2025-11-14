import { Outlet, Link } from 'react-router-dom';
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

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { profile } = useAuth();

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <div className='flex h-screen min-h-screen w-full flex-col bg-background'>
      <header className='sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-4 md:px-8'>
        <Link to='/admin' className='flex items-center gap-2'>
          <Logo className='h-8 w-auto' />
          <span className='hidden text-xl font-bold text-on-surface sm:inline-block'>
            PlayBook
          </span>
        </Link>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant='ghost'
                  className='flex items-center gap-2 rounded-full p-2'
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
                    <div className='hidden flex-col items-start text-on-surface-variant sm:flex'>
                      <span className='text-sm font-medium'>{user?.name}</span>
                    </div>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Account Settings</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation='vertical' className='mx-1 h-8' />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={logout}
                  className='rounded-full'
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
      </header>
      <main className='flex-1 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
