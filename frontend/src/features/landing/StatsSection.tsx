import React, { useEffect, useRef, useState } from 'react';
import { Plane, Activity, Clock, BrainCircuit } from 'lucide-react';
import { statistics } from './data';

const iconMap: Record<number, React.FC<{ className?: string }>> = {
  0: Plane,
  1: Activity,
  2: Clock,
  3: BrainCircuit,
};

/* ── Animated Counter Hook ───────────────────── */
function useAnimatedCounter(target: number, shouldAnimate: boolean, duration: number = 2000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate || target === 0) return;

    let startTime: number | null = null;
    let animFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      }
    };

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [target, shouldAnimate, duration]);

  return count;
}

/* ── Individual Stat Card ────────────────────── */
const StatCard: React.FC<{
  stat: typeof statistics[0];
  index: number;
  animate: boolean;
}> = ({ stat, index, animate }) => {
  const Icon = iconMap[index] || Plane;
  const animatedValue = useAnimatedCounter(stat.numericTarget, animate);

  // For text-based values like "24/7" and "AI"
  const isTextStat = stat.value === '24/7' || stat.value === 'AI';
  const displayValue = isTextStat ? stat.value : animatedValue.toString();

  return (
    <div className="text-center px-4 py-6 sm:py-8">
      <Icon className="w-6 h-6 mx-auto mb-3 text-cream opacity-80" aria-hidden="true" />
      <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1.5">
        {displayValue}
        {!isTextStat && <span>{stat.suffix}</span>}
      </div>
      <div className="text-sm text-supporting-light font-medium">{stat.label}</div>
    </div>
  );
};

/* ── Stats Section ───────────────────────────── */
export const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
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
      className="bg-brand relative overflow-hidden"
      aria-label="Platform statistics"
    >
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-supporting/10" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cream/5" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
          {statistics.map((stat, idx) => (
            <StatCard key={stat.label} stat={stat} index={idx} animate={animate} />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center pb-5">
        <p className="text-[10px] text-white/30">
          Platform capability indicators · Values represent system design targets
        </p>
      </div>
    </section>
  );
};
