import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SortableTable from '@/components/ui/SortableTable';

const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};

const RankingsTab = ({ tournamentId }) => {
  const [playerRankings, setPlayerRankings] = useState([]);
  const [departmentRankings, setDepartmentRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [playerData, deptData] = await Promise.all([
        api.getPlayerRankings(tournamentId),
        api.getDepartments(),
      ]);

      const sortedDepts = deptData.sort((a, b) => b.elo_rating - a.elo_rating);

      setPlayerRankings(playerData);
      setDepartmentRankings(sortedDepts);
    } catch (error) {
      toast.error('Failed to fetch rankings.');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  const playerColumns = [
    {
      key: 'rank',
      header: 'Rank',
      sortable: true,
      renderCell: (row, value, index) => (
        <span className='font-medium text-foreground'>{index + 1}</span>
      ),
    },
    {
      key: 'name',
      header: 'Player',
      sortable: true,
      filterable: true,
      renderCell: (row) => (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={`https://avatar.vercel.sh/${row.name}.png`} />
            <AvatarFallback>{getInitials(row.name)}</AvatarFallback>
          </Avatar>
          <span className='font-medium text-foreground'>{row.name}</span>
        </div>
      ),
    },
    {
      key: 'team',
      header: 'Team',
      sortable: true,
      filterable: true,
      sortKey: 'team.name',
      filterKey: 'team.name',
      renderCell: (row) => (
        <span className='text-muted-foreground'>{row.team.name}</span>
      ),
    },
    {
      key: 'isu_ps',
      header: 'ISU-PS',
      sortable: true,
      renderCell: (row) => (
        <span className='font-bold text-primary'>{row.isu_ps.toFixed(2)}</span>
      ),
    },
  ];

  const departmentColumns = [
    {
      key: 'rank',
      header: 'Rank',
      sortable: true,
      renderCell: (row, value, index) => (
        <span className='font-medium text-foreground'>{index + 1}</span>
      ),
    },
    {
      key: 'name',
      header: 'Department',
      sortable: true,
      filterable: true,
      renderCell: (row) => (
        <span className='font-medium text-foreground'>
          {row.name} ({row.acronym})
        </span>
      ),
    },
    {
      key: 'elo_rating',
      header: 'ELO',
      sortable: true,
      renderCell: (row) => (
        <span className='font-bold text-primary'>{row.elo_rating}</span>
      ),
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Player Rankings (ISU-PS)</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={playerRankings}
            columns={playerColumns}
            defaultSortKey='isu_ps'
            defaultSortOrder='desc'
            emptyMessage='No player rankings available'
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Rankings (ELO)</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={departmentRankings}
            columns={departmentColumns}
            defaultSortKey='elo_rating'
            defaultSortOrder='desc'
            emptyMessage='No department rankings available'
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingsTab;
