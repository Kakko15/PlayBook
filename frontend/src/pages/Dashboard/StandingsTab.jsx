import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import SortableTable from '@/components/ui/SortableTable';

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

const StandingsTab = ({ tournamentId }) => {
  const [standings, setStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStandings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getStandings(tournamentId);
      setStandings(data);
    } catch (error) {
      toast.error('Failed to fetch standings.');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  const columns = [
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
      header: 'Team',
      sortable: true,
      filterable: true,
      renderCell: (row) => {
        const isOldLogo =
          row.logo_url && row.logo_url.includes('avatar.vercel.sh');
        const acronym =
          row.department?.acronym || row.name.substring(0, 2).toUpperCase();
        const color = DEPARTMENT_COLORS[acronym] || '64748b';
        const logoSrc =
          row.logo_url && !isOldLogo
            ? row.logo_url
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym)}&background=${color}&color=fff&size=128&bold=true&length=4`;

        return (
          <div className='flex items-center gap-3'>
            <img
              src={logoSrc}
              alt={`${row.name} logo`}
              className='h-8 w-8 rounded-full bg-muted'
            />
            <span className='font-medium text-foreground'>{row.name}</span>
          </div>
        );
      },
    },
    {
      key: 'wl',
      header: 'W-L',
      sortable: true,
      renderCell: (row) => (
        <span className='text-muted-foreground'>
          {row.wins} - {row.losses}
        </span>
      ),
    },
    {
      key: 'elo_rating',
      header: 'ELO',
      sortable: true,
      renderCell: (row) => (
        <span className='text-muted-foreground'>{row.elo_rating}</span>
      ),
    },
  ];

  return (
    <SortableTable
      data={standings}
      columns={columns}
      defaultSortKey='elo_rating'
      defaultSortOrder='desc'
      emptyMessage='No standings available'
    />
  );
};

export default StandingsTab;
