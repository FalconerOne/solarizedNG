"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

/* ------------------------------------
   Toast Context + Provider
------------------------------------ */
type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`flex items-center space-x-3 rounded-xl shadow-lg px-4 py-3 text-sm font-medium border ${
                toast.variant === "success"
                  ? "bg-green-50 text-green-800 border-green-300"
                  : toast.variant === "error"
                  ? "bg-red-50 text-red-800 border-red-300"
                  : toast.variant === "warning"
                  ? "bg-yellow-50 text-yellow-800 border-yellow-300"
                  : "bg-blue-50 text-blue-800 border-blue-300"
              }`}
            >
              {toast.variant === "success" && <CheckCircle className="w-5 h-5" />}
              {toast.variant === "error" && <XCircle className="w-5 h-5" />}
              {toast.variant === "warning" && <AlertTriangle className="w-5 h-5" />}
              {toast.variant === "info" && <Info className="w-5 h-5" />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------
   Hook
------------------------------------ */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/* ------------------------------------
   Wrapper (for app/layout.tsx)
------------------------------------ */
export function ToastWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
