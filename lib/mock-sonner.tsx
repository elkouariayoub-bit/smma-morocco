"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastPayload {
  id: string;
  message: string;
  variant: ToastVariant;
}

type ToastListener = (toast: ToastPayload) => void;
type DismissListener = (id: string) => void;

const toastListeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

function emitToast(variant: ToastVariant, message: string) {
  const payload: ToastPayload = {
    id: Math.random().toString(36).slice(2),
    message,
    variant,
  };
  toastListeners.forEach((listener) => listener(payload));
  return payload.id;
}

function emitDismiss(id: string) {
  dismissListeners.forEach((listener) => listener(id));
}

type ToastFunction = ((message: string) => string) & {
  success: (message: string) => string;
  error: (message: string) => string;
  info: (message: string) => string;
  dismiss: (id: string) => void;
};

const baseToast = ((message: string) => emitToast("info", message)) as ToastFunction;

baseToast.success = (message: string) => emitToast("success", message);
baseToast.error = (message: string) => emitToast("error", message);
baseToast.info = (message: string) => emitToast("info", message);
baseToast.dismiss = (id: string) => emitDismiss(id);

export const toast = baseToast;

const variantClasses: Record<ToastVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    const unsubscribeAdd = (toastItem: ToastPayload) => {
      setToasts((current) => [...current, toastItem]);
      window.setTimeout(() => baseToast.dismiss(toastItem.id), 3200);
    };
    const unsubscribeDismiss = (id: string) => {
      setToasts((current) => current.filter((toastItem) => toastItem.id !== id));
    };

    toastListeners.add(unsubscribeAdd);
    dismissListeners.add(unsubscribeDismiss);

    return () => {
      toastListeners.delete(unsubscribeAdd);
      dismissListeners.delete(unsubscribeDismiss);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm",
            variantClasses[toastItem.variant]
          )}
        >
          <span className="text-sm font-medium leading-tight">{toastItem.message}</span>
        </div>
      ))}
    </div>
  );
}

export default Toaster;
