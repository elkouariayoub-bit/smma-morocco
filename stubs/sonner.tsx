'use client';

export type ToastOptions = {
  description?: string;
};

type ToastHandler = (message: string, options?: ToastOptions) => void;

function log(prefix: string, message: string, options?: ToastOptions) {
  const extra = options?.description ? `: ${options.description}` : '';
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log(`[toast:${prefix}] ${message}${extra}`);
  }
}

export const toast: { success: ToastHandler; error: ToastHandler } = {
  success: (message, options) => log('success', message, options),
  error: (message, options) => log('error', message, options),
};

export function Toaster() {
  return null;
}
