import React from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-bg-base',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          variant === 'primary' && 'bg-brand text-white hover:bg-brand-dim',
          variant === 'secondary' && 'bg-bg-elevated border border-bg-border text-text-primary hover:border-bg-borderLight',
          variant === 'danger' && 'bg-danger-dim text-danger border border-danger-border hover:bg-red-900/30',
          variant === 'warning' && 'bg-warning-dim text-warning border border-warning-border hover:bg-amber-900/30',
          variant === 'ghost' && 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
          variant === 'outline' && 'border border-bg-border text-text-secondary hover:text-text-primary hover:border-bg-borderLight',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
