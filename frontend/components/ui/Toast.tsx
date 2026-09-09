"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onDismiss, duration = 2000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full bg-text-primary text-bg-surface text-sm font-semibold px-5 py-2.5 shadow-xl border border-border-strong animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {message}
    </div>
  );
}
