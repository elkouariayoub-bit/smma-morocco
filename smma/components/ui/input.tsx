import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('flex h-9 w-full rounded-2xl border border-gray-300 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-gray-400', className)} {...props} />
));
Input.displayName = 'Input';
