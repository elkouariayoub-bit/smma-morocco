'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ label, children, className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-lg bg-foreground px-3 py-1 text-xs font-medium text-background opacity-0 shadow-sm transition-all duration-200 ease-standard',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {label}
      </span>
    </span>
  );
}
