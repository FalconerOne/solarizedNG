"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setUpdateAvailable(true);
        setVisible(true);

        // 🕒 Auto-hide after 10 seconds
        setTimeout(() => setVisible(false), 10000);
      });
    }
  }, []);

  if (!updateAvailable && !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed top-6 left-1/2 -translate-x-1/2 
                     bg-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg 
                     z-50 text-center max-w-sm w-[90%] backdrop-blur-sm
                     border border-orange-300/40"
        >
          <p className="text-sm font-semibold tracking-wide">
            🚀 New version available!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-1 text-xs underline hover:text-orange-200 transition"
          >
            Refresh now
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
