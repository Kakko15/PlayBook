import React from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-screen items-center justify-center bg-background p-4'>
          <div className='mx-auto w-full max-w-md text-center'>
            <div className='mb-8 flex justify-center'>
              <Logo size='md' />
            </div>
            <h2 className='mt-6 text-3xl font-bold tracking-tight text-foreground'>
              Something went wrong
            </h2>
            <p className='mt-4 text-base text-muted-foreground'>
              We're sorry, but something unexpected happened. Please try
              refreshing the page or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className='mt-4 overflow-auto rounded-lg bg-muted p-4 text-left text-xs'>
                {this.state.error.toString()}
              </pre>
            )}
            <div className='mt-8'>
              <Button onClick={this.handleReset} className='w-full'>
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
