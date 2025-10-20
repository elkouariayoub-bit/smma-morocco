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

declare module 'next-auth' {
  export type Session = import('../stubs/next-auth').Session;
  export type NextAuthOptions = import('../stubs/next-auth').NextAuthOptions;
  export function getServerSession(): Promise<Session>;
  const nextAuth: typeof import('../stubs/next-auth').default;
  export default nextAuth;
}

declare module 'next-auth/react' {
  export type Session = import('../stubs/next-auth-react').Session;
  export function useSession(): ReturnType<typeof import('../stubs/next-auth-react').useSession>;
  export function signIn(
    provider?: string,
    options?: Record<string, unknown>
  ): ReturnType<typeof import('../stubs/next-auth-react').signIn>;
  export function signOut(
    options?: Record<string, unknown>
  ): ReturnType<typeof import('../stubs/next-auth-react').signOut>;
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

declare module '@radix-ui/react-select' {
  export const Root: typeof import('../stubs/radix-select').Root;
  export const Group: typeof import('../stubs/radix-select').Group;
  export const Value: typeof import('../stubs/radix-select').Value;
  export const Trigger: typeof import('../stubs/radix-select').Trigger;
  export const Content: typeof import('../stubs/radix-select').Content;
  export const Label: typeof import('../stubs/radix-select').Label;
  export const Item: typeof import('../stubs/radix-select').Item;
  export const Separator: typeof import('../stubs/radix-select').Separator;
  export const ScrollUpButton: typeof import('../stubs/radix-select').ScrollUpButton;
  export const ScrollDownButton: typeof import('../stubs/radix-select').ScrollDownButton;
}

declare module 'date-fns' {
  export function format(date: Date, token: string): string;
  export function isSameDay(left?: Date, right?: Date): boolean;
}

declare module 'react-day-picker' {
  export type DateRange = import('../stubs/react-day-picker').DateRange;
}

declare module 'jspdf' {
  export { jsPDF } from '../stubs/jspdf';
}
