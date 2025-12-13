import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SortableTable from '@/components/ui/SortableTable';
import confetti from 'canvas-confetti';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alertDialog';

const DEPARTMENT_COLORS = {
  CBAPA: '080e88',
  CCJE: '7d0608',
  CA: '174008',
  CED: '217580',
  COE: '4c0204',
  CCSICT: 'fda003',
  CON: 'd60685',
  SVM: '464646',
  CAS: 'dac607',
  IOF: '018d99',
  COM: '2c9103',
};

const StandingsTab = ({ tournamentId }) => {
  const [standings, setStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const confettiTriggeredRef = useRef(false);
  const confettiTimeoutRef = useRef(null);
  const confettiIntervalRef = useRef(null);

  const triggerWinnerConfetti = useCallback(() => {
    if (confettiTriggeredRef.current) return;
    confettiTriggeredRef.current = true;

    // Fire confetti from both sides
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    confettiIntervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiIntervalRef.current);
        confettiIntervalRef.current = null;
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#22c55e', '#16a34a', '#fbbf24', '#f59e0b'],
      });

      // Confetti from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#22c55e', '#16a34a', '#fbbf24', '#f59e0b'],
      });
    }, 250);

    setHasShownConfetti(true);
  }, []);

  const handleResetElo = async () => {
    try {
      await api.resetElos(tournamentId);
      toast.success('Standings reset successfully.');
      fetchStandings();
    } catch (error) {
      toast.error('Failed to reset standings.');
    }
  };

  const fetchStandings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getStandings(tournamentId);
      setStandings(data);

      // Check if tournament has a clear winner (rank 1 has wins and rank 2 has losses)
      if (data.length >= 2) {
        const leader = data[0];
        const runnerUp = data[1];
        const tournamentComplete = leader.wins > 0 && runnerUp.losses > 0;
        const clearWinner = leader.wins > runnerUp.wins;

        // Trigger confetti if there's a clear winner
        if (
          tournamentComplete &&
          clearWinner &&
          !confettiTriggeredRef.current
        ) {
          // Small delay for visual effect
          confettiTimeoutRef.current = setTimeout(
            () => triggerWinnerConfetti(),
            500
          );
        }
      }
    } catch (error) {
      toast.error('Failed to fetch standings.');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId, triggerWinnerConfetti]);

  useEffect(() => {
    confettiTriggeredRef.current = false;
    setHasShownConfetti(false);
    fetchStandings();

    // Cleanup timeouts and intervals on unmount or tournamentId change
    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
        confettiTimeoutRef.current = null;
      }
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
        confettiIntervalRef.current = null;
      }
    };
  }, [fetchStandings]);

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  const columns = [
    {
      key: 'rank',
      header: 'Rank',
      sortable: true,
      renderCell: (row, value, index) => (
        <div className='flex items-center gap-2'>
          <span className='font-medium text-foreground'>{index + 1}</span>
          {index === 0 && row.wins > 0 && (
            <Trophy className='h-4 w-4 text-yellow-500' />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Team',
      sortable: true,
      filterable: true,
      renderCell: (row) => {
        const isOldLogo =
          row.logo_url && row.logo_url.includes('avatar.vercel.sh');
        const acronym =
          row.department?.acronym || row.name.substring(0, 2).toUpperCase();
        const color = DEPARTMENT_COLORS[acronym] || '64748b';
        const logoSrc =
          row.logo_url && !isOldLogo
            ? row.logo_url
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym)}&background=${color}&color=fff&size=128&bold=true&length=4`;

        return (
          <div className='flex items-center gap-3'>
            <img
              src={logoSrc}
              alt={`${row.name} logo`}
              className='h-8 w-8 rounded-full bg-muted'
            />
            <span className='font-medium text-foreground'>{row.name}</span>
          </div>
        );
      },
    },
    {
      key: 'wl',
      header: 'W-L',
      sortable: true,
      renderCell: (row) => (
        <span className='text-muted-foreground'>
          {row.wins} - {row.losses}
        </span>
      ),
    },
    {
      key: 'elo_rating',
      header: 'ELO',
      sortable: true,
      renderCell: (row) => (
        <span className='text-muted-foreground'>{row.elo_rating}</span>
      ),
    },
  ];

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-end'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' size='sm' disabled={isLoading}>
              <RotateCcw className='mr-2 h-4 w-4' />
              Reset Standings
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Tournament Standings?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will reset the Wins, Losses,
                and ELO ratings of all teams in this tournament to 0 (ELO 1200).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetElo}>
                Reset Standings
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <SortableTable
        data={standings}
        columns={columns}
        defaultSortKey='elo_rating'
        defaultSortOrder='desc'
        emptyMessage='No standings available'
      />
    </div>
  );
};

export default StandingsTab;
