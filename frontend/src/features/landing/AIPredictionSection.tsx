import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, AlertTriangle, Info } from 'lucide-react';
import { demoPrediction } from './data';

/* ── Animated Circular Probability Meter ─────── */
const ProbabilityMeter: React.FC<{ value: number; animate: boolean }> = ({ value, animate }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = animate ? (value / 100) * circumference : 0;

  return (
    <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
        {/* Background track */}
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        {/* Progress arc */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={value >= 60 ? '#E64833' : value >= 30 ? '#EA580C' : '#16A34A'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: animate ? 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-content-primary">{value}%</span>
        <span className="text-[10px] font-medium text-content-muted uppercase tracking-wider">Probability</span>
      </div>
    </div>
  );
};

/* ── AI Prediction Section ───────────────────── */
export const AIPredictionSection: React.FC = () => {
  const pred = demoPrediction;
  const [animateMeter, setAnimateMeter] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimateMeter(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-surface-subtle to-white"
      aria-labelledby="prediction-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/8 border border-accent/15 text-[10px] font-bold uppercase tracking-widest text-accent mb-4">
            <BrainCircuit className="w-3 h-3" />
            Machine Learning
          </span>
          <h2 id="prediction-heading" className="font-serif text-3xl sm:text-4xl text-content-primary mb-4">
            Know the Risk <span className="text-accent">Before You Fly.</span>
          </h2>
          <p className="text-content-secondary text-base max-w-2xl mx-auto">
            FlightGuard AI uses machine learning models to estimate flight delay probability, helping you make informed travel decisions.
          </p>
        </div>

        {/* Prediction Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-border shadow-md overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Left: Meter */}
              <div className="p-8 sm:p-10 flex flex-col items-center justify-center bg-gradient-to-br from-surface-subtle to-white border-b sm:border-b-0 sm:border-r border-border">
                <ProbabilityMeter value={Math.round(pred.probability * 100)} animate={animateMeter} />
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-risk-high-bg text-risk-high text-xs font-bold">
                    <AlertTriangle className="w-3 h-3" />
                    {pred.riskLevel} RISK
                  </span>
                </div>
              </div>

              {/* Right: Details */}
              <div className="p-6 sm:p-8 space-y-5">
                {/* Flight Info */}
                <div>
                  <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">Flight</div>
                  <div className="text-lg font-bold text-content-primary">{pred.flightNumber}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">Route</div>
                  <div className="text-sm text-content-secondary">{pred.route}</div>
                  <div className="text-xs text-content-muted">{pred.origin} → {pred.destination}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">Est. Delay</div>
                    <div className="text-xl font-extrabold text-accent">{pred.estimatedDelay} min</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">Model</div>
                    <div className="text-sm font-semibold text-content-secondary">{pred.modelVersion}</div>
                  </div>
                </div>

                {/* Contributing Factors */}
                <div className="pt-4 border-t border-border">
                  <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Contributing Factors</div>
                  <ul className="space-y-1.5">
                    {pred.factors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-content-secondary">
                        <span className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" aria-hidden="true" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-surface-subtle border-t border-border px-6 py-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-content-muted shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[11px] text-content-muted leading-relaxed">
                Predictions are probabilistic estimates generated by machine learning models. They are not guaranteed outcomes. Actual delays may vary based on real-time conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
