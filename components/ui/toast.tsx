"use client"

import { ToastProvider } from "./use-toast"

export function ToastWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
