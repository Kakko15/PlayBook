import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Player Rankings (ISU-PS)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto rounded-lg border border-border'>
            <table className='w-full'>
              <thead className='bg-surface-variant'>
                <tr>
                  <th className='px-4 py-3 text-left font-medium text-on-surface-variant'>
                    Rank
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-on-surface-variant'>
                    Player
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-on-surface-variant'>
                    Team
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-on-surface-variant'>
                    ISU-PS
                  </th>
                </tr>
              </thead>
              <tbody>
                {playerRankings.map((player, index) => (
                  <tr
                    key={player.id}
                    className='border-b border-border last:border-b-0 hover:bg-muted/50'
                  >
                    <td className='px-4 py-3 font-medium text-foreground'>
                      {index + 1}
                    </td>
                    <td className='flex items-center gap-3 px-4 py-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${player.name}.png`}
                        />
                        <AvatarFallback>
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='font-medium text-foreground'>
                        {player.name}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      {player.team.name}
                    </td>
                    <td className='px-4 py-3 font-bold text-primary'>
                      {player.isu_ps.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Rankings (ELO)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto rounded-lg border border-border'>
            <table className='w-full'>
              <thead className='bg-surface-variant'>
                <tr>
                  <th className='px-4 py-3 text-left font-medium text-on-surface-variant'>
                    Rank
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-on-surface-variant'>
                    Department
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-on-surface-variant'>
                    ELO
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentRankings.map((dept, index) => (
                  <tr
                    key={dept.id}
                    className='border-b border-border last:border-b-0 hover:bg-muted/50'
                  >
                    <td className='px-4 py-3 font-medium text-foreground'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3'>
                      <span className='font-medium text-foreground'>
                        {dept.name} ({dept.acronym})
                      </span>
                    </td>
                    <td className='px-4 py-3 font-bold text-primary'>
                      {dept.elo_rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingsTab;
