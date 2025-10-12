"use client";

import { useEffect, useState } from "react";

export default function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setUpdateAvailable(true);
        setVisible(true);

        // Auto-hide after 10 seconds (optional)
        setTimeout(() => setVisible(false), 10000);
      });
    }
  }, []);

  if (!updateAvailable || !visible) return null;

  return (
    <div
      className="fixed bottom-5 right-5 bg-orange-500 text-white px-4 py-3 rounded-2xl shadow-lg z-50 
                 transition-all duration-700 ease-in-out transform animate-fadeSlideIn"
    >
      <p className="text-sm font-medium">🚀 New version available!</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-1 text-xs underline hover:text-orange-200 transition"
      >
        Refresh now
      </button>
    </div>
  );
}
