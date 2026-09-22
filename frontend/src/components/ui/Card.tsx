import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, elevated = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-surface border border-border rounded-lg p-5 transition-shadow',
        elevated ? 'shadow-md' : 'shadow-xs',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
