import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/Icon';
import { motion } from 'framer-motion';

const SessionExpiredModal = () => {
  const { isSessionExpiredModalOpen, setIsSessionExpiredModalOpen } = useAuth();
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    setIsSessionExpiredModalOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <Dialog open={isSessionExpiredModalOpen}>
      <DialogContent
        className='sm:max-w-[425px]'
        onInteractOutside={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <DialogHeader className='text-center sm:text-center'>
          <div className='mb-4 flex justify-center'>
            <motion.div
              animate={{ rotate: [0, 5, -5, 5, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon name='timer' className='text-8xl text-primary' />
            </motion.div>
          </div>
          <DialogTitle className='text-center text-2xl'>
            Session Expired
          </DialogTitle>
          <DialogDescription className='text-center'>
            You've been logged out due to inactivity. Please sign in again to
            continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleLoginRedirect} className='w-full'>
            Back to Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiredModal;
