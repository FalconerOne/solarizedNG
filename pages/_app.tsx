import { useEffect } from "react";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingShareBar from "@/components/FloatingShareBar";
import ScrollToTop from "@/components/ScrollToTop";
import UpdatePrompt from "@/components/UpdatePrompt"; // ✅ Import it here

export default function App({ Component, pageProps }: AppProps) {
  // ✅ Register Service Worker once when app loads
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then(() => console.log("✅ Service Worker registered"))
          .catch((err) => console.error("❌ SW registration failed:", err));
      });
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />

      {/* ✅ Floating share animation */}
      <div className="animate-[pulse_10s_ease-in-out_infinite]">
        <FloatingShareBar />
      </div>

      <ScrollToTop />

      {/* ✅ Add the update prompt here — after everything else */}
      <UpdatePrompt />
    </main>
  );
}
