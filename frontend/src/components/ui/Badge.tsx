import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'low' | 'medium' | 'high' | 'critical' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'neutral', ...props }) => {
  const variants = {
    low: 'bg-risk-low-bg text-risk-low border-risk-low/20',
    medium: 'bg-risk-medium-bg text-risk-medium border-risk-medium/20',
    high: 'bg-risk-high-bg text-risk-high border-risk-high/20',
    critical: 'bg-risk-critical-bg text-risk-critical border-risk-critical/20',
    info: 'bg-semantic-info-soft text-semantic-info border-semantic-info/20',
    neutral: 'bg-surface-subtle text-content-secondary border-border',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
