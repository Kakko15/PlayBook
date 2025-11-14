import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import StatCard from '@/components/dashboard/StatCard';
import NeedsAction from '@/components/dashboard/NeedsAction';
import QuickActions from '@/components/dashboard/QuickActions';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import { USER_ROLES } from '@/lib/constants';

const getStatus = (startDate) => {
  if (!startDate) return { text: 'Pending' };
  const now = new Date();
  const start = new Date(startDate);
  if (start > now) return { text: 'Upcoming' };
  return { text: 'Ongoing' };
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, ongoing: 0, upcoming: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const tournamentDataPromise = api.getMyTournaments();
      const pendingUsersPromise =
        user.role === USER_ROLES.SUPER_ADMIN
          ? api.getPendingUsers()
          : Promise.resolve([]);

      const [data, pendingData] = await Promise.all([
        tournamentDataPromise,
        pendingUsersPromise,
      ]);

      setPendingUsers(pendingData);

      const ongoing = data.filter(
        (t) => getStatus(t.start_date).text === 'Ongoing'
      ).length;
      const upcoming = data.filter(
        (t) => getStatus(t.start_date).text === 'Upcoming'
      ).length;
      setStats({
        total: data.length,
        ongoing,
        upcoming,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <motion.div
      className='relative'
      initial='hidden'
      animate='show'
      variants={containerVariants}
    >
      <header className='sticky top-0 z-10 border-b border-outline-variant bg-surface/80 px-4 py-4 backdrop-blur-sm md:px-8'>
        <div className='container mx-auto'>
          <h1 className='font-sans text-2xl font-bold tracking-tight text-on-surface'>
            Dashboard
          </h1>
        </div>
      </header>

      <div className='container mx-auto grid grid-cols-1 gap-8 p-4 md:p-8 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <WelcomeBanner />

          <motion.div
            className='grid grid-cols-1 gap-4 sm:grid-cols-3'
            variants={containerVariants}
            initial='hidden'
            animate='show'
          >
            <StatCard
              title='Total Tournaments'
              value={isLoading ? '-' : stats.total}
              icon='event'
              colorClass='bg-primary-container'
              onColorClass='text-on-primary-container'
            />
            <StatCard
              title='Ongoing'
              value={isLoading ? '-' : stats.ongoing}
              icon='play_circle'
              colorClass='bg-secondary-container'
              onColorClass='text-on-secondary-container'
            />
            <StatCard
              title='Upcoming'
              value={isLoading ? '-' : stats.upcoming}
              icon='pending'
              colorClass='bg-tertiary-container'
              onColorClass='text-on-tertiary-container'
            />
          </motion.div>
        </div>

        <div className='flex flex-col gap-6 lg:col-span-1'>
          <NeedsAction pendingUsers={pendingUsers} />
          <QuickActions />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
