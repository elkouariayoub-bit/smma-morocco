import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-inner transition-base placeholder:text-slate-400 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
