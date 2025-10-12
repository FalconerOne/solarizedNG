"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setUpdateAvailable(true);
      });
    }
  }, []);

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-orange-500 
                     text-white px-6 py-3 rounded-2xl shadow-lg 
                     z-50 text-center max-w-sm w-[90%]"
        >
          <p className="text-sm font-semibold">
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
