import * as React from 'react';
import { cva } from './cva';
import { cn } from '@/lib/utils';

const buttonStyles = cva(
  'inline-flex h-12 items-center justify-center rounded-lg text-base font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-[#3b82f6] text-white shadow-sm hover:bg-[#2563eb]',
        secondary: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800',
        outline: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:text-slate-900',
        social: 'border border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:bg-slate-100',
      },
      size: {
        default: 'px-6',
        sm: 'h-10 rounded-md px-4 text-sm',
        lg: 'h-14 rounded-xl px-8 text-base',
      }
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'social' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';