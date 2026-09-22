import React from 'react';
import { Radar, BrainCircuit, TicketCheck, ShieldCheck, BarChart3 } from 'lucide-react';
import { features } from './data';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Radar,
  BrainCircuit,
  TicketCheck,
  ShieldCheck,
  BarChart3,
};

export const FeaturesSection: React.FC = () => {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-white"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-14">
          <h2 id="features-heading" className="font-serif text-3xl sm:text-4xl text-content-primary mb-4">
            Everything You Need to{' '}
            <span className="text-brand">Fly Confidently</span>
          </h2>
          <p className="text-content-secondary text-base max-w-2xl mx-auto">
            From real-time tracking to AI-powered predictions, FlightGuard AI delivers a comprehensive aviation intelligence platform.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {features.map((feat, idx) => {
            const IconComponent = iconMap[feat.icon] || Radar;
            // First row: 3 cards; second row: 2 centered cards
            const isLastRow = idx >= 3;

            return (
              <div
                key={feat.id}
                className={`group relative bg-white border border-border rounded-xl p-6 sm:p-7 hover:shadow-card-hover hover:border-brand/20 transition-all duration-300 ${
                  isLastRow && idx === 3 ? 'lg:col-start-1 lg:col-end-2 lg:ml-auto lg:mr-0 lg:w-full sm:col-start-1' : ''
                } ${
                  isLastRow && idx === 4 ? 'lg:col-start-2 lg:col-end-3 lg:ml-0 lg:mr-auto lg:w-full sm:col-start-2' : ''
                }`}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-brand/8 border border-brand/10 flex items-center justify-center mb-5 group-hover:bg-brand/12 transition-colors">
                  <IconComponent className="w-5 h-5 text-brand" />
                </div>

                {/* Text */}
                <h3 className="text-lg font-semibold text-content-primary mb-2 font-sans">
                  {feat.title}
                </h3>
                <p className="text-sm text-content-secondary leading-relaxed">
                  {feat.description}
                </p>

                {/* Subtle accent bar on hover */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
