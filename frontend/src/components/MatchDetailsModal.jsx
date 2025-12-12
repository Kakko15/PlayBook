import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Trophy,
  Users,
  ArrowLeft,
  ChevronLeft,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

const getDepartmentColor = (acronym) => {
  return DEPARTMENT_COLORS[acronym] || '#64748b';
};

const MatchDetailsFullPage = ({ matchId, onBack }) => {
  const [matchDetails, setMatchDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('team1');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!matchId) return;
      setIsLoading(true);
      try {
        const data = await api.getMatchDetails(matchId);
        setMatchDetails(data);
        setActiveTab('team1');
      } catch (error) {
        console.error('Failed to fetch match details', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [matchId]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen w-full items-center justify-center bg-gray-50'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className='h-8 w-8 text-blue-600' />
        </motion.div>
      </div>
    );
  }

  if (!matchDetails) return null;

  const showStats =
    matchDetails.status === 'completed' ||
    matchDetails.status === 'live' ||
    matchDetails.status === 'in_progress';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='min-h-screen w-full bg-[#f0f2f5]'
    >
      {/* Sticky Header with Back Button */}
      <div className='sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-4 text-white shadow-md sm:px-6 lg:px-8'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onBack}
            className='rounded-full text-white hover:bg-white/10 hover:text-white'
          >
            <ArrowLeft className='h-6 w-6' />
          </Button>
          <h1 className='text-lg font-medium text-white'>
            {matchDetails.team1.department.acronym} vs{' '}
            {matchDetails.team2.department.acronym}
          </h1>
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={onBack}
          className='rounded-full text-white hover:bg-white/10 hover:text-white'
        >
          <X className='h-6 w-6' />
        </Button>
      </div>

      <div
        className={cn(
          'mx-auto px-4 py-8 transition-all duration-500 ease-in-out sm:px-6 lg:px-8',
          showStats ? 'max-w-7xl' : 'max-w-4xl'
        )}
      >
        <div className='overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5'>
          {/* --- Match Header (Scoreboard) --- */}
          <MatchHeader match={matchDetails} />

          {/* --- Tabs & Content --- */}
          {showStats && (
            <div className='flex flex-col'>
              <Tabs
                defaultValue='team1'
                value={activeTab}
                onValueChange={setActiveTab}
                className='flex w-full flex-col'
              >
                {/* Tab Navigation */}
                <div className='sticky top-20 z-40 border-b border-gray-100 bg-white px-6 shadow-sm'>
                  <TabsList className='flex w-full justify-start gap-8 bg-transparent p-0'>
                    <TabTrigger
                      value='team1'
                      label={matchDetails.team1.name}
                      active={activeTab === 'team1'}
                      color={getDepartmentColor(
                        matchDetails.team1?.department?.acronym
                      )}
                    />
                    <TabTrigger
                      value='team2'
                      label={matchDetails.team2.name}
                      active={activeTab === 'team2'}
                      color={getDepartmentColor(
                        matchDetails.team2?.department?.acronym
                      )}
                    />
                    <TabTrigger
                      value='stats'
                      label='Team Stats'
                      active={activeTab === 'stats'}
                      color='#3b82f6'
                    />
                  </TabsList>
                </div>

                {/* Tab Content Areas */}
                <div className='min-h-[600px] bg-[#f8f9fa] p-6'>
                  <AnimatePresence mode='wait'>
                    {activeTab === 'team1' && (
                      <motion.div
                        key='team1'
                        initial={{ opacity: 0, y: 5, filter: 'blur(2px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className='h-full'
                      >
                        <BoxScoreTable
                          players={matchDetails.team1.players}
                          stats={matchDetails.match_player_stats}
                          teamId={matchDetails.team1.id}
                        />
                      </motion.div>
                    )}
                    {activeTab === 'team2' && (
                      <motion.div
                        key='team2'
                        initial={{ opacity: 0, y: 5, filter: 'blur(2px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className='h-full'
                      >
                        <BoxScoreTable
                          players={matchDetails.team2.players}
                          stats={matchDetails.match_player_stats}
                          teamId={matchDetails.team2.id}
                        />
                      </motion.div>
                    )}
                    {activeTab === 'stats' && (
                      <motion.div
                        key='stats'
                        initial={{ opacity: 0, y: 5, filter: 'blur(2px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className='h-full'
                      >
                        <TeamComparison match={matchDetails} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchDetailsFullPage;

// --- Sub-Components ---

const MatchHeader = ({ match }) => {
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live' || match.status === 'in_progress';
  const isUpcoming = !isCompleted && !isLive;

  const getTeamLogo = (team) => {
    const acronym = team?.department?.acronym || 'NA';
    const color = (getDepartmentColor(acronym) || '64748b').replace('#', '');
    return (
      team?.logo_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        acronym
      )}&background=${color}&color=fff&size=128&bold=true`
    );
  };

  const t1Acronym = match.team1?.department?.acronym || 'NA';
  const t2Acronym = match.team2?.department?.acronym || 'NA';
  const t1Color = getDepartmentColor(t1Acronym).replace('#', '');
  const t2Color = getDepartmentColor(t2Acronym).replace('#', '');

  return (
    <div className='bg-white px-6 py-6 pb-8 pt-6'>
      <div className='mx-auto max-w-4xl px-2 sm:px-4'>
        {/* Top Info Row */}
        <div className='mb-6 flex items-center justify-between border-b border-gray-100 pb-3'>
          <div className='flex items-center gap-2 text-xs font-bold text-gray-500'>
            <span className='text-blue-700'>ISU Tournament</span>
            <span>•</span>
            <span className='text-gray-400'>
              {match.match_date
                ? new Date(match.match_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })
                : 'Today'}
            </span>
          </div>
          <div>
            {isLive ? (
              <span className='animate-pulse text-xs font-bold uppercase tracking-widest text-red-600'>
                Live
              </span>
            ) : isCompleted ? (
              <span className='text-xs font-bold uppercase tracking-widest text-gray-900'>
                Final
              </span>
            ) : null}
          </div>
        </div>

        {/* Scoreboard / Teams */}
        <div className='flex flex-col items-center justify-between gap-6 md:flex-row md:gap-10'>
          {/* Team 1 */}
          <div className='order-2 flex flex-1 flex-col items-center md:order-1'>
            <img
              src={getTeamLogo(match.team1)}
              alt={match.team1.name}
              className='mb-3 h-14 w-14 rounded-full object-contain shadow-sm ring-2 ring-gray-50 md:h-16 md:w-16'
            />
            <h2 className='text-center text-lg font-bold leading-tight text-gray-900 md:text-xl'>
              {match.team1.name}
            </h2>
          </div>

          {/* Center (Scores or VS) */}
          <div className='order-1 flex items-center gap-6 md:order-2'>
            {isUpcoming ? (
              <span className='text-sm font-bold uppercase tracking-wider text-gray-400'>
                VS
              </span>
            ) : (
              <>
                <span className='text-4xl font-medium tracking-tighter text-gray-900 md:text-5xl'>
                  {match.team1_score ?? 0}
                </span>
                <span className='text-2xl font-light text-gray-200'>-</span>
                <span className='text-4xl font-medium tracking-tighter text-gray-900 md:text-5xl'>
                  {match.team2_score ?? 0}
                </span>
              </>
            )}
          </div>

          {/* Team 2 */}
          <div className='order-3 flex flex-1 flex-col items-center md:order-3'>
            <img
              src={getTeamLogo(match.team2)}
              alt={match.team2.name}
              className='mb-3 h-14 w-14 rounded-full object-contain shadow-sm ring-2 ring-gray-50 md:h-16 md:w-16'
            />
            <h2 className='text-center text-lg font-bold leading-tight text-gray-900 md:text-xl'>
              {match.team2.name}
            </h2>
          </div>
        </div>

        {/* Links / Actions (Optional) */}
        {isUpcoming && <div className='my-6 border-b border-gray-100'></div>}

        {/* Game Preview Banner for Upcoming Matches */}
        {isUpcoming && (
          <div className='relative mt-4 h-48 w-full overflow-hidden rounded-xl shadow-sm'>
            {/* Split Background */}
            <div className='absolute inset-0 flex'>
              <div
                className='flex-1'
                style={{ backgroundColor: `#${t1Color}` }}
              ></div>
              <div
                className='flex-1'
                style={{ backgroundColor: `#${t2Color}` }}
              ></div>
            </div>

            {/* Overlay Gradient for Text Readability/Aesthetics */}
            <div className='absolute inset-0 bg-black/20 backdrop-blur-[1px]'></div>

            {/* Text Content */}
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <h1 className='text-4xl font-black uppercase tracking-tighter text-white drop-shadow-xl md:text-5xl'>
                Game
              </h1>
              <h1 className='text-4xl font-black uppercase tracking-tighter text-white drop-shadow-xl md:text-5xl'>
                Preview
              </h1>
            </div>

            {/* Bottom Left Label */}
            <div className='absolute bottom-4 left-4'>
              <span className='text-xs font-semibold text-white/90 drop-shadow-md'>
                Game preview
              </span>
            </div>

            {/* Bottom Right Icon */}
            <div className='absolute bottom-4 right-4'>
              <div className='flex h-6 w-6 items-center justify-center rounded bg-black/40 text-white backdrop-blur-md'>
                <div className='mx-0.5 h-2 w-0.5 bg-white'></div>
                <div className='mx-0.5 h-2 w-0.5 bg-white'></div>
                <div className='mx-0.5 h-2 w-0.5 bg-white'></div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Table Mockup (Only if NOT upcoming) */}
        {!isUpcoming && (
          <div className='mt-8 hidden md:block'>
            <div className='w-full border-t border-gray-100'>
              <div className='grid grid-cols-12 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400'>
                <div className='col-span-4 pl-4'>Team</div>
                <div className='col-span-8 grid grid-cols-5 text-center'>
                  <div>1</div>
                  <div>2</div>
                  <div>3</div>
                  <div>4</div>
                  <div>T</div>
                </div>
              </div>
              {/* Row 1 */}
              <div className='grid grid-cols-12 items-center border-t border-gray-50 py-3'>
                <div className='col-span-4 pl-4 text-xs font-bold text-gray-900'>
                  {match.team1.name}
                </div>
                <div className='col-span-8 grid grid-cols-5 text-center text-xs font-medium text-gray-500'>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div className='font-bold text-gray-900'>
                    {match.team1_score ?? 0}
                  </div>
                </div>
              </div>
              {/* Row 2 */}
              <div className='grid grid-cols-12 items-center border-t border-gray-50 py-3'>
                <div className='col-span-4 pl-4 text-xs font-bold text-gray-900'>
                  {match.team2.name}
                </div>
                <div className='col-span-8 grid grid-cols-5 text-center text-xs font-medium text-gray-500'>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div className='font-bold text-gray-900'>
                    {match.team2_score ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Venue Footer (Always visible) */}
        <div className='mt-6 border-t border-gray-100 pt-4 text-xs text-gray-500'>
          <span className='font-semibold text-green-700'>Venue: </span>
          <span>{match.venue || 'Main Court Local'}</span>
          <div className='mt-1 text-gray-400'>
            All times are in Philippine Standard Time
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamDisplay = ({ team, score, isWinner, align }) => {
  const acronym = team?.department?.acronym || 'NA';
  const color = getDepartmentColor(acronym);
  const logoSrc =
    team?.logo_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym)}&background=${color}&color=fff&size=128&bold=true`;

  return (
    <div
      className={cn(
        'flex items-center gap-5',
        align === 'right' && 'flex-row-reverse text-right'
      )}
    >
      <div className='relative'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={cn(
            'absolute -inset-4 rounded-full opacity-0 blur-xl transition-opacity duration-300',
            isWinner && 'opacity-30'
          )}
          style={{
            backgroundColor: isWinner ? undefined : `#${color}`,
            background: isWinner
              ? 'radial-gradient(circle, #facc15 0%, transparent 70%)'
              : undefined,
          }}
        />
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className='relative z-10'
        >
          <img
            src={logoSrc}
            alt={team.name}
            className={cn(
              'h-16 w-16 rounded-full bg-white object-contain p-1 shadow-lg ring-2 ring-gray-50',
              isWinner ? 'ring-yellow-400/50' : 'ring-gray-100'
            )}
          />
          {isWinner && (
            <div className='absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-white shadow-sm ring-2 ring-white'>
              <Trophy size={12} fill='currentColor' />
            </div>
          )}
        </motion.div>
      </div>
      <div>
        <h3 className='text-lg font-bold leading-tight text-gray-900 md:text-xl'>
          {team.name}
        </h3>
        <p className='text-xs font-bold uppercase tracking-wider text-gray-400'>
          {team.department?.name || 'Team'}
        </p>
      </div>
      <div
        className={cn(
          'font-mono text-4xl font-black tracking-tighter text-gray-900',
          !score && 'opacity-0'
        )}
      >
        {score ?? 0}
      </div>
    </div>
  );
};

const TabTrigger = ({ value, label, active, color }) => (
  <TabsTrigger
    value={value}
    className={cn(
      'relative h-14 rounded-none border-b-[3px] border-transparent px-8 text-sm font-bold uppercase tracking-wide text-gray-400 transition-all hover:bg-gray-50/50 hover:text-gray-600 data-[state=active]:bg-transparent',
      active ? 'text-gray-900' : ''
    )}
  >
    {label}
    {active && (
      <motion.div
        layoutId='tabIndicator'
        className='absolute bottom-0 left-0 right-0 h-[3px]'
        style={{
          backgroundColor:
            typeof color === 'string' && color.startsWith('#')
              ? color
              : `#${color}`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    )}
  </TabsTrigger>
);

const BoxScoreTable = ({ players, stats = [], teamId }) => {
  // Merge player info with stats
  const playerStats = players
    .map((player) => {
      const pStats = stats.find((s) => s.player_id === player.id) || {};
      return { ...player, stats: pStats };
    })
    .sort((a, b) => (Number(b.stats.pts) || 0) - (Number(a.stats.pts) || 0)); // Sort by points descending

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'
    >
      <Table>
        <TableHeader className='bg-gray-50/80'>
          <TableRow className='hover:bg-gray-50/80'>
            <TableHead className='w-[200px] pl-6 font-bold text-gray-900'>
              PLAYER
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              MIN
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              PTS
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              REB
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              AST
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              STL
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              BLK
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              TO
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              PF
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              FGM
            </TableHead>
            <TableHead className='text-center text-[11px] font-bold text-gray-500'>
              3PM
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playerStats.map((player, index) => (
            <motion.tr
              key={player.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.015, duration: 0.2 }}
              className='group border-b border-gray-50 transition-colors hover:bg-blue-50/30'
            >
              <TableCell className='pl-6 font-medium text-gray-900'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100/80 text-[10px] font-bold text-gray-500 ring-1 ring-gray-200'>
                    {player.jersey_number || '#'}
                  </div>
                  <div className='flex flex-col'>
                    <span className='truncate text-sm font-semibold'>
                      {player.name}
                    </span>
                    <span className='text-[10px] text-gray-400'>
                      {player.position || 'Player'}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-500'>
                {player.stats.minutes_played || '-'}
              </TableCell>
              <TableCell className='text-center font-mono text-sm font-bold text-gray-900'>
                {player.stats.pts || 0}
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-600'>
                {player.stats.reb || 0}
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-600'>
                {player.stats.ast || 0}
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-600'>
                {player.stats.steals || 0}
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-600'>
                {player.stats.blocks || 0}
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-600'>
                {player.stats.turnovers || 0}
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-600'>
                {player.stats.personal_fouls || 0}
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-600'>
                {player.stats.fg_made || 0}
              </TableCell>
              <TableCell className='text-center font-mono text-xs text-gray-600'>
                {player.stats.three_pt_made || 0}
              </TableCell>
            </motion.tr>
          ))}
          {playerStats.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={11}
                className='h-32 text-center text-gray-500'
              >
                <div className='flex flex-col items-center justify-center gap-2'>
                  <div className='rounded-full bg-gray-100 p-3'>
                    <Users className='h-6 w-6 text-gray-400' />
                  </div>
                  <p className='font-medium'>No player stats available.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
};

const TeamComparison = ({ match }) => {
  const getTeamStats = (team) => {
    const teamPlayerIds = new Set(team.players.map((p) => p.id));
    const teamStats = (match.match_player_stats || []).filter((s) =>
      teamPlayerIds.has(s.player_id)
    );

    return {
      fgm: teamStats.reduce((sum, s) => sum + (Number(s.fg_made) || 0), 0),
      threePm: teamStats.reduce(
        (sum, s) => sum + (Number(s.three_pt_made) || 0),
        0
      ),
      ftm: teamStats.reduce((sum, s) => sum + (Number(s.ft_made) || 0), 0),
      reb: teamStats.reduce((sum, s) => sum + (Number(s.reb) || 0), 0),
      ast: teamStats.reduce((sum, s) => sum + (Number(s.ast) || 0), 0),
      stl: teamStats.reduce((sum, s) => sum + (Number(s.steals) || 0), 0),
      blk: teamStats.reduce((sum, s) => sum + (Number(s.blocks) || 0), 0),
      to: teamStats.reduce((sum, s) => sum + (Number(s.turnovers) || 0), 0),
    };
  };

  const t1Stats = getTeamStats(match.team1);
  const t2Stats = getTeamStats(match.team2);

  const metrics = [
    { label: 'Field Goals', key: 'fgm' },
    { label: '3-Pointers', key: 'threePm' },
    { label: 'Free Throws', key: 'ftm' },
    { label: 'Rebounds', key: 'reb' },
    { label: 'Assists', key: 'ast' },
    { label: 'Steals', key: 'stl' },
    { label: 'Blocks', key: 'blk' },
    { label: 'Turnovers', key: 'to' },
  ];

  return (
    <div className='flex flex-col gap-6 rounded-3xl border border-white/60 bg-white p-8 shadow-sm ring-1 ring-gray-100'>
      {/* Team Headers */}
      <div className='mb-2 flex items-center justify-between px-4'>
        <div className='flex items-center gap-3'>
          <div
            className='h-4 w-4 rounded-full ring-2 ring-gray-100'
            style={{
              backgroundColor: `#${getDepartmentColor(match.team1?.department?.acronym)}`,
            }}
          />
          <span className='font-bold text-gray-900'>
            {match.team1?.department?.acronym || 'HOME'}
          </span>
        </div>
        <h3 className='flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400'>
          <Trophy className='h-3 w-3' /> Comparison
        </h3>
        <div className='flex items-center gap-3'>
          <span className='font-bold text-gray-900'>
            {match.team2?.department?.acronym || 'AWAY'}
          </span>
          <div
            className='h-4 w-4 rounded-full ring-2 ring-gray-100'
            style={{
              backgroundColor: `#${getDepartmentColor(match.team2?.department?.acronym)}`,
            }}
          />
        </div>
      </div>

      <div className='space-y-7'>
        {metrics.map((metric, index) => {
          const total =
            (t1Stats[metric.key] || 0) + (t2Stats[metric.key] || 0) || 1;
          const t1Percent = ((t1Stats[metric.key] || 0) / total) * 100;
          const t2Percent = ((t2Stats[metric.key] || 0) / total) * 100;
          const t1Color = getDepartmentColor(match.team1?.department?.acronym);
          const t2Color = getDepartmentColor(match.team2?.department?.acronym);

          return (
            <div key={metric.key} className='group'>
              <div className='mb-2 flex items-end justify-between px-2 text-sm'>
                <span className='w-12 font-mono text-xl font-bold text-gray-900'>
                  {t1Stats[metric.key] || 0}
                </span>
                <span className='text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors group-hover:text-blue-500'>
                  {metric.label}
                </span>
                <span className='w-12 text-right font-mono text-xl font-bold text-gray-900'>
                  {t2Stats[metric.key] || 0}
                </span>
              </div>

              <div className='flex h-3 w-full overflow-hidden rounded-full bg-gray-50 ring-1 ring-gray-100'>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${t1Percent}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: index * 0.03,
                  }}
                  className='h-full'
                  style={{ backgroundColor: `#${t1Color}` }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${t2Percent}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: index * 0.03,
                  }}
                  className='h-full'
                  style={{ backgroundColor: `#${t2Color}` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// End of file
