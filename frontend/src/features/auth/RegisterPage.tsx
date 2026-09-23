import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';
import { Plane, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      await registerAuth({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { error?: { message?: string }; detail?: string } } };
        const status = axiosErr.response?.status;
        const serverMsg = axiosErr.response?.data?.error?.message || (typeof axiosErr.response?.data?.detail === 'string' ? axiosErr.response.data.detail : null);

        if (serverMsg) {
          setErrorMessage(serverMsg);
        } else if (status === 404 || status === 405) {
          setErrorMessage(`API endpoint unreachable (HTTP ${status}). Please ensure your backend is deployed and VITE_API_BASE_URL is configured in your deployment.`);
        } else if (status && status >= 500) {
          setErrorMessage(`Backend server error (HTTP ${status}). Please try again shortly.`);
        } else {
          setErrorMessage('Registration failed. Please check the entered information and try again.');
        }
      } else {
        setErrorMessage('Unable to connect to FlightGuard backend server. Please verify your network and backend URL.');
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

      <div className="max-w-lg w-full relative z-10">
        <div className="bg-surface border border-border rounded-xl shadow-md p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand text-white shadow-xs mb-3">
              <Plane className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-content-primary tracking-tight">Create Your FlightGuard Account</h2>
            <p className="text-sm text-content-muted mt-1">
              Join FlightGuard AI to book reservations and track real-time flight delay predictions.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-md bg-semantic-danger-soft border border-semantic-danger/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-semantic-danger shrink-0 mt-0.5" />
              <div className="text-xs text-semantic-danger font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-firstname" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                  First Name <span className="text-semantic-danger">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-firstname"
                    type="text"
                    placeholder="Jane"
                    {...register('first_name')}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-surface text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors ${
                      errors.first_name ? 'border-semantic-danger focus:ring-semantic-danger' : 'border-border'
                    }`}
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-xs text-semantic-danger">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-lastname" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                  Last Name <span className="text-semantic-danger">*</span>
                </label>
                <input
                  id="reg-lastname"
                  type="text"
                  placeholder="Doe"
                  {...register('last_name')}
                  className={`w-full px-3 py-2 text-sm rounded-md border bg-surface text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors ${
                    errors.last_name ? 'border-semantic-danger focus:ring-semantic-danger' : 'border-border'
                  }`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-semantic-danger">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                Email Address <span className="text-semantic-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="jane.doe@example.com"
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
              <label htmlFor="reg-password" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                Password <span className="text-semantic-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-semantic-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  {...register('confirm_password')}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-surface text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors ${
                    errors.confirm_password ? 'border-semantic-danger focus:ring-semantic-danger' : 'border-border'
                  }`}
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-semantic-danger">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button
              id="register-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold shadow-xs mt-2"
              isLoading={isSubmitting}
            >
              Create Passenger Account
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-content-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
