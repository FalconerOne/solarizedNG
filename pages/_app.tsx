// pages/_app.tsx
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";            // ✅ Added for global SEO
import { SEO } from "@/next-seo.config";          // ✅ SEO configuration file
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingShareBar from "@/components/FloatingShareBar";
import ScrollToTop from "@/components/ScrollToTop";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 font-[Segoe_UI]">
      {/* ✅ Global SEO Configuration */}
      <DefaultSeo {...SEO} />

      {/* 🔝 Header */}
      <Header />

      {/* 🧩 Page Content */}
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>

      {/* 🔻 Footer */}
      <Footer />

      {/* 🟠 Floating share bar with soft pulse animation */}
      <div className="animate-[pulse_10s_ease-in-out_infinite]">
        <FloatingShareBar />
      </div>

      {/* 🔼 Scroll-to-top button */}
      <ScrollToTop />

      {/* 📊 Google Analytics placeholder (optional, fill your ID later) */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `,
        }}
      />
    </main>
  );
}
