declare module 'react-hook-form' {
  export type FieldError = import('../stubs/react-hook-form').FieldError;
  export type FieldErrors<T extends Record<string, any>> = import('../stubs/react-hook-form').FieldErrors<T>;
  export type Resolver<T extends Record<string, any>> = import('../stubs/react-hook-form').Resolver<T>;
  export function useForm<T extends Record<string, any>>(
    options: Parameters<typeof import('../stubs/react-hook-form').useForm<T>>[0]
  ): ReturnType<typeof import('../stubs/react-hook-form').useForm<T>>;
}

declare module '@hookform/resolvers/zod' {
  export function zodResolver<T extends Record<string, any>>(
    schema: import('../stubs/zod').ZodTypeAny
  ): import('../stubs/react-hook-form').Resolver<T>;
}

declare module 'zod' {
  export { z } from '../stubs/zod';
  export type ZodTypeAny = import('../stubs/zod').ZodTypeAny;
}

declare module 'sonner' {
  export const toast: typeof import('../stubs/sonner').toast;
  export type ToastOptions = import('../stubs/sonner').ToastOptions;
  export function Toaster(): ReturnType<typeof import('../stubs/sonner').Toaster>;
}

declare module '@radix-ui/react-separator' {
  export const Root: typeof import('../stubs/radix-separator').Root;
}

declare module '@radix-ui/react-scroll-area' {
  export const Root: typeof import('../stubs/radix-scroll-area').Root;
  export const Viewport: typeof import('../stubs/radix-scroll-area').Viewport;
  export const Scrollbar: typeof import('../stubs/radix-scroll-area').Scrollbar;
  export const Thumb: typeof import('../stubs/radix-scroll-area').Thumb;
  export const Corner: typeof import('../stubs/radix-scroll-area').Corner;
}
