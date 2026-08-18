import React from 'react';
import { cn } from '../../utils';
import type { ContainerStatus, HealthStatus } from '../../types';

interface StatusDotProps {
  status: ContainerStatus | HealthStatus | 'operational' | 'degraded' | 'down';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function StatusDot({ status, size = 'md', pulse = false }: StatusDotProps) {
  const isGreen = status === 'running' || status === 'healthy' || status === 'operational';
  const isRed = status === 'stopped' || status === 'exited' || status === 'unhealthy' || status === 'down';
  const isAmber = status === 'paused' || status === 'restarting' || status === 'degraded' || status === 'unknown';

  return (
    <span className="relative inline-flex items-center justify-center">
      {pulse && isGreen && (
        <span
          className={cn(
            'absolute inline-flex rounded-full bg-success opacity-60 animate-ping-slow',
            size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'
          )}
        />
      )}
      <span
        className={cn(
          'rounded-full inline-block',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          isGreen && 'bg-success',
          isRed && 'bg-danger',
          isAmber && 'bg-warning'
        )}
        style={isGreen ? { boxShadow: '0 0 5px rgba(34,197,94,0.5)' } : undefined}
      />
    </span>
  );
}
