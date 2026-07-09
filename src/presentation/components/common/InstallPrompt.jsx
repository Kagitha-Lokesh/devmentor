import React, { useState, useEffect } from 'react';
import { Download, X, HelpCircle } from 'lucide-react';
import { container } from '../../../infrastructure/di/container';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const analytics = container.resolve('IAnalyticsService');

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      // Prevent Mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if app is already running as standalone (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShow(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    setShow(false);
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    analytics.logEvent('pwa_install_response', { outcome });
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    analytics.logEvent('pwa_install_dismissed');
  };

  if (!show) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl animate-slide-up flex gap-4 text-slate-100 font-sans"
      role="dialog"
      aria-label="PWA install prompt"
    >
      <div className="shrink-0 p-3 bg-brand-950 border border-brand-800 text-brand-400 rounded-lg h-fit">
        <Download className="h-5 w-5" />
      </div>
      
      <div className="flex-1">
        <h3 className="text-sm font-bold text-white">Install DevMentor</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
          Install our app on your device for fast offline access, notification alerts, and full screen sandbox compiling.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={handleInstall}
            className="btn-primary text-xs py-1.5 px-3.5"
          >
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Not Now
          </button>
        </div>
      </div>
      
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-400 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
