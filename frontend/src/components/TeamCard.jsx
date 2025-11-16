import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu';
import Icon from '@/components/Icon';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const TeamCard = ({ team, onEdit, onDelete, onManagePlayers }) => {
  if (!team) return null;

  const playerCount = team.players?.[0]?.count || 0;

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(team);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(team);
  };

  const handleManagePlayers = (e) => {
    e.stopPropagation();
    onManagePlayers(team);
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className='flex flex-col justify-between'>
        <CardContent className='flex items-center justify-between p-4 pb-0'>
          <div className='flex items-center gap-3 overflow-hidden'>
            <img
              src={
                team.logo_url ||
                `https://avatar.vercel.sh/${team.name || 'T'}.png`
              }
              alt={`${team.name} logo`}
              className='h-12 w-12 flex-shrink-0 rounded-full bg-muted'
              onError={(e) => {
                e.currentTarget.src = `https://avatar.vercel.sh/${team.name || 'T'}.png`;
              }}
            />
            <div className='overflow-hidden'>
              <h3
                className='truncate font-semibold text-foreground'
                title={team.name}
              >
                {team.name}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {playerCount} player{playerCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                onClick={(e) => e.stopPropagation()}
                className='h-8 w-8 flex-shrink-0'
              >
                <Icon name='more_vert' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={handleEdit}>
                <Icon name='edit' className='mr-2' />
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-destructive focus:text-destructive'
              >
                <Icon name='delete' className='mr-2' />
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
        <CardFooter className='p-4'>
          <Button
            variant='outline'
            className='w-full'
            onClick={handleManagePlayers}
          >
            <Icon name='manage_accounts' className='mr-2' />
            Manage Roster
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TeamCard;
