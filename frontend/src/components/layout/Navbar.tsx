import React, { useState } from 'react';
import { Plane, Shield, LogIn, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center text-white shadow-sm group-hover:bg-brand-hover transition-colors">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl text-content-primary tracking-tight">
                FlightGuard <span className="text-brand">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] text-content-muted font-medium leading-none mt-0.5 tracking-wide uppercase">
                Airline Reservation & Delay Prediction
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-content-secondary">
            <Link to="/flights" className="nav-link-underline py-1 hover:text-brand transition-colors">
              Flights
            </Link>
            <Link to="/reservations" className="nav-link-underline py-1 hover:text-brand transition-colors">
              My Bookings
            </Link>
            {user && (user.role === 'OPERATIONS_AGENT' || user.role === 'ADMIN') && (
              <Link to="/operations" className="nav-link-underline py-1 hover:text-brand transition-colors flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Operations
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link to="/admin" className="nav-link-underline py-1 hover:text-brand transition-colors flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right: Auth + Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Auth Section */}
            {token && user ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-surface-subtle px-3 py-2 rounded-lg border border-border">
                  <UserIcon className="w-4 h-4 text-brand" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-content-primary leading-none">{user.first_name} {user.last_name}</div>
                    <div className="text-[10px] text-content-muted font-medium uppercase mt-0.5">{user.role.replace('_', ' ')}</div>
                  </div>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-content-secondary hover:text-semantic-danger border border-border rounded-lg hover:bg-semantic-danger-soft transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center text-sm font-medium bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-subtle transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link to="/flights" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-content-secondary hover:text-brand hover:bg-brand-soft rounded-lg transition-colors">
              Flights
            </Link>
            <Link to="/reservations" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-content-secondary hover:text-brand hover:bg-brand-soft rounded-lg transition-colors">
              My Bookings
            </Link>
            {user && (user.role === 'OPERATIONS_AGENT' || user.role === 'ADMIN') && (
              <Link to="/operations" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-content-secondary hover:text-brand hover:bg-brand-soft rounded-lg transition-colors">
                Operations
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-content-secondary hover:text-brand hover:bg-brand-soft rounded-lg transition-colors">
                Admin
              </Link>
            )}
            <div className="border-t border-border pt-3 mt-3 space-y-2">
              {token && user ? (
                <>
                  <div className="px-4 py-2 text-xs text-content-muted">
                    Signed in as <span className="font-semibold text-content-primary">{user.first_name} {user.last_name}</span>
                  </div>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-semantic-danger hover:bg-semantic-danger-soft rounded-lg transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-brand hover:bg-brand-soft rounded-lg transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-white bg-brand rounded-lg text-center hover:bg-brand-hover transition-colors">
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
