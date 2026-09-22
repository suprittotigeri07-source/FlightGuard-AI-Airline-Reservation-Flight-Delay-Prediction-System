import React, { useEffect } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { LiveFlightPreview } from './LiveFlightPreview';
import { AIPredictionSection } from './AIPredictionSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { WhyFlightGuardSection } from './WhyFlightGuardSection';
import { StatsSection } from './StatsSection';
import { CTASection } from './CTASection';
import { Footer } from '../../components/layout/Footer';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // Set page title and meta description
    document.title = 'FlightGuard AI — Smarter Flights. Safer Journeys.';
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 selection:bg-[#244855] selection:text-white">
      {/* ── Top Navigation Bar (Mockup Style) ── */}
      <LandingNavbar />

      {/* ── Main Landing Sections ── */}
      <main className="flex-1">
        {/* Section 1: Hero + 5-Feature Strip + Waves */}
        <section id="hero">
          <HeroSection />
        </section>

        {/* Section 2: Live Flight Status & Radar Preview */}
        <section id="live-flights">
          <LiveFlightPreview />
        </section>

        {/* Section 3: AI Delay Prediction Showcase */}
        <section id="predictions">
          <AIPredictionSection />
        </section>

        {/* Section 4: Comprehensive Platform Capabilities */}
        <section id="features">
          <FeaturesSection />
        </section>

        {/* Section 5: Step-by-step How It Works */}
        <section id="how-it-works">
          <HowItWorksSection />
        </section>

        {/* Section 6: Why FlightGuard AI (Split Passenger vs Airline) */}
        <section id="why-flightguard">
          <WhyFlightGuardSection />
        </section>

        {/* Section 7: Live Platform Metrics / Counters */}
        <section id="stats">
          <StatsSection />
        </section>

        {/* Section 8: Final Call To Action */}
        <section id="cta">
          <CTASection />
        </section>
      </main>

      {/* Section 9: Reusable Global Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
