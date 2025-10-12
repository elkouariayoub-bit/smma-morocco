import * as React from 'react';
import { cva } from './cva';
import { cn } from '@/lib/utils';

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:pointer-events-none shadow-sm-elevated',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-surface text-foreground border border-border hover:border-primary/40 hover:text-primary',
        outline: 'bg-transparent text-foreground border border-border hover:border-primary/60 hover:text-primary shadow-none',
        ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-surface/60 shadow-none',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-12 px-5 text-base font-semibold'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';