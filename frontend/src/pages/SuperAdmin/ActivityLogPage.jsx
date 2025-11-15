import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Icon from '@/components/Icon';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return `${Math.floor(seconds)}s ago`;
};

const ActivityItem = ({ icon, color, title, description, time }) => (
  <motion.div
    className='flex items-start gap-3 border-b border-border p-4'
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-variant'>
      <Icon name={icon} className={cn('text-xl', color)} />
    </div>
    <div className='flex-1'>
      <p className='text-sm font-medium text-foreground'>{title}</p>
      <p className='text-sm text-muted-foreground'>{description}</p>
    </div>
    <p className='text-xs text-muted-foreground'>{time}</p>
  </motion.div>
);

const ActivityLogPage = () => {
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllActivity = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAllActivity();
        setActivity(data);
      } catch (error) {
        toast.error('Failed to load activity log.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllActivity();
  }, []);

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold text-foreground'>Full Activity Log</h1>
      <p className='mt-2 text-muted-foreground'>
        A chronological log of all system and user activities.
      </p>

      <div className='mt-8 rounded-lg border border-border bg-card'>
        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : activity.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center'>
            <Icon
              name='notifications_off'
              className='text-5xl text-on-surface-variant'
            />
            <p className='mt-2 text-on-surface-variant'>No activity found.</p>
          </div>
        ) : (
          <div className='max-h-[70vh] overflow-y-auto'>
            {activity.map((item) => (
              <ActivityItem
                key={item.id}
                icon={item.icon}
                color={item.color}
                title={item.title}
                description={item.description}
                time={formatTimeAgo(item.created_at)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
