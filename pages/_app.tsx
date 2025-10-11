import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Header from "@/components/Header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Global sticky header */}
      <Header />

      {/* Add padding so page content doesn't hide under the fixed header */}
      <div className="pt-20 min-h-screen bg-gray-50">
        <main className="max-w-6xl mx-auto px-4">
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}
