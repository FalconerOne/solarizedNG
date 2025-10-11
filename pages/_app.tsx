import type { AppProps } from "next/app";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
    </main>
  );
}
