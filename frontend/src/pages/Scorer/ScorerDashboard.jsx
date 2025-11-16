import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Edit, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LogMatchModal from '@/components/LogMatchModal';
import Icon from '@/components/Icon';

const ScorerDashboard = () => {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const tournamentData = await api.getMyTournaments();
      setTournaments(tournamentData);

      const schedulePromises = tournamentData.map((t) => api.getSchedule(t.id));
      const allSchedules = (await Promise.all(schedulePromises)).flat();

      const pendingMatches = allSchedules.filter((m) => m.status === 'pending');
      setMatches(pendingMatches);
    } catch (error) {
      toast.error('Failed to fetch assigned matches.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleLogResultClick = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const onModalClose = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  const onModalSuccess = () => {
    onModalClose();
    fetchMatches();
  };

  const selectedMatchGame = selectedMatch
    ? tournaments.find((t) => t.id === selectedMatch.tournament_id)?.game
    : null;

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <>
      <div className='container mx-auto max-w-4xl'>
        <h1 className='text-3xl font-bold text-foreground'>Assigned Matches</h1>
        <p className='mt-2 text-muted-foreground'>
          Log results for your assigned matches.
        </p>

        <div className='mt-8 space-y-4'>
          {matches.length === 0 ? (
            <div className='flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card'>
              <CalendarDays className='h-12 w-12 text-muted-foreground' />
              <h3 className='mt-4 text-xl font-semibold text-foreground'>
                No pending matches
              </h3>
              <p className='mt-2 text-muted-foreground'>
                You are all caught up!
              </p>
            </div>
          ) : (
            matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                tournamentName={
                  tournaments.find((t) => t.id === match.tournament_id)?.name ||
                  'Tournament'
                }
                onLogResult={handleLogResultClick}
              />
            ))
          )}
        </div>
      </div>
      {selectedMatch && (
        <LogMatchModal
          isOpen={isModalOpen}
          onClose={onModalClose}
          onSuccess={onModalSuccess}
          match={selectedMatch}
          game={selectedMatchGame}
        />
      )}
    </>
  );
};

const MatchCard = ({ match, tournamentName, onLogResult }) => {
  return (
    <div className='rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm'>
      <div className='mb-2 flex items-center justify-between'>
        <div>
          <span className='text-sm text-muted-foreground'>
            {match.round_name || 'Match'}
          </span>
          <p className='text-xs text-muted-foreground'>{tournamentName}</p>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onLogResult(match)}
          className='h-8 px-3'
        >
          <Edit className='mr-2 h-4 w-4' />
          Log Result
        </Button>
      </div>
      <div className='flex items-center justify-between'>
        <TeamDisplay team={match.team1} />
        <span className='mx-4 font-bold text-muted-foreground'>VS</span>
        <TeamDisplay team={match.team2} isReversed />
      </div>
      {match.match_date && (
        <div className='mt-3 text-center text-xs text-muted-foreground'>
          {new Date(match.match_date).toLocaleString()}
        </div>
      )}
    </div>
  );
};

const TeamDisplay = ({ team, isReversed = false }) => (
  <div
    className={cn(
      'flex flex-1 items-center gap-3',
      isReversed ? 'flex-row-reverse text-right' : 'text-left'
    )}
  >
    <img
      src={
        team?.logo_url || `https://avatar.vercel.sh/${team?.name || 'TBD'}.png`
      }
      alt={`${team?.name || 'TBD'} logo`}
      className='h-8 w-8 rounded-full bg-muted'
      onError={(e) => {
        e.currentTarget.src = `https://avatar.vercel.sh/${team?.name || 'TBD'}.png`;
      }}
    />
    <span className={cn('flex-1 truncate font-medium', 'text-foreground')}>
      {team?.name || 'TBD'}
    </span>
  </div>
);

export default ScorerDashboard;
