export type ToastVariant = "success" | "error" | "info";

export interface ToastPayload {
  id: string;
  message: string;
  variant: ToastVariant;
}

type ToastListener = (toast: ToastPayload) => void;
type DismissListener = (id: string) => void;

const listeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

function emitToast(variant: ToastVariant, message: string) {
  const toast = {
    id: Math.random().toString(36).slice(2),
    message,
    variant,
  } satisfies ToastPayload;
  listeners.forEach((listener) => listener(toast));
  return toast.id;
}

function emitDismiss(id: string) {
  dismissListeners.forEach((listener) => listener(id));
}

export const toast = {
  success(message: string) {
    return emitToast("success", message);
  },
  error(message: string) {
    return emitToast("error", message);
  },
  info(message: string) {
    return emitToast("info", message);
  },
  dismiss(id: string) {
    emitDismiss(id);
  },
};

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function subscribeToastDismiss(listener: DismissListener) {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
}
