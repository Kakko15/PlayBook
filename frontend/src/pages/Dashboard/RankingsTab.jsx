import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

  const exportPlayersToCSV = () => {
    if (playerRankings.length === 0) {
      toast.error('No player data to export.');
      return;
    }

    // Define CSV headers
    const headers = [
      'Rank',
      'Player Name',
      'Team',
      'ISU-PS',
      'Offensive Rating',
      'Defensive Rating',
      'Games Played',
      'Sportsmanship',
    ];

    // Sort by ISU-PS descending and create rows
    const sortedPlayers = [...playerRankings].sort(
      (a, b) => b.isu_ps - a.isu_ps
    );

    const rows = sortedPlayers.map((player, index) => [
      index + 1,
      player.name,
      player.team?.name || 'N/A',
      player.isu_ps?.toFixed(2) || '0.00',
      player.offensive_rating?.toFixed(2) || '0.00',
      player.defensive_rating?.toFixed(2) || '0.00',
      player.game_count || 0,
      player.avg_sportsmanship?.toFixed(2) || '5.00',
    ]);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `player_rankings_${tournamentId}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Player rankings exported successfully!');
  };

  const exportDepartmentsToCSV = () => {
    if (departmentRankings.length === 0) {
      toast.error('No department data to export.');
      return;
    }

    const headers = ['Rank', 'Department', 'Acronym', 'ELO Rating'];

    const rows = departmentRankings.map((dept, index) => [
      index + 1,
      dept.name,
      dept.acronym,
      dept.elo_rating,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `department_rankings_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Department rankings exported successfully!');
  };

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
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
            <span className='material-symbols-rounded text-lg text-muted-foreground'>
              person
            </span>
          </div>
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
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Player Rankings (ISU-PS)</CardTitle>
          <Button
            variant='outline'
            size='sm'
            onClick={exportPlayersToCSV}
            disabled={playerRankings.length === 0}
          >
            <Download className='mr-2 h-4 w-4' />
            Export CSV
          </Button>
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
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Department Rankings (ELO)</CardTitle>
          <Button
            variant='outline'
            size='sm'
            onClick={exportDepartmentsToCSV}
            disabled={departmentRankings.length === 0}
          >
            <Download className='mr-2 h-4 w-4' />
            Export CSV
          </Button>
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
