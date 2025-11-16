import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/Icon';

const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};

const AwardCard = ({ title, icon, colorClass, player, metric, value }) => {
  if (!player) {
    return (
      <Card>
        <CardHeader className='flex-row items-center gap-4 space-y-0'>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClass} text-white`}
          >
            <Icon name={icon} className='text-3xl' />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            No eligible player found for this award.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='flex-row items-center gap-4 space-y-0'>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClass} text-white`}
        >
          <Icon name={icon} className='text-3xl' />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <p className='text-sm text-muted-foreground'>
            {metric}: {value.toFixed(2)}
          </p>
        </div>
      </CardHeader>
      <CardContent className='flex items-center gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={`https://avatar.vercel.sh/${player.name}.png`} />
          <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className='font-semibold text-foreground'>{player.name}</p>
          <p className='text-sm text-muted-foreground'>{player.team.name}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const AwardsTab = ({ tournamentId }) => {
  const [winners, setWinners] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateWinners = useCallback(async () => {
    setIsLoading(true);
    try {
      const players = await api.getPlayerRankings(tournamentId);

      const eligiblePlayers = players.filter((p) => {
        const teamGames = p.team.wins + p.team.losses;
        if (teamGames === 0) return false;
        return p.game_count / teamGames >= 0.6;
      });

      if (eligiblePlayers.length === 0) {
        setWinners({ mvp: null, opoy: null, dpoy: null, smoy: null });
        return;
      }

      const findWinner = (key) =>
        eligiblePlayers.reduce((max, p) => (p[key] > max[key] ? p : max));

      const mvp = findWinner('isu_ps');
      const opoy = findWinner('offensive_rating');
      const dpoy = findWinner('defensive_rating');
      const smoy = findWinner('avg_sportsmanship');

      setWinners({ mvp, opoy, dpoy, smoy });
    } catch (error) {
      toast.error('Failed to calculate awards.');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    calculateWinners();
  }, [calculateWinners]);

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!winners) {
    return (
      <div className='flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card'>
        <Icon
          name='social_leaderboard'
          className='h-12 w-12 text-muted-foreground'
        />
        <h3 className='mt-4 text-xl font-semibold text-foreground'>
          No Awards Calculated
        </h3>
        <p className='mt-2 text-muted-foreground'>
          Not enough data to determine award winners.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <AwardCard
        title='Most Valuable Player (MVP)'
        icon='military_tech'
        colorClass='bg-yellow-500'
        player={winners.mvp}
        metric='ISU-PS'
        value={winners.mvp?.isu_ps || 0}
      />
      <AwardCard
        title='Offensive Player of the Year'
        icon='local_fire_department'
        colorClass='bg-red-500'
        player={winners.opoy}
        metric='Offensive Rating'
        value={winners.opoy?.offensive_rating || 0}
      />
      <AwardCard
        title='Defensive Player of the Year'
        icon='shield'
        colorClass='bg-blue-500'
        player={winners.dpoy}
        metric='Defensive Rating'
        value={winners.dpoy?.defensive_rating || 0}
      />
      <AwardCard
        title='Sportsmanship of the Year'
        icon='handshake'
        colorClass='bg-green-500'
        player={winners.smoy}
        metric='Sportsmanship'
        value={winners.smoy?.avg_sportsmanship || 0}
      />
    </div>
  );
};

export default AwardsTab;
