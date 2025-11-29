import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, Reorder } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { StatCard } from '@/components/dashboard/StatCard';
import NeedsAction from '@/components/dashboard/NeedsAction';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import SystemHealth from '@/components/dashboard/SystemHealth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/Icon';
import TournamentListItem from '@/components/TournamentListItem';
import TournamentListItemSkeleton from '@/components/TournamentListItemSkeleton';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalTournaments: 0,
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allUsersData, pendingUsersData, backupData, tournamentData] =
        await Promise.all([
          api.getAllUsers(),
          api.getPendingUsers(),
          api.getBackups(),
          api.getMyTournaments(),
        ]);

      setStats({
        totalUsers: allUsersData.length,
        pendingUsers: pendingUsersData.length,
        totalTournaments: tournamentData.length,
      });
      setPendingUsers(pendingUsersData);
      setBackups(backupData);
      setTournaments(tournamentData);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch dashboard data.'
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recentTournaments = tournaments
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

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
            Super Admin Dashboard
          </h1>
        </div>
      </header>

      <div className='container mx-auto grid grid-cols-1 gap-8 p-4 md:p-8 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <motion.div
            className='grid grid-cols-1 gap-4 sm:grid-cols-3'
            variants={containerVariants}
            initial='hidden'
            animate='show'
          >
            <StatCard
              title='Total Users'
              value={isLoading ? '-' : stats.totalUsers}
              icon='group'
              colorClass='bg-primary-container'
              onColorClass='text-on-primary-container'
            />
            <StatCard
              title='Pending Users'
              value={isLoading ? '-' : stats.pendingUsers}
              icon='how_to_reg'
              colorClass='bg-secondary-container'
              onColorClass='text-on-secondary-container'
            />
            <StatCard
              title='Total Tournaments'
              value={isLoading ? '-' : stats.totalTournaments}
              icon='event'
              colorClass='bg-tertiary-container'
              onColorClass='text-on-tertiary-container'
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className='flex-row items-center justify-between'>
                <CardTitle>Recent Tournaments</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className='flex flex-col gap-3'
                  variants={containerVariants}
                  initial='hidden'
                  animate='show'
                >
                  {isLoading ? (
                    <>
                      <TournamentListItemSkeleton />
                      <TournamentListItemSkeleton />
                    </>
                  ) : recentTournaments.length > 0 ? (
                    <Reorder.Group
                      as='div'
                      axis='y'
                      values={recentTournaments}
                      onReorder={() => {}}
                      className='flex flex-col gap-3'
                    >
                      {recentTournaments.map((tournament) => (
                        <TournamentListItem
                          key={tournament.id}
                          tournament={tournament}
                        />
                      ))}
                    </Reorder.Group>
                  ) : (
                    <div className='flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface'>
                      <Icon
                        name='event_note'
                        className='text-5xl text-on-surface-variant'
                      />
                      <p className='mt-2 font-medium text-on-surface'>
                        No tournaments created yet.
                      </p>
                    </div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className='flex flex-col gap-6 lg:col-span-1'>
          <motion.div variants={itemVariants}>
            <NeedsAction pendingUsers={pendingUsers} pendingMatches={[]} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SystemHealth backups={backups} isLoading={isLoading} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ActivityFeed />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SuperAdminDashboard;
