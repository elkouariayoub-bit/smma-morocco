import * as React from 'react';
import { cva } from './cva';
import { cn } from '@/lib/utils';

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:pointer-events-none shadow-sm hover:shadow-md',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-brand-foreground hover:bg-indigo-600',
        secondary: 'bg-slate-900 text-white hover:bg-slate-800',
        outline: 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        subtle: 'bg-brand-soft text-indigo-600 hover:bg-indigo-100',
        destructive: 'bg-destructive text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 gap-1.5',
        md: 'h-10 px-4 gap-2',
        lg: 'h-12 px-5 gap-2',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'subtle' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
