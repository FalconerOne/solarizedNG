"use client";

import { useEffect, useState } from "react";

export default function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // Triggered when a new service worker takes control
        setUpdateAvailable(true);
      });
    }
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
      <p className="text-sm">A new version is available 🎉</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-1 text-xs underline hover:text-orange-200 transition"
      >
        Refresh now
      </button>
    </div>
  );
}
