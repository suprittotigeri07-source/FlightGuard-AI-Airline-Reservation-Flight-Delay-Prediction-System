import React from 'react';
import { Check, User, Briefcase } from 'lucide-react';
import { passengerBenefits, operationsBenefits } from './data';

export const WhyFlightGuardSection: React.FC = () => {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-white"
      aria-labelledby="why-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-14">
          <h2 id="why-heading" className="font-serif text-3xl sm:text-4xl text-content-primary mb-4">
            Built for <span className="text-brand">Passengers.</span>{' '}
            <br className="hidden sm:block" />
            Designed for <span className="text-accent">Airline Operations.</span>
          </h2>
          <p className="text-content-secondary text-base max-w-2xl mx-auto">
            One platform serving two critical audiences — travelers seeking confidence and operations teams demanding precision.
          </p>
        </div>

        {/* Split Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Passenger Column */}
          <div className="bg-gradient-to-br from-brand/[0.03] to-supporting/[0.05] border border-brand/10 rounded-xl p-7 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center">
                <User className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-content-primary font-sans">For Passengers</h3>
                <p className="text-xs text-content-muted">Travel with intelligence and confidence</p>
              </div>
            </div>
            <ul className="space-y-3.5" role="list">
              {passengerBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-semantic-success/10 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                    <Check className="w-3 h-3 text-semantic-success" />
                  </div>
                  <span className="text-sm text-content-secondary leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Operations Column */}
          <div className="bg-gradient-to-br from-accent/[0.02] to-cream/20 border border-accent/10 rounded-xl p-7 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-content-primary font-sans">For Airline Operations</h3>
                <p className="text-xs text-content-muted">Operational awareness and decision support</p>
              </div>
            </div>
            <ul className="space-y-3.5" role="list">
              {operationsBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-sm text-content-secondary leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
