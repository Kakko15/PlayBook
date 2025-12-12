import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trophy,
  Users,
  Search,
  ArrowBigRight,
  Share2,
  Ticket,
  BarChart3,
  TrendingUp,
  Clock,
  MapPin,
  Loader2,
  ArrowLeft,
  X,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import Icon from '@/components/Icon';
import { useAuth } from '@/hooks/useAuth';
// Imports removed to fix duplicate declaration errors
import { getGameDetails } from '@/lib/tournamentUtils.jsx';
import { cn } from '@/lib/utils';
import SimilarPlayersModal from '@/components/SimilarPlayersModal';
import MatchDetailsFullPage from '@/components/MatchDetailsModal'; // Component is exported as default from this file

// --- Constants & Utils ---

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

const getTeamAcronym = (team) => {
  if (team?.department?.acronym) return team.department.acronym;
  if (!team?.name) return 'NA';

  const name = team.name.toLowerCase();

  if (name.includes('business') || name.includes('cbapa')) return 'CBAPA';
  if (name.includes('criminal') || name.includes('ccje')) return 'CCJE';
  if (name.includes('agriculture') || name.includes('agri')) return 'CA';
  if (name.includes('education') || name.includes('ced')) return 'CED';
  if (name.includes('engineering') || name.includes('coe')) return 'COE';
  if (
    name.includes('computing') ||
    name.includes('ccs') ||
    name.includes('ict')
  )
    return 'CCSICT';
  if (name.includes('nursing') || name.includes('con')) return 'CON';
  if (name.includes('veterinary') || name.includes('svm')) return 'SVM';
  if (name.includes('arts') || name.includes('cas')) return 'CAS';
  if (name.includes('fisheries') || name.includes('iof')) return 'IOF';
  if (name.includes('medicine') || name.includes('com')) return 'COM';

  return team.name.substring(0, 2).toUpperCase();
};

const getDateLabel = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// --- Components ---

const PublicTournamentViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isSimilarPlayersOpen, setIsSimilarPlayersOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(`public-tournament-tab-${id}`) || 'games'
  );

  const handleTabChange = (value) => {
    setActiveTab(value);
    localStorage.setItem(`public-tournament-tab-${id}`, value);
  };

  useEffect(() => {
    const savedTab = localStorage.getItem(`public-tournament-tab-${id}`);
    if (savedTab) setActiveTab(savedTab);
  }, [id]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.getPublicTournamentDetails(id);
        setDetails(data);
      } catch (error) {
        toast.error('Failed to fetch tournament details.');
        navigate('/tournaments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  const handleCompare = (player) => {
    setSelectedPlayer(player);
    setIsSimilarPlayersOpen(true);
  };

  const handleMatchClick = (match) => {
    setSelectedMatchId(match.id);
  };

  if (isLoading) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center bg-gray-50'>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        >
          <div className='h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent' />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='mt-6 font-medium tracking-wide text-gray-400'
        >
          Preparing Tournament Experience...
        </motion.p>
      </div>
    );
  }

  if (!details) return null;

  const { tournament, teams, matches } = details;

  if (selectedMatchId) {
    return (
      <div className='fixed inset-0 z-[100] bg-white'>
        <MatchDetailsFullPage
          matchId={selectedMatchId}
          onBack={() => setSelectedMatchId(null)}
        />
      </div>
    );
  }

  return (
    <div className='flex min-h-screen flex-col bg-[#f0f2f5] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900'>
      {/* --- Sticky Header --- */}
      {/* --- Sticky Header --- */}
      <div className='sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-[#0f3c85] px-4 text-white shadow-md'>
        <button
          onClick={() => navigate('/tournaments')}
          className='flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80'
        >
          <ArrowLeft className='h-5 w-5' />
          <span>{tournament.name || 'Tournament'}</span>
        </button>

        <button
          onClick={() => navigate('/tournaments')}
          className='rounded-full p-1 transition-colors hover:bg-white/10'
        >
          <X className='h-5 w-5' />
        </button>
      </div>

      {/* --- Main Content --- */}
      <main className='mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8'>
        {/* Tab Navigation */}
        <div className='mb-8 flex justify-center'>
          <div className='inline-flex rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5'>
            {[
              { id: 'games', label: 'Matches', icon: Calendar },
              { id: 'standings', label: 'Standings', icon: Trophy },
              { id: 'stats', label: 'Stats', icon: BarChart3 },
              { id: 'players', label: 'Players', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300',
                  activeTab === tab.id
                    ? 'text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId='activeTab'
                    className='absolute inset-0 rounded-full bg-gray-900'
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className='relative z-10 flex items-center gap-2'>
                  <tab.icon className='h-4 w-4' />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='h-full'
          >
            {activeTab === 'games' && (
              <ScheduleTab matches={matches} onMatchClick={handleMatchClick} />
            )}
            {activeTab === 'standings' && <StandingsTab teams={teams} />}
            {activeTab === 'stats' && <StatsTab tournamentId={tournament.id} />}
            {activeTab === 'players' && (
              <TeamsTab teams={teams} onCompare={handleCompare} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <SimilarPlayersModal
        isOpen={isSimilarPlayersOpen}
        onClose={() => setIsSimilarPlayersOpen(false)}
        player={selectedPlayer}
        game={tournament.game}
      />
    </div>
  );
};

// --- Sub-Components ---

const ScheduleTab = ({ matches, onMatchClick }) => {
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.match_date) - new Date(b.match_date)
  );

  const groupedMatches = sortedMatches.reduce((groups, match) => {
    const dateKey = match.match_date
      ? new Date(match.match_date).toDateString()
      : 'TBD';
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: match.match_date,
        matches: [],
      };
    }
    groups[dateKey].matches.push(match);
    return groups;
  }, {});

  const groupKeys = Object.keys(groupedMatches).sort((a, b) => {
    if (a === 'TBD') return 1;
    if (b === 'TBD') return -1;
    return new Date(groupedMatches[a].date) - new Date(groupedMatches[b].date);
  });

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title='No matches scheduled'
        description="The schedule hasn't been released yet. Stay tuned for upcoming games!"
      />
    );
  }

  return (
    <div className='space-y-12'>
      {groupKeys.map((key, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          <div className='mb-6 flex items-center justify-start border-b border-gray-200 pb-2'>
            <h3 className='text-lg font-bold text-gray-900'>
              {getDateLabel(groupedMatches[key].date)}
            </h3>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {groupedMatches[key].matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={() => onMatchClick(match)}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const MatchCard = ({ match, onClick }) => {
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live' || match.status === 'in_progress';
  const team1Win = isCompleted && match.team1_score > match.team2_score;
  const team2Win = isCompleted && match.team2_score > match.team1_score;

  const timeLabel = match.match_date
    ? new Date(match.match_date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'TBD';

  const matchDate = match.match_date ? new Date(match.match_date) : null;
  let dateLabel = '';

  if (matchDate) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (matchDate.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (matchDate.toDateString() === tomorrow.toDateString()) {
      dateLabel = 'Tomorrow';
    } else {
      dateLabel = matchDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  // Get colors for the gradient button
  const t1Color = DEPARTMENT_COLORS[getTeamAcronym(match.team1)] || '64748b';
  const t2Color = DEPARTMENT_COLORS[getTeamAcronym(match.team2)] || '64748b';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className='group relative flex cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-md'
    >
      <div className='flex w-full'>
        {/* Left Side: Teams */}
        <div className='flex flex-1 flex-col justify-center gap-4 py-4 pl-5'>
          {/* Team 1 */}
          <div className='flex items-center justify-between pr-4'>
            <div className='flex items-center gap-3'>
              <TeamLogo team={match.team1} size='sm' />
              <span
                className={cn(
                  'text-sm font-bold text-gray-900',
                  !team1Win && isCompleted && 'font-medium text-gray-500'
                )}
              >
                {match.team1 ? getTeamAcronym(match.team1) : 'TBD'}
              </span>
            </div>
            <span
              className={cn(
                'font-mono text-lg font-bold',
                isLive && 'text-red-600',
                !team1Win && isCompleted ? 'text-gray-400' : 'text-gray-900'
              )}
            >
              {match.team1_score ?? '-'}
            </span>
          </div>

          {/* Team 2 */}
          <div className='flex items-center justify-between pr-4'>
            <div className='flex items-center gap-3'>
              <TeamLogo team={match.team2} size='sm' />
              <span
                className={cn(
                  'text-sm font-bold text-gray-900',
                  !team2Win && isCompleted && 'font-medium text-gray-500'
                )}
              >
                {match.team2 ? getTeamAcronym(match.team2) : 'TBD'}
              </span>
            </div>
            <span
              className={cn(
                'font-mono text-lg font-bold',
                isLive && 'text-red-600',
                !team2Win && isCompleted ? 'text-gray-400' : 'text-gray-900'
              )}
            >
              {match.team2_score ?? '-'}
            </span>
          </div>
        </div>

        {/* Right Side: Status & Action */}
        <div className='flex w-[140px] flex-col items-center justify-center border-l border-gray-100 bg-gray-50/50 py-2'>
          <div className='mb-2 flex flex-col items-center text-xs font-semibold'>
            {isLive ? (
              <div className='flex flex-col items-center'>
                <span className='font-bold tracking-wider text-green-600'>
                  Q4 - 02:44
                </span>
                <motion.span
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    width: ['80%', '100%', '80%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className='mt-1 h-0.5 rounded-full bg-green-600'
                />
              </div>
            ) : isCompleted ? (
              <span className='text-gray-500'>Final</span>
            ) : (
              <>
                <span className='text-gray-500'>{dateLabel}</span>
                <span className='text-gray-900'>{timeLabel}</span>
              </>
            )}
          </div>

          <div
            className='relative flex h-8 w-24 items-center justify-center rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ring-1 ring-black/5'
            style={{
              background: `linear-gradient(135deg, #${t1Color} 50%, #${t2Color} 50%)`,
            }}
          >
            <div className='absolute inset-0 rounded-md bg-black/10'></div>
            <span className='relative z-10 drop-shadow-md'>
              {isLive ? 'Live' : isCompleted ? 'Recap' : 'Preview'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StandingsTab = ({ teams }) => {
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });

  return (
    <div className='flex flex-col gap-8'>
      <div className='overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm ring-1 ring-black/5'>
        <div className='border-b border-gray-100 px-6 py-5'>
          <h3 className='flex items-center gap-2 text-base font-bold text-gray-900'>
            <Trophy className='h-5 w-5 text-yellow-500' />
            General Standings
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[600px]'>
            <thead>
              <tr className='bg-gray-50/50 text-left text-xs font-bold uppercase tracking-wider text-gray-500'>
                <th className='w-20 px-6 py-4 text-center'>Rank</th>
                <th className='px-6 py-4'>Team</th>
                <th className='w-24 px-6 py-4 text-center'>W</th>
                <th className='w-24 px-6 py-4 text-center'>L</th>
                <th className='w-28 px-6 py-4 text-center'>PCT</th>
                <th className='w-24 px-6 py-4 text-center'>ELO</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {sortedTeams.map((team, index) => {
                const totalGames = team.wins + team.losses;
                const pct =
                  totalGames > 0
                    ? (team.wins / totalGames).toFixed(3).replace('0.', '.')
                    : '.000';

                return (
                  <motion.tr
                    key={team.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='group transition-colors hover:bg-blue-50/30'
                  >
                    <td className='px-6 py-4 text-center'>
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                              ? 'bg-gray-100 text-gray-700'
                              : index === 2
                                ? 'bg-orange-100 text-orange-800'
                                : 'text-gray-500'
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <TeamLogo team={team} size='sm' />
                        <span className='font-bold text-gray-900 transition-colors group-hover:text-blue-700'>
                          {team.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-center text-sm font-bold text-gray-900'>
                      {team.wins}
                    </td>
                    <td className='px-6 py-4 text-center text-sm text-gray-500'>
                      {team.losses}
                    </td>
                    <td className='px-6 py-4 text-center font-mono text-sm font-medium text-gray-900'>
                      {pct}
                    </td>
                    <td className='px-6 py-4 text-center font-mono text-sm text-gray-500'>
                      {team.elo_rating}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatsTab = ({ tournamentId }) => {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const data = await api.getPlayerRankings(tournamentId);
        setRankings(data);
      } catch (error) {
        toast.error('Failed to fetch player stats.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, [tournamentId]);

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
      </div>
    );
  }

  const topPlayers = rankings.slice(0, 5);

  return (
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      <StatCard
        title='Player Score Leaders'
        players={topPlayers}
        metric='PS'
        metricKey='isu_ps'
        icon={TrendingUp}
      />
      {/* Placeholder for other stats */}
      <StatCard
        title='Top Scorers (PPG)'
        players={[]}
        metric='PPG'
        metricKey='ppg'
        emptyText='Coming Soon'
        icon={Trophy}
      />
    </div>
  );
};

const StatCard = ({
  title,
  players,
  metric,
  metricKey,
  emptyText = 'No stats available',
  icon: Icon = BarChart3,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className='overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm ring-1 ring-black/5'
  >
    <div className='flex items-center gap-3 border-b border-gray-100 px-6 py-5'>
      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600'>
        <Icon className='h-5 w-5' />
      </div>
      <h3 className='text-base font-bold text-gray-900'>{title}</h3>
    </div>
    <div>
      {players.length === 0 ? (
        <div className='flex h-48 items-center justify-center text-sm text-gray-500'>
          {emptyText}
        </div>
      ) : (
        players.map((player, index) => (
          <div
            key={player.id}
            className='group flex items-center justify-between border-b border-gray-50 px-6 py-4 transition-colors last:border-0 hover:bg-gray-50/50'
          >
            <div className='flex items-center gap-4'>
              <span
                className={cn(
                  'w-6 text-center font-mono text-sm font-bold',
                  index === 0
                    ? 'text-yellow-600'
                    : index === 1
                      ? 'text-gray-500'
                      : index === 2
                        ? 'text-orange-600'
                        : 'text-gray-400'
                )}
              >
                {index + 1}
              </span>
              <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white'>
                <TeamLogo team={player.team} size='md' />
              </div>
              <div>
                <div className='text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600'>
                  {player.name}
                </div>
                <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                  {player.team?.name}
                </div>
              </div>
            </div>

            <div className='text-right'>
              <span className='font-mono text-lg font-bold text-gray-900'>
                {player[metricKey]?.toFixed(1)}
              </span>
              <span className='ml-1 text-[10px] uppercase text-gray-400'>
                {metric}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
    {players.length > 0 && (
      <div className='bg-gray-50/50 px-6 py-3 text-center'>
        <button className='text-xs font-bold uppercase tracking-wide text-blue-600 hover:text-blue-700'>
          View All Leaders
        </button>
      </div>
    )}
  </motion.div>
);

const TeamsTab = ({ teams, onCompare }) => (
  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
    {teams.map((team, index) => (
      <motion.div
        key={team.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className='group overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5'
      >
        <div className='relative overflow-hidden bg-gray-50/50 p-6'>
          {/* Decorative background circle */}
          <div className='absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150' />

          <div className='relative z-10 flex items-center gap-4'>
            <TeamLogo team={team} size='lg' />
            <div className='min-w-0 flex-1'>
              <h3 className='truncate text-lg font-bold text-gray-900'>
                {team.name}
              </h3>
              <p className='text-sm text-gray-500'>
                {team.players?.length || 0} Active Players
              </p>
            </div>
          </div>
        </div>
        <div className='scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 max-h-[320px] overflow-y-auto p-2'>
          {team.players.map((player) => (
            <div
              key={player.id}
              className='flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-gray-50'
            >
              <div className='flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 ring-2 ring-white'>
                  <Users className='h-4 w-4' />
                </div>
                <div>
                  <span className='block text-sm font-semibold text-gray-700'>
                    {player.name}
                  </span>
                  <span className='block text-[10px] text-gray-400'>
                    {player.role || 'Player'}
                  </span>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                      onClick={() => onCompare(player)}
                    >
                      <BarChart3 className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analyze Stats</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
        <div className='border-t border-gray-50 bg-gray-50/30 px-6 py-3'>
          <button className='w-full text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-blue-600'>
            View Team Details
          </button>
        </div>
      </motion.div>
    ))}
  </div>
);

// --- Helpers ---

const TeamLogo = ({ team, size = 'md' }) => {
  const acronym = getTeamAcronym(team);
  const color = DEPARTMENT_COLORS[acronym] || '64748b';
  const logoSrc =
    team?.logo_url && !team.logo_url.includes('avatar.vercel.sh')
      ? team.logo_url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym)}&background=${color}&color=fff&size=128&bold=true&length=4`;

  const sizeClasses = {
    xs: 'h-5 w-5',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <motion.img
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      src={logoSrc}
      alt={`${team?.name || 'Team'} logo`}
      className={cn(
        'rounded-full bg-white object-contain p-0.5 shadow-sm ring-2 ring-gray-100/50 backdrop-blur-sm',
        sizeClasses[size]
      )}
    />
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className='flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/30 p-12 text-center'
  >
    <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-gray-50'>
      <Icon className='h-10 w-10 text-gray-300' />
    </div>
    <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
    <p className='mt-2 max-w-sm text-balance text-gray-500'>{description}</p>
    <Button
      variant='outline'
      className='mt-8 rounded-full border-gray-200 px-6 font-semibold hover:border-gray-300 hover:bg-gray-50'
      onClick={() => window.location.reload()}
    >
      Refresh Page
    </Button>
  </motion.div>
);

export default PublicTournamentViewerPage;
