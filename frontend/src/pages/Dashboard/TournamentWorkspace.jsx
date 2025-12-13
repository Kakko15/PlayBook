import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameIcon from '@/components/GameIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamsTab from './TeamsTab';
import ScheduleTab from './ScheduleTab';
import StandingsTab from './StandingsTab';
import PlayoffsTab from './PlayoffsTab';
import RankingsTab from './RankingsTab';
import AwardsTab from './AwardsTab';
import Icon from '@/components/Icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const TournamentWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchTournament = async () => {
    try {
      const data = await api.getTournamentById(id);
      setTournament(data);
    } catch (error) {
      toast.error('Failed to fetch tournament details.');
      navigate('/admin/tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id, navigate]);

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(`tournament-tab-${id}`) || 'teams'
  );

  const handleTabChange = (value) => {
    setActiveTab(value);
    localStorage.setItem(`tournament-tab-${id}`, value);
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  return (
    <>
      <div className='flex min-h-screen flex-col bg-background'>
        <header className='flex items-center gap-4 border-b border-border bg-card p-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate('/admin/tournaments')}
          >
            <Icon name='arrow_back' />
          </Button>
          <GameIcon game={tournament.game} />
          <div>
            <h1 className='font-sans text-2xl font-bold text-foreground'>
              {tournament.name}
            </h1>
            <p className='text-sm text-muted-foreground'>
              Tournament Workspace
            </p>
          </div>
        </header>

        <main className='flex-1 p-4 md:p-8'>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-1 sm:grid-cols-7'>
              <TabsTrigger value='teams'>
                <Icon name='group' className='mr-0 h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline'>Teams</span>
              </TabsTrigger>
              <TabsTrigger value='schedule'>
                <Icon name='calendar_month' className='mr-0 h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline'>Schedule</span>
              </TabsTrigger>
              <TabsTrigger value='standings'>
                <Icon name='leaderboard' className='mr-0 h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline'>Standings</span>
              </TabsTrigger>
              <TabsTrigger value='playoffs'>
                <Icon name='emoji_events' className='mr-0 h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline'>Playoffs</span>
              </TabsTrigger>

              <TabsTrigger value='rankings'>
                <Icon
                  name='workspace_premium'
                  className='mr-0 h-4 w-4 sm:mr-2'
                />
                <span className='hidden sm:inline'>Rankings</span>
              </TabsTrigger>
              <TabsTrigger value='awards'>
                <Icon name='military_tech' className='mr-0 h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline'>Awards</span>
              </TabsTrigger>
              <TabsTrigger
                value='settings'
                onClick={(e) => {
                  e.preventDefault();
                  setIsSettingsOpen(true);
                }}
              >
                <Icon name='settings' className='mr-0 h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline'>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='teams' className='mt-6'>
              <TeamsTab tournamentId={tournament.id} />
            </TabsContent>
            <TabsContent value='schedule' className='mt-6'>
              <ScheduleTab
                tournamentId={tournament.id}
                game={tournament.game}
              />
            </TabsContent>
            <TabsContent value='standings' className='mt-6'>
              <StandingsTab tournamentId={tournament.id} />
            </TabsContent>
            <TabsContent value='playoffs' className='mt-6'>
              <PlayoffsTab
                tournamentId={tournament.id}
                game={tournament.game}
              />
            </TabsContent>

            <TabsContent value='rankings' className='mt-6'>
              <RankingsTab tournamentId={tournament.id} />
            </TabsContent>
            <TabsContent value='awards' className='mt-6'>
              <AwardsTab tournamentId={tournament.id} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <TournamentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tournament={tournament}
        onSuccess={fetchTournament}
      />
    </>
  );
};

const TournamentSettingsModal = ({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(tournament.registration_open);
  const [isGeneratingMock, setIsGeneratingMock] = useState(false);
  const [showMockConfirm, setShowMockConfirm] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateTournament(tournament.id, { registrationOpen: isPublic });
      toast.success('Settings updated!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateMock = async () => {
    setIsGeneratingMock(true);
    try {
      const result = await api.generateMockTournament(tournament.id);
      toast.success(
        `Mock data generated! ${result.stats.playersGenerated} players, ${result.stats.matchesPlayed} matches. Champion: ${result.stats.champion}`
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to generate mock data.'
      );
    } finally {
      setIsGeneratingMock(false);
      setShowMockConfirm(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Tournament Settings</DialogTitle>
          <DialogDescription>
            Manage settings for {tournament.name}.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div>
              <Label htmlFor='public-switch' className='font-medium'>
                Public Tournament
              </Label>
              <p className='text-sm text-muted-foreground'>
                Allow the public to view this tournament.
              </p>
            </div>
            <Switch
              id='public-switch'
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isSaving || isGeneratingMock}
            />
          </div>

          {/* Generate Mock Data Section */}
          <div className='rounded-lg border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900 dark:bg-purple-950/20'>
            <div className='flex items-start gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900'>
                <Icon
                  name='science'
                  className='text-purple-600 dark:text-purple-400'
                />
              </div>
              <div className='flex-1'>
                <Label className='font-medium text-purple-900 dark:text-purple-100'>
                  Generate Mock Data
                </Label>
                <p className='mt-1 text-sm text-purple-700 dark:text-purple-300'>
                  Populate this tournament with sample players, matches, and
                  results for testing.
                </p>

                {!showMockConfirm ? (
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-3 border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900'
                    onClick={() => setShowMockConfirm(true)}
                    disabled={isSaving || isGeneratingMock}
                  >
                    <Icon name='bolt' className='mr-2' />
                    Generate Mock Tournament
                  </Button>
                ) : (
                  <div className='mt-3 space-y-3'>
                    <div className='rounded-md bg-yellow-100 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'>
                      <p className='font-medium'>⚠️ Warning</p>
                      <p className='mt-1'>
                        This will replace all existing players and matches with
                        mock data!
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setShowMockConfirm(false)}
                        disabled={isGeneratingMock}
                      >
                        Cancel
                      </Button>
                      <Button
                        size='sm'
                        className='bg-purple-600 hover:bg-purple-700'
                        onClick={handleGenerateMock}
                        disabled={isGeneratingMock}
                      >
                        {isGeneratingMock ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Icon name='check' className='mr-2' />
                            Confirm
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isSaving || isGeneratingMock}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isGeneratingMock}>
            {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentWorkspace;
