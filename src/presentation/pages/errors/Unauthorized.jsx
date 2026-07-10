import React from 'react';
import { Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-primary font-sans">
      <div className="max-w-md w-full bg-surface border border-default rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-amber-950/15 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="h-16 w-16 bg-amber-950/40 border border-amber-800 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-primary mb-2">Access Denied</h1>
          <p className="text-sm text-muted max-w-sm mx-auto mb-8">
            You don't have permission to view this page. Please sign in with an authorized account.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log In
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
