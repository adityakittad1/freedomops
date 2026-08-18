import React from 'react';
import { cn } from '../../utils';

interface BadgeProps {
  variant: 'read' | 'write' | 'success' | 'failed' | 'approval' | 'neutral' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-xs font-mono font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider',
        variant === 'read' && 'bg-info-dim text-info border border-info-border',
        variant === 'write' && 'bg-warning-dim text-warning border border-warning-border',
        variant === 'success' && 'bg-success-dim text-success border border-success-border',
        variant === 'failed' && 'bg-danger-dim text-danger border border-danger-border',
        variant === 'approval' && 'bg-warning-dim text-warning border border-warning-border',
        variant === 'neutral' && 'bg-bg-elevated text-text-secondary border border-bg-border',
        className
      )}
    >
      {children}
    </span>
  );
}
