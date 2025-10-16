"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";

type ToastMessage = {
  id: number;
  title?: string;
  description?: string;
  duration?: number;
};

type ToastContextType = {
  toasts: ToastMessage[];
  toast: (options: Omit<ToastMessage, "id">) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({ title, description, duration = 4000 }: Omit<ToastMessage, "id">) => {
      const id = Date.now();
      const newToast: ToastMessage = { id, title, description, duration };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-[9999]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2"
          >
            {t.title && <p className="font-semibold">{t.title}</p>}
            {t.description && (
              <p className="text-sm text-gray-200 mt-1">{t.description}</p>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="text-xs text-gray-400 hover:text-white mt-2"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export function ToastWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
