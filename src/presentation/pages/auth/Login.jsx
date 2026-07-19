import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { loginSchema } from '../../../shared/validation/validationSchemas';
import { sanitizeObject } from '../../../shared/utils/sanitizer';
import { LogIn, Mail, Lock, ShieldAlert, Sparkles } from 'lucide-react';
import { FormInput } from '../../components/common/FormInput';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, signInWithGithub, error, clearError } = useAuthStore();
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const hasAttemptedAutoLogin = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('demo') === 'true' && !hasAttemptedAutoLogin.current) {
      hasAttemptedAutoLogin.current = true;
      // Immediately remove the demo flag from URL query params to prevent auto-login retry loops
      navigate('/login', { replace: true });

      const autoLogin = async () => {
        setLoading(true);
        setAuthError(null);
        clearError();
        try {
          const uniqueId = `${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
          const email = `guest_${uniqueId}@javamentor.com`;
          const password = `guestpass_${uniqueId}`;
          await signUp(email, password);
          navigate('/');
        } catch (err) {
          setAuthError(err.message || 'Auto-login failed. Please try signing in manually.');
        } finally {
          setLoading(false);
        }
      };
      autoLogin();
    }
  }, [signUp, navigate, clearError]);

  const handleGuestLogin = async () => {
    setLoading(true);
    setAuthError(null);
    clearError();
    try {
      const uniqueId = `${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const email = `guest_${uniqueId}@javamentor.com`;
      const password = `guestpass_${uniqueId}`;
      await signUp(email, password);
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'Demo login failed. Please try signing in manually.');
    } finally {
      setLoading(false);
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setAuthError(null);
    clearError();

    // Sanitize inputs before passing to business use-cases
    const sanitized = sanitizeObject(data);

    try {
      await signIn(sanitized.email, sanitized.password);
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    clearError();
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    clearError();
    try {
      await signInWithGithub();
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'Github authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-surface/80 backdrop-blur-md border border-default p-5 sm:p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-950 border border-brand-800 rounded-xl mb-4 text-brand-400">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Welcome Back</h1>
          <p className="text-muted mt-2 text-sm">Resume your journey to Java Full Stack mastery</p>
        </div>

        {(authError || error) && (
          <div className="mb-6 bg-red-950/50 border border-red-800/80 rounded-xl p-4 flex gap-3 text-red-300 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <span className="font-semibold">Authentication Error:</span>
              <p className="mt-0.5 opacity-90">{authError || error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email}
            disabled={loading}
            {...register('email')}
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-primary">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <FormInput
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
              disabled={loading}
              {...register('password')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-default/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-semibold">
                <LogIn className="h-4 w-4" />
                Sign In
              </span>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-default" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-3 text-muted">Or try without account</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full btn-secondary py-3 flex items-center justify-center gap-2 border border-default rounded-xl hover:bg-surface-secondary hover:text-primary hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
        >
          <Sparkles className="h-4 w-4 text-brand-400" />
          <span className="font-semibold">Explore as Guest (Demo)</span>
        </button>

        {/* 
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-default" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-3 text-muted">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-secondary py-2.5 flex items-center justify-center gap-2 hover:bg-surface-secondary hover:text-primary"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>
          <button
            onClick={handleGithubSignIn}
            disabled={loading}
            className="btn-secondary py-2.5 flex items-center justify-center gap-2 hover:bg-surface-secondary hover:text-primary"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </button>
        </div>
        */ }

        <p className="mt-8 text-center text-sm text-muted">
          New to JavaMentor?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
