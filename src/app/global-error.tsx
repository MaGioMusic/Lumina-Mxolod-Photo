'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white dark:bg-gray-900">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Critical Error
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              A critical error occurred in the application. We apologize for the inconvenience.
            </p>
            
            {error.digest && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            
            <Button
              onClick={reset}
              className="bg-[#F08336] hover:bg-[#e0743a] text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
