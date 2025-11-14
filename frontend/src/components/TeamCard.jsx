import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const TeamCard = ({ team, onEdit, onDelete, onManagePlayers }) => {
  const playerCount = team.players?.[0]?.count || 0;

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm'
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container'>
            <img
              src={team.logo_url || `https://avatar.vercel.sh/${team.name}.png`}
              alt={`${team.name} logo`}
              className='h-8 w-8 rounded-full object-cover'
              onError={(e) => {
                e.currentTarget.src = `https://avatar.vercel.sh/${team.name}.png`;
              }}
            />
          </div>
          <div>
            <h3 className='font-semibold text-foreground'>{team.name}</h3>
            <div className='flex items-center text-sm text-muted-foreground'>
              <Users className='mr-1.5 h-4 w-4' />
              {playerCount} Player{playerCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='ghost' size='icon' onClick={() => onEdit(team)}>
            <Edit className='h-4 w-4' />
            <span className='sr-only'>Edit</span>
          </Button>
          <Button variant='ghost' size='icon' onClick={() => onDelete(team)}>
            <Trash2 className='h-4 w-4 text-destructive' />
            <span className='sr-only'>Delete</span>
          </Button>
        </div>
      </div>
      <div
        className='absolute inset-0 cursor-pointer rounded-lg'
        onClick={() => onManagePlayers(team)}
        title={`Manage ${team.name} Roster`}
      />
    </div>
  );
};

export default TeamCard;
