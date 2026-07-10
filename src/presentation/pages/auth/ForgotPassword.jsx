import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { forgotPasswordSchema } from '../../../shared/validation/validationSchemas';
import { sanitizeObject } from '../../../shared/utils/sanitizer';
import { Mail, ShieldAlert, Sparkles, CheckCircle, ArrowLeft } from 'lucide-react';
import { FormInput } from '../../components/common/FormInput';

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { sendPasswordReset } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    const sanitized = sanitizeObject(data);

    try {
      await sendPasswordReset(sanitized.email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-surface/80 backdrop-blur-md border border-default p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-950 border border-brand-800 rounded-xl mb-4 text-brand-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Reset Password</h1>
          <p className="text-muted mt-2 text-sm">Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/50 border border-red-800/80 rounded-xl p-4 flex gap-3 text-red-300 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <span className="font-semibold">Reset failed:</span>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="text-center animate-fade-in">
            <div className="inline-flex p-3 bg-green-950/50 border border-green-800 rounded-xl mb-4 text-green-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Reset Link Sent</h2>
            <p className="text-muted text-sm mt-2 mb-6">
              Check your inbox for instructions to set your new password.
            </p>
            <Link to="/login" className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-default/30 border-t-white rounded-full animate-spin" />
                  Sending link...
                </span>
              ) : (
                <span className="flex items-center gap-2 font-semibold">
                  Send Reset Link
                </span>
              )}
            </button>

            <Link to="/login" className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
