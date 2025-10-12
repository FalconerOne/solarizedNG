import type { AppProps } from "next/app";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingShareBar from "@/components/FloatingShareBar"; // ✅ Added import

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 font-[Segoe_UI]">
      <Header />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
      <FloatingShareBar /> {/* ✅ Floating share bar appears site-wide, bottom-right */}
    </main>
  );
}
