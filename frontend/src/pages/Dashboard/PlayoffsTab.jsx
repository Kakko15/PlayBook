import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogMatchModal from '@/components/LogMatchModal';
import Icon from '@/components/Icon';
import { cn } from '@/lib/utils';

const PlayoffsTab = ({ tournamentId, game }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getSchedule(tournamentId);
      setMatches(data);
    } catch (error) {
      toast.error('Failed to load bracket data.');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

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
    fetchSchedule();
  };

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className='flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card'>
        <Icon name='account_tree' className='h-12 w-12 text-muted-foreground' />
        <h3 className='mt-4 text-xl font-semibold text-foreground'>
          Bracket Not Generated
        </h3>
        <p className='mt-2 text-muted-foreground'>
          Go to the <strong>Schedule</strong> tab to generate the matches first.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-foreground'>
          Tournament Bracket
        </h3>
        <Button variant='outline' size='sm' onClick={fetchSchedule}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Refresh
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {matches.map((match) => {
          const isCompleted = match.status === 'completed';
          const team1Win = match.team1_score > match.team2_score;
          const team2Win = match.team2_score > match.team1_score;

          return (
            <div
              key={match.id}
              className={cn(
                'relative flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md',
                isCompleted
                  ? 'border-border'
                  : 'border-dashed border-muted-foreground/30'
              )}
            >
              <div className='flex items-center justify-between'>
                <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {match.round_name}
                </span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 opacity-50 hover:opacity-100'
                  onClick={() => handleLogResultClick(match)}
                >
                  <Edit className='h-3 w-3' />
                </Button>
              </div>

              <div className='flex flex-col gap-2'>
                {/* Team 1 */}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1 transition-colors',
                    team1Win
                      ? 'bg-primary/10 font-bold text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <div className='flex items-center gap-2 overflow-hidden'>
                    {match.team1 ? (
                      <img
                        src={
                          match.team1.logo_url ||
                          `https://avatar.vercel.sh/${match.team1.name}.png`
                        }
                        alt={match.team1.name}
                        className='h-5 w-5 flex-shrink-0 rounded-full bg-background object-cover'
                        onError={(e) => {
                          e.currentTarget.src = `https://avatar.vercel.sh/${match.team1.name}.png`;
                        }}
                      />
                    ) : (
                      <div className='h-5 w-5 flex-shrink-0 rounded-full bg-muted' />
                    )}
                    <span className='truncate text-sm'>
                      {match.team1?.name || 'TBD'}
                    </span>
                  </div>
                  <span className='font-mono text-sm'>
                    {match.team1_score ?? '-'}
                  </span>
                </div>

                <div className='h-px w-full bg-border/50' />

                {/* Team 2 */}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1 transition-colors',
                    team2Win
                      ? 'bg-primary/10 font-bold text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <div className='flex items-center gap-2 overflow-hidden'>
                    {match.team2 ? (
                      <img
                        src={
                          match.team2.logo_url ||
                          `https://avatar.vercel.sh/${match.team2.name}.png`
                        }
                        alt={match.team2.name}
                        className='h-5 w-5 flex-shrink-0 rounded-full bg-background object-cover'
                        onError={(e) => {
                          e.currentTarget.src = `https://avatar.vercel.sh/${match.team2.name}.png`;
                        }}
                      />
                    ) : (
                      <div className='h-5 w-5 flex-shrink-0 rounded-full bg-muted' />
                    )}
                    <span className='truncate text-sm'>
                      {match.team2?.name || 'TBD'}
                    </span>
                  </div>
                  <span className='font-mono text-sm'>
                    {match.team2_score ?? '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMatch && (
        <LogMatchModal
          isOpen={isModalOpen}
          onClose={onModalClose}
          onSuccess={onModalSuccess}
          match={selectedMatch}
          game={game}
        />
      )}
    </div>
  );
};

export default PlayoffsTab;
