"use client";
import { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js");
    }
  }, []);

  useEffect(() => {
    let deferredPrompt: any;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBanner = document.getElementById("install-banner");
      if (installBanner) installBanner.style.display = "block";
    });

    const btn = document.getElementById("install-btn");
    if (btn) {
      btn.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt = null;
        }
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <div id="install-banner" className="hidden fixed bottom-4 inset-x-0 mx-auto bg-indigo-600 text-white p-3 rounded-xl w-fit text-center shadow-lg">
          <p>Install SolarizedNG for faster access</p>
          <button id="install-btn" className="mt-2 bg-white text-indigo-700 px-4 py-1 rounded-md">Install</button>
        </div>
        {children}
      </body>
    </html>
  );
}
