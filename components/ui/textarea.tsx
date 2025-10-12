import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full min-h-[120px] rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground transition-all duration-200 ease-standard placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
