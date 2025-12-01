import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import PickemMatchCard from '@/components/PickemMatchCard';
import Icon from '@/components/Icon';
import SortableTable from '@/components/ui/SortableTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const PickemsTab = ({ tournamentId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [matches, setMatches] = useState([]);
  const [myPicks, setMyPicks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestId, setGuestId] = useState('');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [tempGuestName, setTempGuestName] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    // Initialize guest ID if not present
    const storedGuestId = localStorage.getItem('pickems_guest_id');
    const storedGuestName = localStorage.getItem('pickems_guest_name');

    if (storedGuestId) {
      setGuestId(storedGuestId);
    } else {
      const newId = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('pickems_guest_id', newId);
      setGuestId(newId);
    }

    if (storedGuestName) {
      setGuestName(storedGuestName);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // If user is not logged in, we need a guest ID to fetch picks
      // But guest ID is set in useEffect, which might run after this if we are not careful.
      // However, fetchData is called in useEffect dependent on [tournamentId],
      // and the guest ID useEffect runs on mount.
      // We should probably pass guestId as a dependency or read from localStorage directly here.

      const currentGuestId = localStorage.getItem('pickems_guest_id');

      const [boardData, scheduleData, picksData] = await Promise.all([
        api.getPickLeaderboard(tournamentId),
        api.getSchedule(tournamentId),
        api.getMyPicks(tournamentId, !user ? currentGuestId : null),
      ]);

      setLeaderboard(boardData);
      setMatches(scheduleData);

      const picksMap = picksData.reduce((acc, pick) => {
        acc[pick.match_id] = pick;
        return acc;
      }, {});
      setMyPicks(picksMap);
    } catch (error) {
      toast.error("Failed to load Pick'ems data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePickSuccess = (pick) => {
    setMyPicks((prevPicks) => ({
      ...prevPicks,
      [pick.match_id]: pick,
    }));
    toast.success('Pick saved!');
  };

  const handleGuestLoginSubmit = () => {
    if (!tempGuestName.trim()) {
      toast.error('Please enter a name.');
      return;
    }
    localStorage.setItem('pickems_guest_name', tempGuestName.trim());
    setGuestName(tempGuestName.trim());
    setShowGuestModal(false);
    toast.success(`Welcome, ${tempGuestName}! You can now make picks.`);
  };

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  const leaderboardColumns = [
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
      header: 'User',
      sortable: true,
      filterable: true,
      renderCell: (row) => (
        <span
          className={cn(
            'font-medium',
            (user && row.user_id === user.id) ||
              (!user && row.guest_id === guestId)
              ? 'text-primary'
              : 'text-foreground'
          )}
        >
          {row.name}
          {!user && row.guest_id === guestId && ' (You)'}
        </span>
      ),
    },
    {
      key: 'correct_picks',
      header: 'Picks',
      sortable: true,
      renderCell: (row) => (
        <span className='text-muted-foreground'>{row.correct_picks}</span>
      ),
    },
    {
      key: 'total_points',
      header: 'Points',
      sortable: true,
      cellClassName: 'text-right',
      renderCell: (row) => (
        <span className='font-bold text-primary'>{row.total_points}</span>
      ),
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
      <div className='space-y-6 lg:col-span-2'>
        <h2 className='text-2xl font-semibold text-foreground'>
          Make Your Picks
        </h2>
        {!user && !guestName && (
          <div className='mb-4 flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4'>
            <div>
              <h3 className='font-semibold'>Playing as Guest</h3>
              <p className='text-sm text-muted-foreground'>
                Enter a name to start making picks and join the leaderboard.
              </p>
            </div>
            <Button onClick={() => setShowGuestModal(true)}>Enter Name</Button>
          </div>
        )}
        <div className='space-y-4'>
          {matches.length === 0 ? (
            <div className='flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card'>
              <Icon
                name='checklist'
                className='h-12 w-12 text-muted-foreground'
              />
              <h3 className='mt-4 text-xl font-semibold text-foreground'>
                No Matches Available
              </h3>
              <p className='mt-2 text-muted-foreground'>
                The schedule hasn't been generated yet.
              </p>
            </div>
          ) : (
            matches.map((match) => (
              <PickemMatchCard
                key={match.id}
                match={match}
                myPick={myPicks[match.id]}
                onPickSuccess={handlePickSuccess}
                isAuthenticated={!!user}
                guestInfo={{ guest_id: guestId, guest_name: guestName }}
                onGuestLoginRequired={() => setShowGuestModal(true)}
              />
            ))
          )}
        </div>
      </div>

      <div className='lg:col-span-1'>
        <h2 className='mb-6 text-2xl font-semibold text-foreground'>
          Leaderboard
        </h2>
        <SortableTable
          data={leaderboard.map((entry) => ({
            ...entry,
            rowClassName:
              (user && entry.user_id === user.id) ||
              (!user && entry.guest_id === guestId)
                ? 'bg-primary-container'
                : '',
          }))}
          columns={leaderboardColumns}
          defaultSortKey='total_points'
          defaultSortOrder='desc'
          emptyMessage='No predictions made yet.'
        />
      </div>

      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <DialogDescription>
              Please enter a display name to track your picks on the
              leaderboard.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                value={tempGuestName}
                onChange={(e) => setTempGuestName(e.target.value)}
                className='col-span-3'
                placeholder='e.g. John Doe'
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleGuestLoginSubmit}>Start Picking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PickemsTab;
