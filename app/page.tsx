"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-orange-50 to-white text-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-5xl font-bold text-orange-600 mb-6"
      >
        Welcome to SolarizedNG
      </motion.h1>

      <p className="text-gray-700 text-lg max-w-xl mb-8">
        Empowering and uplifting lives through solar innovation 🌞  
        Join our mission to bring light and opportunity to every home.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/register"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-md font-medium transition"
        >
          Get Started
        </Link>
        <Link
          href="/dashboard"
          className="border border-orange-400 text-orange-600 hover:bg-orange-100 px-6 py-3 rounded-full shadow-md font-medium transition"
        >
          Go to Dashboard
        </Link>
      </div>

      {/* 🤝 Our Partners Section */}
<section className="w-full bg-orange-50 py-12 border-t border-orange-200">
  <div className="max-w-6xl mx-auto px-4 text-center">
    <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-6">
      Our Partners
    </h2>
    <p className="text-gray-700 mb-8">
      Proudly supported by amazing organizations and brands that believe in empowerment, growth, and giving back.
    </p>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-center">
      {/* Example partner logos - editable later via Supabase */}
      <a href="https://solarizesolutions.com.ng" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
        <img src="/partners/solarize.png" alt="Solarize Solutions" className="mx-auto h-14 object-contain" />
      </a>

      <a href="https://falconsubs.com.ng" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
        <img src="/partners/falconsubs.png" alt="FalconSubs" className="mx-auto h-14 object-contain" />
      </a>

      <a href="https://cfortnmore.com.ng" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
        <img src="/partners/cfort.png" alt="Cfort & More" className="mx-auto h-14 object-contain" />
      </a>

      {/* Add placeholders for future partners */}
      <div className="text-gray-400 italic">Coming soon…</div>
      <div className="text-gray-400 italic">Coming soon…</div>
    </div>
  </div>
</section>

      <footer className="mt-12 text-sm text-gray-500">
        App designed by <span className="text-orange-600 font-semibold">FalconerOne Technologies</span>
      </footer>
    </main>
  );
}
