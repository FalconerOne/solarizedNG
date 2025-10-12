import type { AppProps } from "next/app";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingShareBar from "@/components/FloatingShareBar"; // ✅ Floating share button
import ScrollToTop from "@/components/ScrollToTop"; // ✅ Smooth scroll-to-top button
import "@/styles/globals.css"; // ✅ Global styles + Segoe UI + Tailwind

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 font-[Segoe_UI]">
      {/* 🧭 Site Header */}
      <Header />

      {/* 📄 Main Page Content */}
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>

      {/* 🦶 Site Footer */}
      <Footer />

      {/* 🔗 Floating Share Button (bottom-right) with gentle pulse */}
      <div className="animate-[pulse_10s_ease-in-out_infinite]">
        <FloatingShareBar />
      </div>

      {/* ⬆️ Scroll to Top Button (just above the share bar) */}
      <ScrollToTop />
    </main>
  );
}
