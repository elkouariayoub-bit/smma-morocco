import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground transition-all duration-200 ease-standard placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
