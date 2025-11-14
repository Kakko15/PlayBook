import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/Icon';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'View Public Page',
      icon: 'public',
      action: () => navigate('/tournaments'),
    },
    {
      label: 'Documentation',
      icon: 'menu_book',
      action: () => {},
    },
  ];

  return (
    <Card className='bg-surface-variant'>
      <CardHeader>
        <CardTitle className='text-on-surface-variant'>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        {actions.map((item) => (
          <Button
            key={item.label}
            variant='secondary'
            onClick={item.action}
            className='h-12 justify-start gap-3 rounded-lg px-4 text-base'
          >
            <Icon name={item.icon} />
            <span className='font-medium'>{item.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
