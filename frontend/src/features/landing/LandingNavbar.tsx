import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, Menu, X } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'flights' | 'about' | 'features' | 'contact'>('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
          : 'bg-white/90 backdrop-blur-sm border-b border-slate-100'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center">
          
          {/* Brand Logo */}
          <Link to="/" onClick={() => setActiveTab('home')} className="flex items-center gap-3 group shrink-0">
            {/* Tilted plane logo icon */}
            <div className="w-10 h-10 rounded-xl bg-[#244855] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1a353f] transition-colors relative overflow-hidden">
              <Plane className="w-5 h-5 -rotate-12 transform group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#E64833] rounded-tl-md" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-extrabold text-xl text-[#244855] tracking-tight">
                  FlightGuard
                </span>
                <span className="font-extrabold text-xl text-[#E64833] ml-1.5">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-normal -mt-0.5">
                Smarter Flights. Safer Journeys.
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium" aria-label="Main Navigation">
            {/* Home */}
            <button
              onClick={() => scrollToSection('hero', 'home')}
              className={`relative py-2 transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#244855] font-semibold'
                  : 'text-slate-600 hover:text-[#244855]'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E64833] rounded-full" />
              )}
            </button>

            {/* Flights */}
            <button
              onClick={() => scrollToSection('live-flight-search', 'flights')}
              className={`relative py-2 transition-colors cursor-pointer ${
                activeTab === 'flights'
                  ? 'text-[#244855] font-semibold'
                  : 'text-slate-600 hover:text-[#244855]'
              }`}
            >
              Flights
              {activeTab === 'flights' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E64833] rounded-full" />
              )}
            </button>

            {/* About */}
            <button
              onClick={() => scrollToSection('why-flightguard', 'about')}
              className={`relative py-2 transition-colors cursor-pointer ${
                activeTab === 'about'
                  ? 'text-[#244855] font-semibold'
                  : 'text-slate-600 hover:text-[#244855]'
              }`}
            >
              About
              {activeTab === 'about' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E64833] rounded-full" />
              )}
            </button>

            {/* Features */}
            <button
              onClick={() => scrollToSection('features', 'features')}
              className={`relative py-2 transition-colors cursor-pointer ${
                activeTab === 'features'
                  ? 'text-[#244855] font-semibold'
                  : 'text-slate-600 hover:text-[#244855]'
              }`}
            >
              Features
              {activeTab === 'features' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E64833] rounded-full" />
              )}
            </button>

            {/* Contact / Footer */}
            <button
              onClick={() => scrollToSection('cta', 'contact')}
              className={`relative py-2 transition-colors cursor-pointer ${
                activeTab === 'contact'
                  ? 'text-[#244855] font-semibold'
                  : 'text-slate-600 hover:text-[#244855]'
              }`}
            >
              Contact
              {activeTab === 'contact' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E64833] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {token && user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/flights"
                  className="hidden sm:inline-flex items-center text-sm font-semibold bg-[#244855] text-white px-5 py-2.5 rounded-lg hover:bg-[#1a353f] transition-colors shadow-xs"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex items-center text-sm font-medium text-slate-600 hover:text-[#E64833] transition-colors px-2 py-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-[#244855] border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 transition-colors px-5 py-2 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center text-sm font-semibold bg-[#244855] hover:bg-[#1a353f] text-white transition-colors px-5 py-2 rounded-lg shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => scrollToSection('hero', 'home')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('live-flight-search', 'flights')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Flights
            </button>
            <button
              onClick={() => scrollToSection('why-flightguard', 'about')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('features', 'features')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('cta', 'contact')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Contact
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            {token && user ? (
              <Link
                to="/flights"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-[#244855] text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#244855] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
