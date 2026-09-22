import React from 'react';
import { howItWorksSteps } from './data';

export const HowItWorksSection: React.FC = () => {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-surface-subtle"
      aria-labelledby="howitworks-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 id="howitworks-heading" className="font-serif text-3xl sm:text-4xl text-content-primary mb-4">
            How <span className="text-brand">FlightGuard AI</span> Works
          </h2>
          <p className="text-content-secondary text-base max-w-xl mx-auto">
            From search to boarding — four simple steps to smarter travel.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal flight-path connector (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5" aria-hidden="true">
            <div className="w-full h-full bg-supporting/30 rounded-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand/50 via-supporting to-brand/50 rounded-full" style={{ maskImage: 'repeating-linear-gradient(90deg, black 0px, black 8px, transparent 8px, transparent 16px)', WebkitMaskImage: 'repeating-linear-gradient(90deg, black 0px, black 8px, transparent 8px, transparent 16px)' }} />
            </div>
          </div>

          {/* Vertical connector (mobile/tablet) */}
          <div className="lg:hidden absolute left-8 top-12 bottom-12 w-0.5 bg-supporting/20 rounded-full" aria-hidden="true" />

          {/* Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {howItWorksSteps.map((step, idx) => (
              <div key={step.number} className="relative flex lg:flex-col items-start lg:items-center text-left lg:text-center">
                {/* Step Number Circle */}
                <div className="relative z-10 shrink-0">
                  <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center text-xl font-extrabold shadow-sm border-4 border-white">
                    {step.number}
                  </div>
                  {/* Small aircraft icon between steps (desktop only) */}
                  {idx < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 text-supporting" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12 8L8 4V7H2V9H8V12L12 8Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="ml-5 lg:ml-0 lg:mt-6 flex-1">
                  <h3 className="text-lg font-bold text-content-primary mb-1.5 font-sans">{step.title}</h3>
                  <p className="text-sm text-content-secondary leading-relaxed max-w-[240px] lg:mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
