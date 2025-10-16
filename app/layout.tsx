"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import "@/styles/globals.css";
import NotificationListener from "@/components/notifications/NotificationListener";
import { ToastWrapper } from "@/components/ui/use-toast";
import ProgressBarProvider from "@/components/ui/ProgressBarProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("✅ User accepted PWA install prompt");
    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  return (
    <html lang="en">
      <head>
        <title>MyGiveAway</title>
        <meta
          name="description"
          content="Join, Win, and track GiveAways that Delight's You & Support's Charity."
        />
        <meta name="theme-color" content="#0f172a" />
        <meta property="og:title" content="MyGiveAway" />
        <meta
          property="og:description"
          content="Join, Win, and track GiveAways that Delight's You & Support's Charity."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icons/icon-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>

      <body className="bg-gray-50 text-gray-800 font-inter min-h-screen">
        <ProgressBarProvider>
          <ToastWrapper>
            <NotificationListener />
            <main>{children}</main>
          </ToastWrapper>
        </ProgressBarProvider>

        <AnimatePresence>
          {showInstallPrompt && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-5 inset-x-0 flex justify-center z-50"
            >
              <div className="bg-white shadow-lg rounded-2xl p-3 flex items-center gap-3 border border-gray-200 max-w-sm w-full mx-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Install MyGiveAway</h3>
                  <p className="text-xs text-gray-500">
                    Join, Win, and track GiveAways that Delight's You & Support's Charity.
                  </p>
                </div>
                <Button
                  onClick={handleInstall}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Install
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </body>
    </html>
  );
}
