import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/Icon';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
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

const formatMatchTime = (dateString) => {
  if (!dateString) return 'Time TBD';
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isToday) return `Today @ ${time}`;
  if (isTomorrow) return `Tomorrow @ ${time}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} @ ${time}`;
};

const TeamDisplay = ({ team, align = 'left' }) => {
  const acronym =
    team?.department?.acronym ||
    team?.name?.substring(0, 2).toUpperCase() ||
    'NA';
  const color = DEPARTMENT_COLORS[acronym] || '64748b';
  const logoSrc =
    team?.logo_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym)}&background=${color}&color=fff&size=128&bold=true&length=4`;

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 items-center gap-3',
        align === 'right' ? 'flex-row-reverse text-right' : 'text-left'
      )}
    >
      <img
        src={logoSrc}
        alt={`${team?.name || 'TBD'} logo`}
        className='h-10 w-10 flex-shrink-0 rounded-full bg-muted object-cover shadow-sm'
        onError={(e) => {
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym)}&background=random&color=fff`;
        }}
      />
      <div className='flex min-w-0 flex-col'>
        <span className='truncate text-lg font-bold text-on-surface sm:text-xl'>
          {acronym}
        </span>
        {team?.name && (
          <span className='truncate text-xs font-medium text-on-surface-variant/70'>
            {team.name}
          </span>
        )}
      </div>
    </div>
  );
};

const UpNextCard = ({ nextMatch, tournamentName, onLogResult }) => {
  if (!nextMatch) {
    return (
      <motion.div variants={itemVariants}>
        <Card className='flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface'>
          <div className='text-center'>
            <Icon
              name='event_available'
              className='text-5xl text-on-surface-variant'
            />
            <p className='mt-2 font-medium text-on-surface'>
              No upcoming matches
            </p>
            <p className='text-sm text-on-surface-variant'>
              Your schedule is clear!
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className='rounded-xl border-outline-variant bg-surface p-6'>
        <CardContent className='p-0'>
          <div className='mb-4 flex items-center justify-between'>
            <span className='text-sm font-medium uppercase text-primary'>
              Up Next
            </span>
            <span className='text-sm font-medium text-on-surface-variant'>
              {tournamentName}
            </span>
          </div>

          <div className='flex items-center justify-between gap-4'>
            <TeamDisplay team={nextMatch.team1} />
            <span className='shrink-0 text-sm font-medium uppercase text-on-surface-variant/50'>
              vs
            </span>
            <TeamDisplay team={nextMatch.team2} align='right' />
          </div>

          <div className='mt-6 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-on-surface-variant'>
              <Icon name='calendar_month' className='text-xl' />
              <span className='font-medium'>
                {formatMatchTime(nextMatch.match_date)}
              </span>
            </div>
            <Button
              onClick={() => onLogResult(nextMatch)}
              disabled={!nextMatch.team1 || !nextMatch.team2}
            >
              <Icon name='edit_note' className='mr-2' />
              Log Result
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UpNextCard;
