import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy } from 'lucide-react';

const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};

const RankingsWidget = ({ tournamentId }) => {
  const [playerRankings, setPlayerRankings] = useState([]);
  const [departmentRankings, setDepartmentRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId) return;

      setIsLoading(true);
      try {
        const [playerData, deptData] = await Promise.all([
          api.getPlayerRankings(tournamentId),
          api.getDepartments(),
        ]);

        const sortedDepts = deptData.sort(
          (a, b) => b.elo_rating - a.elo_rating
        );

        setPlayerRankings(playerData.slice(0, 5)); // Top 5
        setDepartmentRankings(sortedDepts.slice(0, 5)); // Top 5
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  if (!tournamentId) return null;

  return (
    <motion.div variants={itemVariants} className='h-full'>
      <Card className='flex h-full flex-col'>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Trophy className='h-5 w-5 text-primary' />
            Live Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className='flex-1'>
          {isLoading ? (
            <div className='flex h-full min-h-[200px] items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : (
            <Tabs defaultValue='players' className='w-full'>
              <TabsList className='mb-4 grid w-full grid-cols-2'>
                <TabsTrigger value='players'>Top Players</TabsTrigger>
                <TabsTrigger value='departments'>Top Depts</TabsTrigger>
              </TabsList>

              <TabsContent value='players' className='mt-0'>
                <div className='space-y-4'>
                  {playerRankings.map((player, index) => (
                    <div
                      key={player.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : index === 1
                                ? 'bg-gray-100 text-gray-700'
                                : index === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${player.name}.png`}
                          />
                          <AvatarFallback>
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='text-sm font-medium leading-none'>
                            {player.name}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {player.team.name}
                          </span>
                        </div>
                      </div>
                      <span className='font-bold text-primary'>
                        {player.isu_ps.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  {playerRankings.length === 0 && (
                    <p className='py-4 text-center text-sm text-muted-foreground'>
                      No player data yet
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='departments' className='mt-0'>
                <div className='space-y-4'>
                  {departmentRankings.map((dept, index) => (
                    <div
                      key={dept.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : index === 1
                                ? 'bg-gray-100 text-gray-700'
                                : index === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-sm font-medium leading-none'>
                            {dept.name}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {dept.acronym}
                          </span>
                        </div>
                      </div>
                      <span className='font-bold text-primary'>
                        {dept.elo_rating}
                      </span>
                    </div>
                  ))}
                  {departmentRankings.length === 0 && (
                    <p className='py-4 text-center text-sm text-muted-foreground'>
                      No department data yet
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RankingsWidget;
