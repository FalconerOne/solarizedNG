"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import "@/styles/globals.css";
import NotificationListener from "@/components/notifications/NotificationListener";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Detect PWA install availability
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      <ToastWrapper>
  <NotificationListener />
  {children}
</ToastWrapper>
    };
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
        <meta name="theme-color" content="#0f172a" />
        <meta
          name="description"
          content="Join, Win, and track GiveAways that Delight's You & Support's Charity."
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-gray-50 text-gray-800 font-inter min-h-screen">
        <main>{children}</main>

        {/* Install Prompt (appears subtly at bottom-center) */}
        <AnimatePresence>
          {showInstallPrompt && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-5 inset-x-0 flex justify-center"
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
        <NotificationListener />
      </body>
    </html>
  );
}
