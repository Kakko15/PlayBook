import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import TournamentCard from '@/components/TournamentCard';
import TournamentCardSkeleton from '@/components/TournamentCardSkeleton';
import Logo from '@/components/Logo';
import Icon from '@/components/Icon';
import { Button } from '@/components/ui/button';
import { containerVariants } from '@/lib/animations';

const PublicTournamentListPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        const data = await api.getPublicTournaments();
        setTournaments(data);
      } catch (error) {
        toast.error('Failed to fetch tournaments.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <motion.div
          key='loading'
          className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
        >
          <TournamentCardSkeleton />
          <TournamentCardSkeleton />
          <TournamentCardSkeleton />
        </motion.div>
      );
    }

    if (tournaments.length === 0) {
      return (
        <motion.div
          key='empty'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface-variant'
        >
          <Icon
            name='event_note'
            className='text-6xl text-on-surface-variant'
          />
          <h3 className='mt-4 text-xl font-semibold text-on-surface'>
            No Active Tournaments
          </h3>
          <p className='mt-2 text-on-surface-variant'>
            Check back soon for upcoming events!
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        key='tournaments'
        className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
        variants={containerVariants}
        initial='hidden'
        animate='show'
      >
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            isPublic={true}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <motion.header
        className='sticky left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-outline-variant bg-background/80 p-4 px-4 backdrop-blur-sm md:px-8'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Link to='/' className='group flex items-center gap-2'>
          <Logo className='h-8 w-auto transition-transform group-hover:scale-110' />
          <span className='text-xl font-bold text-foreground transition-colors group-hover:text-primary'>
            PlayBook
          </span>
        </Link>
        <Button asChild variant='ghost'>
          <Link to='/login'>Admin Login</Link>
        </Button>
      </motion.header>

      <main className='container mx-auto max-w-7xl flex-1 p-4 pt-24 md:p-8'>
        <h1 className='font-sans text-4xl font-bold tracking-tight text-on-surface'>
          Active Tournaments
        </h1>
        <p className='mt-2 text-lg text-on-surface-variant'>
          Browse schedules, standings, and results for all ISU events.
        </p>

        <div className='my-8'>
          <AnimatePresence mode='wait'>{renderContent()}</AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PublicTournamentListPage;
