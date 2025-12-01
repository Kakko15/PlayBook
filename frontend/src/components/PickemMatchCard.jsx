import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const PickemMatchCard = ({
  match,
  myPick,
  onPickSuccess,
  guestInfo,
  isAuthenticated,
  onGuestLoginRequired,
}) => {
  const [loadingPick, setLoadingPick] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const isPending = match.status === 'pending';
  const isCompleted = match.status === 'completed';

  useEffect(() => {
    if (isPending && match.team1 && match.team2) {
      api
        .getMatchPrediction(match.id)
        .then((data) => setPrediction(data))
        .catch(() => setPrediction(null));
    }
  }, [match.id, isPending, match.team1, match.team2]);

  const handlePick = async (teamId) => {
    if (!isAuthenticated && !guestInfo?.guest_name) {
      onGuestLoginRequired();
      return;
    }

    setLoadingPick(teamId);
    try {
      const { pick } = await api.makePick(match.id, teamId, guestInfo);
      onPickSuccess(pick);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save pick.');
    } finally {
      setLoadingPick(null);
    }
  };

  const getPickStatusIcon = (teamId) => {
    if (!myPick || myPick.status === 'pending') return null;

    if (myPick.predicted_winner_team_id === teamId) {
      return myPick.status === 'correct' ? (
        <CheckCircle className='h-5 w-5 text-green-500' />
      ) : (
        <XCircle className='h-5 w-5 text-destructive' />
      );
    }
    return null;
  };

  const team1WinProb = prediction
    ? Math.round(prediction.team1_win_probability * 100)
    : 50;
  const team2WinProb = prediction ? 100 - team1WinProb : 50;

  return (
    <div className='rounded-lg border border-border bg-card p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-sm text-muted-foreground'>
          {match.round_name || 'Match'}
        </span>
        {isCompleted && (
          <span className='rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
            Completed
          </span>
        )}
      </div>
      <div className='grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'>
        <TeamButton
          team={match.team1}
          score={match.team1_score}
          onClick={() => handlePick(match.team1_id)}
          isSelected={myPick?.predicted_winner_team_id === match.team1_id}
          isLoading={loadingPick === match.team1_id}
          isDisabled={!isPending || loadingPick}
          pickStatusIcon={getPickStatusIcon(match.team1_id)}
          isWinner={match.team1_score > match.team2_score}
          className='min-w-0'
        />

        <div className='text-center font-bold text-muted-foreground'>VS</div>

        <TeamButton
          team={match.team2}
          score={match.team2_score}
          onClick={() => handlePick(match.team2_id)}
          isSelected={myPick?.predicted_winner_team_id === match.team2_id}
          isLoading={loadingPick === match.team2_id}
          isDisabled={!isPending || loadingPick}
          pickStatusIcon={getPickStatusIcon(match.team2_id)}
          isWinner={match.team2_score > match.team1_score}
          isReversed
          className='min-w-0'
        />
      </div>
      {isPending && prediction && (
        <div className='mt-3 space-y-1'>
          <div className='flex justify-between text-xs'>
            <span className='font-medium text-primary'>{team1WinProb}%</span>
            <span className='font-medium text-muted-foreground'>Win %</span>
            <span className='font-medium text-primary'>{team2WinProb}%</span>
          </div>
          <Progress value={team1WinProb} />
        </div>
      )}
    </div>
  );
};

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

const TeamButton = ({
  team,
  score,
  onClick,
  isSelected,
  isLoading,
  isDisabled,
  pickStatusIcon,
  isWinner,
  isReversed = false,
  className,
}) => {
  const isOldLogo =
    team?.logo_url && team.logo_url.includes('avatar.vercel.sh');
  const acronym =
    team?.department?.acronym || team?.name?.substring(0, 2).toUpperCase();
  const color = DEPARTMENT_COLORS[acronym] || '64748b';
  const logoSrc =
    team?.logo_url && !isOldLogo
      ? team.logo_url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym || 'TBD')}&background=${color}&color=fff&size=128&bold=true&length=4`;

  return (
    <Button
      variant='outline'
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'h-auto w-full justify-between overflow-hidden p-3 transition-all',
        isSelected && 'border-primary ring-2 ring-primary ring-offset-2',
        !isWinner && score != null && 'opacity-50',
        isReversed && 'flex-row-reverse',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-1 items-center gap-3 overflow-hidden',
          isReversed ? 'flex-row-reverse text-right' : 'flex-row text-left'
        )}
      >
        <img
          src={logoSrc}
          alt={`${team?.name || 'TBD'} logo`}
          className='h-8 w-8 flex-shrink-0 rounded-full bg-muted'
        />
        <span className='min-w-0 flex-1 truncate font-medium text-foreground'>
          {team?.department?.acronym || team?.name || 'TBD'}
        </span>
      </div>

      <div
        className={cn(
          'flex flex-shrink-0 items-center gap-2',
          isReversed ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {pickStatusIcon}
        {score != null && <span className='text-lg font-bold'>{score}</span>}
        {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
      </div>
    </Button>
  );
};

export default PickemMatchCard;
