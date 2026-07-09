import React, { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-red-950/15 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="h-16 w-16 bg-red-950/40 border border-red-800/80 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <WifiOff className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Connection Lost</h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-8">
            You are currently offline. Check your internet connection. Some local features might remain accessible.
          </p>

          <button
            onClick={handleRetry}
            disabled={checking}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Re-checking connection...' : 'Retry Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}
