import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, CheckCircle, RotateCcw, LogOut, ArrowRight, ShieldAlert } from 'lucide-react';
import { container } from '../../../infrastructure/di/container';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { user, sendVerificationEmail, signOut } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const environment = container.resolve('environment');

  useEffect(() => {
    // If user is already verified, take them to the dashboard
    if (user?.emailVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleResend = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await sendVerificationEmail();
      setSuccessMsg('A verification email has been sent to your address.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send verification link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      if (environment.isMock) {
        // Trigger mock account verification directly
        const authService = container.resolve('IAuthService');
        await authService.verifyMockEmail();
        setSuccessMsg('Mock email verified successfully!');
      } else {
        // Force reload live user profile stats to fetch refreshed emailVerified flag
        const auth = authService.auth; // live firebase auth
        if (auth.currentUser) {
          await auth.currentUser.reload();
          // Trigger state reload in store
          window.location.reload();
        }
      }
    } catch (err) {
      setErrorMsg('Verification check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px]" />

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 text-center">
        <div className="h-16 w-16 bg-brand-950 border border-brand-800 text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Verify Your Email</h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
          We sent a verification link to <span className="font-semibold text-brand-400">{user?.email}</span>. Click the link inside to activate your DevMentor account.
        </p>

        {successMsg && (
          <div className="mb-6 bg-green-950/50 border border-green-800 rounded-xl p-4 flex gap-3 text-green-300 text-sm text-left">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 bg-red-950/50 border border-red-800/80 rounded-xl p-4 flex gap-3 text-red-300 text-sm text-left">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            <ArrowRight className="h-4 w-4" />
            I've Verified My Email
          </button>

          {environment.isMock && (
            <button
              onClick={async () => {
                const authService = container.resolve('IAuthService');
                await authService.verifyMockEmail();
                window.location.reload();
              }}
              className="w-full text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              [Dev Mock Only] Bypass Verification
            </button>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleResend}
              disabled={loading}
              className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-2 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Resend Email
            </button>
            <button
              onClick={() => signOut()}
              className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-2 text-xs text-red-400 hover:bg-red-950/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
