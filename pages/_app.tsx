// /pages/_app.tsx
import { useEffect } from "react";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingShareBar from "@/components/FloatingShareBar";
import ScrollToTop from "@/components/ScrollToTop";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // ✅ Ensure window & navigator exist (avoid SSR crash)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerServiceWorker = async () => {
        try {
          await navigator.serviceWorker.register("/service-worker.js");
          console.log("✅ Service Worker registered successfully");
        } catch (error) {
          console.error("❌ Service Worker registration failed:", error);
        }
      };

      // Run registration only after full page load
      window.addEventListener("load", registerServiceWorker);

      // Cleanup listener when component unmounts
      return () => window.removeEventListener("load", registerServiceWorker);
    }
  }, []);

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
    </main>
  );
}
