import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full min-h-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner transition-base placeholder:text-slate-400 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
