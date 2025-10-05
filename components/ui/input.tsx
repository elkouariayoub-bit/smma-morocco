import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus-visible:border-[#3b82f6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 focus-visible:ring-offset-0',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
