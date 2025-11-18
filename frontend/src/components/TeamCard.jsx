import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, XCircle, Edit, Trash2, UserCog } from 'lucide-react';

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

const TeamCard = ({ team, onEdit, onDelete, onManagePlayers }) => {
  const isOldLogo = team.logo_url && team.logo_url.includes('avatar.vercel.sh');

  const acronym =
    team.department?.acronym || team.name.substring(0, 2).toUpperCase();

  const color = DEPARTMENT_COLORS[acronym] || '64748b';

  const logoSrc =
    team.logo_url && !isOldLogo
      ? team.logo_url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym)}&background=${color}&color=fff&size=128&bold=true&length=4`;

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardHeader className='flex flex-row items-center gap-4 space-y-0 pb-2'>
        <div className='h-14 w-14 overflow-hidden rounded-full border-2 border-border bg-muted'>
          <img
            src={logoSrc}
            alt={team.name}
            className='h-full w-full object-cover'
          />
        </div>
        <div className='flex-1 overflow-hidden'>
          <CardTitle className='truncate text-lg font-bold leading-none'>
            {team.name}
          </CardTitle>
          <p className='mt-1 text-xs text-muted-foreground'>
            Elo: {team.elo_rating}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <div className='flex gap-4'>
            <span className='flex items-center gap-1 font-medium text-green-600'>
              <Trophy className='h-4 w-4' /> {team.wins} W
            </span>
            <span className='flex items-center gap-1 font-medium text-red-600'>
              <XCircle className='h-4 w-4' /> {team.losses} L
            </span>
          </div>
          <span className='flex items-center gap-1'>
            <Users className='h-4 w-4' />{' '}
            {team.players ? team.players[0].count : 0} Players
          </span>
        </div>

        <div className='mt-4 flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            onClick={() => onManagePlayers(team)}
          >
            <UserCog className='mr-2 h-4 w-4' />
            Roster
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9'
            onClick={() => onEdit(team)}
          >
            <Edit className='h-4 w-4 text-muted-foreground' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9 hover:bg-destructive/10 hover:text-destructive'
            onClick={() => onDelete(team)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
