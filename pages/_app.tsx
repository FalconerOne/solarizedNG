import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingShareBar from "@/components/FloatingShareBar";
import ScrollToTop from "@/components/ScrollToTop";
import ReminderBanner from "@/components/ReminderBanner";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ToastWrapper } from "@/components/ui/toast";
import MaintenancePreviewBanner from "@/components/MaintenancePreviewBanner"; // ✅ added

export default function App({ Component, pageProps }: AppProps) {
  // ✅ Optional: refresh session silently
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getSession();
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <ToastWrapper>
      {/* ✅ Global Maintenance Preview Ribbon */}
      <MaintenancePreviewBanner />

      <main className="min-h-screen flex flex-col bg-gray-50 font-[Segoe_UI]">
        <ReminderBanner />
        <Header />
        <div className="flex-grow">
          <Component {...pageProps} />
        </div>
        <Footer />
        <FloatingShareBar />
        <ScrollToTop />
      </main>
    </ToastWrapper>
  );
}
