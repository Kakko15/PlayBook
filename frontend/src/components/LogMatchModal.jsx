import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatSchema = (game) => {
  switch (game) {
    case 'basketball':
    default:
      return z.object({
        minutes_played: z.coerce.number().min(0).max(60).default(0),
        pts: z.coerce.number().min(0).default(0),
        reb: z.coerce.number().min(0).default(0),
        ast: z.coerce.number().min(0).default(0),
        fg_made: z.coerce.number().min(0).default(0),
        three_pt_made: z.coerce.number().min(0).default(0),
        steals: z.coerce.number().min(0).default(0),
        blocks: z.coerce.number().min(0).default(0),
        // Keep other fields hidden or optional if needed for backend compatibility
        fg_attempted: z.coerce.number().min(0).default(0),
        three_pt_attempted: z.coerce.number().min(0).default(0),
        ft_made: z.coerce.number().min(0).default(0),
        ft_attempted: z.coerce.number().min(0).default(0),
        oreb: z.coerce.number().min(0).default(0),
        dreb: z.coerce.number().min(0).default(0),
        turnovers: z.coerce.number().min(0).default(0),
        personal_fouls: z.coerce.number().min(0).default(0),
        technical_fouls: z.coerce.number().min(0).default(0),
        fouls_drawn: z.coerce.number().min(0).default(0),
        games_started: z.coerce.number().min(0).max(1).default(0),
        sportsmanship_rating: z.coerce.number().min(0).max(5).default(5),
      });
  }
};

const getFormSchema = (game) =>
  z.object({
    team1_score: z.coerce.number().min(0, 'Score is required.'),
    team2_score: z.coerce.number().min(0, 'Score is required.'),
    match_date: z.string().optional(),
    round_name: z.string().optional(),
    venue: z.string().optional(),
    player_stats: z.array(
      z.object({
        player_id: z.string(),
        team_id: z.string(), // Added team_id
        name: z.string(),
        stats: getStatSchema(game),
      })
    ),
  });

const LogMatchModal = ({ isOpen, onClose, onSuccess, match, game }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('team1');

  const formSchema = getFormSchema(game);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      team1_score: 0,
      team2_score: 0,
      match_date: '',
      round_name: '',
      venue: '',
      player_stats: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'player_stats',
  });

  // Watch all player stats to calculate team totals
  const playerStats = useWatch({
    control: form.control,
    name: 'player_stats',
  });

  useEffect(() => {
    if (!playerStats || !matchDetails) return;

    const calculateTeamScore = (teamId) => {
      return playerStats
        .filter((p) => p.team_id === teamId)
        .reduce((sum, p) => sum + (Number(p.stats?.pts) || 0), 0);
    };

    const t1Score = calculateTeamScore(matchDetails.team1.id);
    const t2Score = calculateTeamScore(matchDetails.team2.id);

    // Only update if different to avoid infinite loops (though setValue shouldn't trigger this if value is same)
    if (t1Score !== form.getValues('team1_score')) {
      form.setValue('team1_score', t1Score);
    }
    if (t2Score !== form.getValues('team2_score')) {
      form.setValue('team2_score', t2Score);
    }
  }, [playerStats, matchDetails, form]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.getMatchDetails(match.id);
        setMatchDetails(data);

        // Map existing stats if available
        const statsMap = {};
        if (data.match_player_stats) {
          data.match_player_stats.forEach((stat) => {
            statsMap[stat.player_id] = stat;
          });
        }

        const team1Players = data.team1.players.map((p) => ({
          player_id: p.id,
          team_id: data.team1.id,
          name: p.name,
          stats: statsMap[p.id] || {},
        }));
        const team2Players = data.team2.players.map((p) => ({
          player_id: p.id,
          team_id: data.team2.id,
          name: p.name,
          stats: statsMap[p.id] || {},
        }));

        form.reset({
          team1_score: data.team1_score ?? 0,
          team2_score: data.team2_score ?? 0,
          match_date: data.match_date
            ? new Date(data.match_date).toISOString().slice(0, 16)
            : '',
          round_name: data.round_name ?? '',
          venue: data.venue ?? '',
          player_stats: [...team1Players, ...team2Players],
        });
      } catch (error) {
        toast.error('Failed to load match details.');
      }
    };

    if (match && isOpen) {
      fetchDetails();
      setActiveTab('team1');
    }
  }, [match, form, game, isOpen]);

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      await api.logMatchResult(match.id, {
        ...values,
        match_date: values.match_date
          ? new Date(values.match_date).toISOString()
          : null,
      });
      toast.success('Match result saved!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save result.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatFields = () => {
    switch (game) {
      case 'basketball':
      default:
        return [
          { key: 'minutes_played', label: 'MIN' },
          { key: 'pts', label: 'PTS' },
          { key: 'fg_made', label: 'FGM' },
          { key: 'fg_attempted', label: 'FGA' },
          { key: 'three_pt_made', label: '3PM' },
          { key: 'three_pt_attempted', label: '3PA' },
          { key: 'ft_made', label: 'FTM' },
          { key: 'ft_attempted', label: 'FTA' },
          { key: 'reb', label: 'REB' },
          { key: 'oreb', label: 'OREB' },
          { key: 'dreb', label: 'DREB' },
          { key: 'ast', label: 'AST' },
          { key: 'steals', label: 'STL' },
          { key: 'blocks', label: 'BLK' },
          { key: 'turnovers', label: 'TO' },
          { key: 'personal_fouls', label: 'PF' },
          { key: 'technical_fouls', label: 'TF' },
          { key: 'fouls_drawn', label: 'FD' },
          { key: 'games_started', label: 'GS' },
          { key: 'sportsmanship_rating', label: 'SPRT' },
        ];
    }
  };

  const statCols = getStatFields();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='flex h-[90vh] max-w-[95vw] flex-col gap-0 overflow-hidden p-0 md:max-w-[90vw] lg:max-w-7xl'>
        <DialogHeader className='hidden'>
          <DialogTitle>Log Match Result</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-1 flex-col overflow-hidden bg-background'
          >
            {/* Header Section */}
            <div className='flex flex-col border-b bg-card p-6 shadow-sm'>
              <div className='mb-6 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground'>
                    {matchDetails?.team1?.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold'>
                      {matchDetails?.team1?.name}
                    </h2>
                    <p className='text-muted-foreground'>Home</p>
                  </div>
                </div>

                <div className='flex items-center gap-8'>
                  <FormField
                    control={form.control}
                    name='team1_score'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='number'
                            className='h-16 w-24 text-center text-4xl font-bold'
                            disabled
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className='text-4xl font-light text-muted-foreground'>
                    -
                  </span>
                  <FormField
                    control={form.control}
                    name='team2_score'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='number'
                            className='h-16 w-24 text-center text-4xl font-bold'
                            disabled
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex items-center gap-4 text-right'>
                  <div>
                    <h2 className='text-2xl font-bold'>
                      {matchDetails?.team2?.name}
                    </h2>
                    <p className='text-muted-foreground'>Away</p>
                  </div>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground'>
                    {matchDetails?.team2?.name?.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='round_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder='Round' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='match_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type='datetime-local' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='venue'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {(game || '').toLowerCase() === 'basketball' ? (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value || undefined}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select venue' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='Open Gym'>Open Gym</SelectItem>
                              <SelectItem value='Close Gym'>
                                Close Gym
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input placeholder='Venue' {...field} />
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tabs & Table Section */}
            <div className='flex-1 overflow-hidden'>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='flex h-full flex-col'
              >
                <div className='border-b px-6'>
                  <TabsList className='bg-transparent p-0'>
                    <TabsTrigger
                      value='team1'
                      className='rounded-none border-b-2 border-transparent px-6 py-3 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary'
                    >
                      {matchDetails?.team1?.name?.toUpperCase()}
                    </TabsTrigger>
                    <TabsTrigger
                      value='team2'
                      className='rounded-none border-b-2 border-transparent px-6 py-3 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary'
                    >
                      {matchDetails?.team2?.name?.toUpperCase()}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value='team1' className='flex-1 overflow-auto p-0'>
                  <PlayerStatsTable
                    fields={fields}
                    teamId={matchDetails?.team1?.id}
                    statCols={statCols}
                    form={form}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value='team2' className='flex-1 overflow-auto p-0'>
                  <PlayerStatsTable
                    fields={fields}
                    teamId={matchDetails?.team2?.id}
                    statCols={statCols}
                    form={form}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className='flex-shrink-0 border-t bg-card p-6'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Save Match Result
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const PlayerStatsTable = ({ fields, teamId, statCols, form, isLoading }) => {
  const teamFields = fields
    .map((field, index) => ({ ...field, index }))
    .filter((field) => field.team_id === teamId);

  return (
    <div className='min-w-max'>
      <div className='sticky top-0 z-30 flex items-center border-b bg-muted/90 px-4 py-2 backdrop-blur-sm'>
        <div className='sticky left-0 z-40 w-48 flex-shrink-0 border-r bg-muted/95 pr-4 text-sm font-semibold shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]'>
          Player Name
        </div>
        <div className='flex gap-2 pl-4'>
          {statCols.map((col) => (
            <div
              key={col.key}
              className='w-16 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground'
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>

      <div className='divide-y'>
        {teamFields.map((field) => (
          <PlayerRow
            key={field.id}
            field={field}
            index={field.index}
            statCols={statCols}
            form={form}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

const PlayerRow = ({ field, index, statCols, form, isLoading }) => {
  const stats = useWatch({
    control: form.control,
    name: `player_stats.${index}.stats`,
  });

  useEffect(() => {
    if (stats) {
      const fgm = Number(stats.fg_made) || 0;
      const threePm = Number(stats.three_pt_made) || 0;
      const ftm = Number(stats.ft_made) || 0;

      // Formula: (FGM * 2) + 3PM + FTM
      const points = fgm * 2 + threePm + ftm;

      if (stats.pts !== points) {
        form.setValue(`player_stats.${index}.stats.pts`, points, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [stats?.fg_made, stats?.three_pt_made, stats?.ft_made, index, form]);

  return (
    <div className='group flex items-center px-4 py-2 transition-colors even:bg-muted/5 hover:bg-muted/20'>
      <div className='sticky left-0 z-20 w-48 flex-shrink-0 truncate border-r bg-card pr-4 text-sm font-medium shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-muted/20 group-even:group-hover:bg-muted/20'>
        {field.name}
        <input
          type='hidden'
          {...form.register(`player_stats.${index}.player_id`)}
        />
        <input type='hidden' {...form.register(`player_stats.${index}.name`)} />
        <input
          type='hidden'
          {...form.register(`player_stats.${index}.team_id`)}
        />
      </div>
      <div className='flex gap-2 pl-4'>
        {statCols.map((col) => (
          <FormField
            key={col.key}
            control={form.control}
            name={`player_stats.${index}.stats.${col.key}`}
            render={({ field: inputField }) => (
              <div className='w-16'>
                <FormControl>
                  <Input
                    type='number'
                    className='h-8 px-1 text-center text-sm'
                    disabled={isLoading || col.key === 'pts'}
                    onFocus={(e) => e.target.select()}
                    {...inputField}
                  />
                </FormControl>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default LogMatchModal;
