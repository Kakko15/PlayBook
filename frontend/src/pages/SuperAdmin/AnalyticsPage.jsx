import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await api.getGlobalAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Analytics Error:', error);
        toast.error('Failed to load analytics data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center p-8'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className='p-8'>
        <h1 className='text-3xl font-bold text-foreground'>Analytics</h1>
        <p className='mt-4 text-center text-muted-foreground'>
          No analytics data found. Try training the models first.
        </p>
      </div>
    );
  }

  const { winPredictor } = analytics;

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold text-foreground'>Global Analytics</h1>
      <p className='mt-2 text-muted-foreground'>
        Overview of data science model results.
      </p>

      <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Win Predictor (Logistic Regression)</CardTitle>
          </CardHeader>
          <CardContent>
            {winPredictor ? (
              <div>
                <p className='text-sm text-muted-foreground'>
                  Model coefficients loaded from database:
                </p>
                <pre className='mt-4 rounded-lg bg-muted p-4 font-mono text-sm text-muted-foreground'>
                  {JSON.stringify(winPredictor.coefficients, null, 2)}
                </pre>
                <p className='mt-2 text-xs text-muted-foreground'>
                  Last trained:{' '}
                  {winPredictor.updated_at
                    ? new Date(winPredictor.updated_at).toLocaleString()
                    : 'Unknown'}
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground'>
                The Win Predictor model has not been trained yet. Go to "System"
                to train it.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
