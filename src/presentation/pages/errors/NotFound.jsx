import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-15%] right-[-15%] w-[250px] h-[250px] bg-brand-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="h-16 w-16 bg-brand-950/40 border border-brand-800 text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8" />
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200 mt-2 mb-2">Page Not Found</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-8">
            The page you are looking for doesn't exist, has been moved, or we made a mistakes.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
