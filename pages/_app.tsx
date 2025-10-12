import type { AppProps } from "next/app";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingShareBar from "@/components/FloatingShareBar"; // ✅ Added import
import "@/styles/globals.css"; // ✅ Ensures global Segoe UI font + Tailwind styles are applied

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 font-[Segoe_UI]">
      <Header />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
      {/* ✅ Floating share bar (bottom-right) with soft 10s pulse */}
      <div className="animate-[pulse_10s_ease-in-out_infinite]">
        <FloatingShareBar />
      </div>
    </main>
  );
}
