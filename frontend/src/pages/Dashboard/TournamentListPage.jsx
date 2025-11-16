import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button, buttonVariants } from '@/components/ui/button';
import TournamentCard from '@/components/TournamentCard';
import TournamentCardSkeleton from '@/components/TournamentCardSkeleton';
import TournamentListItem from '@/components/TournamentListItem';
import TournamentListItemSkeleton from '@/components/TournamentListItemSkeleton';
import CreateTournamentModal from '@/components/CreateTournamentModal';
import ViewToggle from '@/components/ui/ViewToggle';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Icon from '@/components/Icon';
import { Input } from '@/components/ui/input';
import { containerVariants } from '@/lib/animations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alertDialog';

const TournamentListPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyTournaments();
      setTournaments(data);
    } catch (error) {
      toast.error('Failed to fetch tournaments.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    setFilteredTournaments(
      tournaments.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, tournaments]);

  const handleReorder = (newOrder) => {
    setFilteredTournaments(newOrder);
  };

  const handleEditClick = (tournament) => {
    setSelectedTournament(tournament);
    setShowCreateModal(true);
  };

  const handleDeleteClick = (tournament) => {
    setTournamentToDelete(tournament);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!tournamentToDelete) return;
    try {
      await api.deleteTournament(tournamentToDelete.id);
      toast.success('Tournament deleted successfully.');
      fetchTournaments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete tournament.'
      );
    } finally {
      setIsDeleteAlertOpen(false);
      setTournamentToDelete(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <motion.div
          key='loading'
          className={
            view === 'grid'
              ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-4'
          }
        >
          {view === 'grid' ? (
            <>
              <TournamentCardSkeleton />
              <TournamentCardSkeleton />
              <TournamentCardSkeleton />
            </>
          ) : (
            <>
              <TournamentListItemSkeleton />
              <TournamentListItemSkeleton />
              <TournamentListItemSkeleton />
            </>
          )}
        </motion.div>
      );
    }

    if (tournaments.length === 0) {
      return (
        <motion.div
          key='empty'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface'
        >
          <Icon
            name='event_note'
            className='text-6xl text-on-surface-variant'
          />
          <h3 className='mt-4 text-xl font-semibold text-on-surface'>
            No tournaments yet
          </h3>
          <p className='mt-2 text-on-surface-variant'>
            Click "Create Tournament" to get started.
          </p>
        </motion.div>
      );
    }

    if (filteredTournaments.length === 0) {
      return (
        <motion.div
          key='no-results'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface'
        >
          <Icon
            name='search_off'
            className='text-6xl text-on-surface-variant'
          />
          <h3 className='mt-4 text-xl font-semibold text-on-surface'>
            No results found
          </h3>
          <p className='mt-2 text-on-surface-variant'>
            Try adjusting your search query.
          </p>
        </motion.div>
      );
    }

    return (
      <Reorder.Group
        as='ul'
        axis={view === 'list' ? 'y' : undefined}
        values={filteredTournaments}
        onReorder={handleReorder}
        key={`tournaments-${view}`}
        className={
          view === 'grid'
            ? 'flex flex-row flex-wrap gap-6'
            : 'flex flex-col gap-4'
        }
        initial='hidden'
        animate='show'
        layoutScroll
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
      >
        {filteredTournaments.map((tournament) =>
          view === 'grid' ? (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              className='w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]'
            />
          ) : (
            <TournamentListItem key={tournament.id} tournament={tournament} />
          )
        )}
      </Reorder.Group>
    );
  };

  return (
    <div className='relative'>
      <motion.div
        className='relative'
        initial='hidden'
        animate='show'
        variants={containerVariants}
      >
        <header className='sticky top-0 z-10 border-b border-outline-variant bg-surface/80 px-4 py-4 backdrop-blur-sm md:px-8'>
          <div className='container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h1 className='font-sans text-3xl font-bold tracking-tight text-on-surface'>
                Your Tournaments
              </h1>
              <p className='mt-1 text-on-surface-variant'>
                All your created and managed events in one place.
              </p>
            </div>
            <div className='flex w-full items-center gap-2 md:w-auto'>
              <div className='relative flex-1 md:w-64 md:flex-none'>
                <Icon
                  name='search'
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <Input
                  placeholder='Search tournaments...'
                  className='pl-10'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>
        </header>

        <div className='container mx-auto p-4 md:p-8'>
          <AnimatePresence mode='wait'>{renderContent()}</AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.3,
        }}
        className='fixed bottom-8 right-8 z-30'
      >
        <Button
          size='lg'
          className='h-14 rounded-2xl bg-primary-container px-6 py-4 text-base font-medium text-on-primary-container shadow-lg transition-all hover:bg-primary-container/90'
          onClick={() => {
            setSelectedTournament(null);
            setShowCreateModal(true);
          }}
        >
          <Icon name='add' className='mr-3 text-2xl' />
          Create Tournament
        </Button>
      </motion.div>

      <CreateTournamentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedTournament(null);
        }}
        onSuccess={() => {
          setShowCreateModal(false);
          setSelectedTournament(null);
          fetchTournaments();
        }}
        tournament={selectedTournament}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tournament "
              {tournamentToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TournamentListPage;
