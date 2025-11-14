import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Icon from '@/components/Icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockActivity = [
  {
    id: 1,
    icon: 'how_to_reg',
    color: 'text-green-600',
    title: 'New User Registered',
    description: 'carlo.gallardo@isu.edu.ph is pending approval.',
    time: '5m ago',
  },
  {
    id: 2,
    icon: 'emoji_events',
    color: 'text-yellow-600',
    title: 'ISU Basketball Cup 2025',
    description: 'Schedule has been generated.',
    time: '1h ago',
  },
  {
    id: 3,
    icon: 'group_add',
    color: 'text-blue-600',
    title: 'New Team Added',
    description: '"College of Engineering" joined Valorant Tourney.',
    time: '3h ago',
  },
  {
    id: 4,
    icon: 'task_alt',
    color: 'text-gray-500',
    title: 'Match Result Logged',
    description: 'CICT (2) vs COE (0) in MLBB.',
    time: '8h ago',
  },
];

const ActivityItem = ({ icon, color, title, description, time }) => (
  <div className='flex items-start gap-3'>
    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-variant'>
      <Icon name={icon} className={cn('text-xl', color)} />
    </div>
    <div className='flex-1'>
      <p className='text-sm font-medium text-foreground'>{title}</p>
      <p className='text-sm text-muted-foreground'>{description}</p>
      <p className='text-xs text-muted-foreground'>{time}</p>
    </div>
  </div>
);

const ActivityFeed = () => {
  return (
    <Card className='border-outline-variant'>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>See what's new in the system.</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {mockActivity.map((item) => (
          <ActivityItem key={item.id} {...item} />
        ))}
        <Button variant='outline' className='mt-2 w-full'>
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
