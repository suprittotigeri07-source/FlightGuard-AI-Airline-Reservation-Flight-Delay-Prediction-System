import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Plane } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section
      className="relative overflow-hidden bg-brand py-16 sm:py-20 lg:py-24"
      aria-labelledby="cta-heading"
    >
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-supporting/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cream/8 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
        {/* Subtle flight path */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 800 300" fill="none">
          <path d="M0 200 Q 400 -50 800 150" stroke="white" strokeWidth="2" strokeDasharray="10 8" />
          <path d="M0 250 Q 300 100 800 200" stroke="white" strokeWidth="1" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Small aircraft icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <Plane className="w-6 h-6 text-white" />
        </div>

        <h2 id="cta-heading" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight">
          Your Journey Starts With{' '}
          <span className="text-cream">Better Intelligence.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
          Search smarter, understand your flight risk, and travel with confidence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/flights"
            className="inline-flex items-center gap-2 bg-white text-brand px-8 py-4 rounded-lg font-bold text-sm hover:bg-cream transition-colors shadow-lg w-full sm:w-auto justify-center focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-brand"
          >
            <Search className="w-4 h-4" />
            Search Flights
          </Link>
          <Link
            to="/flights"
            className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors w-full sm:w-auto justify-center focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-brand"
          >
            Explore Live Tracking
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
