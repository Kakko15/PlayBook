import { useNavigate } from 'react-router-dom';
import { Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Icon from '@/components/Icon';
import GameIcon from '@/components/GameIcon';
import { formatDateRange, getStatus } from '@/lib/tournamentUtils.jsx';

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

const TournamentListItem = ({ tournament }) => {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  if (!tournament) return null;

  const teamCount = tournament.teams?.[0]?.count || 0;
  const status = getStatus(tournament.start_date);
  const dateRange = formatDateRange(tournament.start_date, tournament.end_date);

  const handleClick = () => {
    if (isDragging) return;
    const path = `/admin/tournament/${tournament.id}`;
    navigate(path);
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    dragControls.start(e);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    document.body.classList.add('is-dragging');
  };

  const handleDragEnd = () => {
    document.body.classList.remove('is-dragging');
    setTimeout(() => setIsDragging(false), 0);
  };

  return (
    <Reorder.Item
      value={tournament}
      variants={itemVariants}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      layout
      transition={{
        layout: {
          type: 'tween',
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      whileDrag={{
        scale: 1.02,
        cursor: 'grabbing',
        zIndex: 10,
        boxShadow:
          '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        transition: {
          duration: 0.15,
        },
      }}
      className='group flex w-full cursor-grab select-none items-center gap-4 rounded-lg bg-surface-variant p-4 transition-colors duration-300 ease-out hover:bg-surface-variant/80'
    >
      <GameIcon game={tournament.game} className='h-12 w-12' />

      <div className='flex-1 truncate'>
        <h3
          className='truncate font-sans text-lg font-bold text-on-surface'
          title={tournament.name}
        >
          {tournament.name}
        </h3>
        <div className='flex items-center gap-4 text-sm text-on-surface-variant'>
          <span className='flex items-center'>
            <Icon name='group' className='mr-1.5 text-base' />
            {teamCount} team{teamCount !== 1 ? 's' : ''}
          </span>
          <span className='flex items-center'>
            <Icon name='calendar_month' className='mr-1.5 text-base' />
            {dateRange}
          </span>
        </div>
      </div>

      <div className='flex flex-shrink-0 items-center gap-4'>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            status.color
          )}
        >
          {status.text}
        </span>
        <Icon
          name='chevron_right'
          className='text-on-surface-variant transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary'
        />
      </div>
    </Reorder.Item>
  );
};

export default TournamentListItem;
