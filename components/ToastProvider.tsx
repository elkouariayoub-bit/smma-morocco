"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  subscribeToastDismiss,
  subscribeToasts,
  toast,
  type ToastPayload,
  type ToastVariant,
} from "@/lib/toast";

interface ToastState extends ToastPayload {}

const variantClasses: Record<ToastVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const unsubAdd = subscribeToasts((payload) => {
      setToasts((current) => [...current, payload]);
      window.setTimeout(() => toast.dismiss(payload.id), 3200);
    });
    const unsubDismiss = subscribeToastDismiss((id) => {
      setToasts((current) => current.filter((item) => item.id !== id));
    });

    return () => {
      unsubAdd();
      unsubDismiss();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm",
            variantClasses[item.variant]
          )}
        >
          <span className="text-sm font-medium leading-tight">{item.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;
