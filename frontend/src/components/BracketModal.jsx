import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Swords } from 'lucide-react';
import { useEffect, useState } from 'react';

const BracketModal = ({ isOpen, onClose, tournamentId }) => {
  const [rounds, setRounds] = useState({});
  const [loading, setLoading] = useState(false);
  const [tournamentName, setTournamentName] = useState('');

  useEffect(() => {
    if (isOpen && tournamentId) {
      fetchBracketData();
    }
  }, [isOpen, tournamentId]);

  const fetchBracketData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/public/tournament/${tournamentId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTournamentName(data.name);
        organizeMatches(data.matches);
      }
    } catch (error) {
      console.error('Failed to fetch bracket:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeMatches = (matches) => {
    const grouped = matches.reduce((acc, match) => {
      const round = match.round_name || 'Unscheduled';
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    }, {});
    setRounds(grouped);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl border-white/10 bg-background/95 text-foreground backdrop-blur-xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-2xl font-bold'>
            <Trophy className='h-6 w-6 text-primary' />
            {tournamentName || 'Tournament Bracket'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className='h-[60vh] w-full pr-4'>
          {loading ? (
            <div className='flex h-40 items-center justify-center text-muted-foreground'>
              Loading bracket data...
            </div>
          ) : Object.keys(rounds).length > 0 ? (
            <div className='flex min-w-max gap-8 pb-4'>
              {Object.entries(rounds).map(([roundName, matches]) => (
                <div key={roundName} className='w-64 space-y-4'>
                  <h3 className='border-b border-white/10 pb-2 text-center text-sm font-bold uppercase tracking-wider text-primary'>
                    {roundName}
                  </h3>
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className='relative flex flex-col gap-2 rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10'
                    >
                      <div className='flex items-center justify-between'>
                        <span
                          className={`font-medium ${match.team1_score > match.team2_score ? 'text-green-400' : 'text-muted-foreground'}`}
                        >
                          {match.team1?.department?.acronym || 'TBD'}
                        </span>
                        <span className='font-mono font-bold'>
                          {match.team1_score ?? '-'}
                        </span>
                      </div>
                      <div className='h-px w-full bg-white/10' />
                      <div className='flex items-center justify-between'>
                        <span
                          className={`font-medium ${match.team2_score > match.team1_score ? 'text-green-400' : 'text-muted-foreground'}`}
                        >
                          {match.team2?.department?.acronym || 'TBD'}
                        </span>
                        <span className='font-mono font-bold'>
                          {match.team2_score ?? '-'}
                        </span>
                      </div>

                      {match.status === 'live' && (
                        <div className='absolute -right-2 -top-2 animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white'>
                          LIVE
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className='flex h-40 flex-col items-center justify-center text-muted-foreground'>
              <Swords className='mb-2 h-10 w-10 opacity-20' />
              <p>No matches scheduled yet.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BracketModal;
