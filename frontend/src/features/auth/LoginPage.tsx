import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';
import { Plane, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setErrorMessage(axiosErr.response?.data?.error?.message || 'Authentication failed. Please check your credentials.');
      } else {
        setErrorMessage('Unable to connect to FlightGuard server. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-surface-bg">
      {/* Background Hero Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/assets/auth_airport_bg.jpg')" }}
      />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-surface border border-border rounded-xl shadow-md p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand text-white shadow-xs mb-3">
              <Plane className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-content-primary tracking-tight">Sign In to FlightGuard AI</h2>
            <p className="text-sm text-content-muted mt-1">
              Enter your credentials to access flight search, bookings, or operational dashboards.
            </p>
          </div>

          {/* Security Banner */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-brand-soft text-brand text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Secure 256-bit Encrypted Session</span>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-md bg-semantic-danger-soft border border-semantic-danger/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-semantic-danger shrink-0 mt-0.5" />
              <div className="text-xs text-semantic-danger font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                Email Address <span className="text-semantic-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@airline.com"
                  autoComplete="email"
                  {...register('email')}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-surface text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors ${
                    errors.email ? 'border-semantic-danger focus:ring-semantic-danger' : 'border-border'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-semantic-danger">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                Password <span className="text-semantic-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-surface text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors ${
                    errors.password ? 'border-semantic-danger focus:ring-semantic-danger' : 'border-border'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-semantic-danger">{errors.password.message}</p>
              )}
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold shadow-xs"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-content-muted">
            Don't have a FlightGuard account?{' '}
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Create Passenger Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
