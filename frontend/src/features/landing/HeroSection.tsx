import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plane, TrendingUp,
  BrainCircuit, Calendar, ShieldCheck, BarChart3, Check
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#F3F7FA] via-white to-[#F9FBFC] overflow-hidden pt-6 sm:pt-10">
      {/* ── Top Hero Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* ── Left Column: Headline & Action ── */}
          <div className="lg:col-span-6 z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#E2ECEB] text-[#244855] text-xs font-bold tracking-wider uppercase mb-6 shadow-xs">
              AI-POWERED AIRLINE SOLUTIONS
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#244855] tracking-tight leading-[1.12] mb-6 font-sans">
              Smarter Flight<br />
              Reservations &<br />
              <span className="text-[#E64833]">Delay Prediction</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg mb-8">
              FlightGuard AI helps you find the best flights, make seamless reservations, and predict delays using real-time data and machine learning.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              <a
                href="#live-flight-search"
                className="inline-flex items-center justify-center gap-2.5 bg-[#244855] hover:bg-[#1a353f] text-white px-7 py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <Plane className="w-4 h-4 rotate-45" />
                Search Flights
              </a>
              <Link
                to="/operations"
                className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-[#244855] border border-[#244855]/25 px-7 py-3.5 rounded-xl font-semibold text-sm shadow-xs transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4 text-[#244855]" />
                View Live Dashboard
              </Link>
            </div>

            {/* 3 Checkmark Highlights */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5 text-sm font-medium text-slate-700">
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#E2ECEB] text-[#244855] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                Live Flight Data
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#E2ECEB] text-[#244855] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                AI Delay Prediction
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#E2ECEB] text-[#244855] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                Secure Reservations
              </span>
            </div>
          </div>

          {/* ── Right Column: Aircraft Visual & Floating Cards ── */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* The Aircraft Showcase Visual */}
            <div className="relative w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl shadow-[#244855]/10 border border-white/80 bg-white/40 backdrop-blur-xs transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/hero_aircraft_showcase.jpg"
                alt="FlightGuard AI Aircraft soaring through clouds with delay risk analytics and flight tracking cards"
                className="w-full h-auto object-cover select-none"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Feature Strip (5 Quick Value Props) ── */}
      <section className="relative z-10 bg-white/90 backdrop-blur-sm border-t border-b border-slate-100 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            
            {/* 1. Real-Time Flight Data */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#E2ECEB] flex items-center justify-center mb-3.5 shadow-xs">
                <Plane className="w-5 h-5 text-[#244855] rotate-45" />
              </div>
              <h3 className="font-bold text-sm text-[#244855] mb-1">Real-Time Flight Data</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track live flights, statuses, and locations across the globe.
              </p>
            </div>

            {/* 2. AI Delay Prediction */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#FDECE9] flex items-center justify-center mb-3.5 shadow-xs">
                <BrainCircuit className="w-5 h-5 text-[#E64833]" />
              </div>
              <h3 className="font-bold text-sm text-[#244855] mb-1">AI Delay Prediction</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get accurate delay risk predictions with machine learning.
              </p>
            </div>

            {/* 3. Easy Reservations */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#F6ECE8] flex items-center justify-center mb-3.5 shadow-xs">
                <Calendar className="w-5 h-5 text-[#874F41]" />
              </div>
              <h3 className="font-bold text-sm text-[#244855] mb-1">Easy Reservations</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Book your flights with a simple and secure process.
              </p>
            </div>

            {/* 4. Secure & Reliable */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#E2ECEB] flex items-center justify-center mb-3.5 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#244855]" />
              </div>
              <h3 className="font-bold text-sm text-[#244855] mb-1">Secure & Reliable</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your data and transactions are always protected.
              </p>
            </div>

            {/* 5. Operations Dashboard */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#FDF4E7] flex items-center justify-center mb-3.5 shadow-xs">
                <BarChart3 className="w-5 h-5 text-[#D97706]" />
              </div>
              <h3 className="font-bold text-sm text-[#244855] mb-1">Operations Dashboard</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Powerful insights for airlines and operations teams.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Brand Color Waves Divider ── */}
      <div className="relative w-full overflow-hidden leading-none -mt-px pointer-events-none" aria-hidden="true">
        <svg
          className="relative block w-full h-12 sm:h-16 lg:h-20"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Bottom Layer: Warm Cream #FBE9D0 */}
          <path
            d="M0,40 C320,110 560,10 960,80 C1200,120 1360,60 1440,50 L1440,120 L0,120 Z"
            fill="#FBE9D0"
          />
          {/* Middle Layer: Accent Red #E64833 */}
          <path
            d="M0,60 C280,120 620,30 980,85 C1220,115 1380,80 1440,70 L1440,120 L0,120 Z"
            fill="#E64833"
            opacity="0.85"
          />
          {/* Top Layer: Dark Navy Teal #244855 */}
          <path
            d="M0,80 C360,130 720,50 1080,95 C1260,115 1380,100 1440,90 L1440,120 L0,120 Z"
            fill="#244855"
          />
        </svg>
      </div>
    </div>
  );
};
