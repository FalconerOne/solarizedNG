// /pages/_app.tsx
import { useEffect } from "react";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingShareBar from "@/components/FloatingShareBar";
import ScrollToTop from "@/components/ScrollToTop";

export default function App({ Component, pageProps }: AppProps) {
  // ✅ Register the Service Worker once when app loads
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then(() => console.log("✅ Service Worker registered successfully"))
          .catch((err) => console.error("❌ Service Worker registration failed:", err));
      });
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 font-[Segoe_UI]">
      <Header />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
      {/* Floating share bar (gentle pulse) */}
      <div className="animate-[pulse_10s_ease-in-out_infinite]">
        <FloatingShareBar />
      </div>
      <ScrollToTop />
      import UpdatePrompt from "@/components/UpdatePrompt";

export default function App({ Component, pageProps }: AppProps) {
  // ... existing code
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
      <div className="animate-[pulse_10s_ease-in-out_infinite]">
        <FloatingShareBar />
      </div>
      <ScrollToTop />
      <UpdatePrompt /> {/* ✅ Add this here */}
    </main>
  );
}
    </main>
  );
}
