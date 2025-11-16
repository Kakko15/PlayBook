import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import Icon from '@/components/Icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ScorerLayout = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className='flex h-screen min-h-screen w-full flex-col bg-background'>
        <header className='flex h-16 flex-shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-4 md:px-8'>
          <Link to='/scorer' className='flex items-center gap-2'>
            <Logo className='h-8 w-auto' />
            <span className='text-xl font-bold text-on-surface'>PlayBook</span>
            <span className='ml-2 rounded-md bg-secondary-container px-2 py-0.5 text-sm font-medium text-on-secondary-container'>
              Scorer
            </span>
          </Link>
          <div className='flex items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant='ghost'
                  className='flex h-12 w-12 items-center justify-center rounded-full p-0'
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
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                <p>{user?.name}</p>
                <p>Account Settings</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={logout}
                  className='h-12 w-12 rounded-full'
                >
                  <Icon name='logout' className='text-2xl' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>
        <main className='flex-1 overflow-y-auto bg-surface-variant/20 p-4 md:p-8'>
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
};

export default ScorerLayout;
