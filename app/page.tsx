"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import AdZoneDisplay from "@/components/ads/AdZoneDisplay"; // ✅ dynamic ad section

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-orange-50 to-white text-center px-6">
      {/* 🌞 Main Header */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold text-orange-600 mb-3"
      >
        SolarizedNG
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-6"
      >
        GiveAwayz
      </motion.h2>

      <p className="text-sm text-gray-500 mb-6">
        Powered by <span className="font-semibold text-orange-600">Solarize Solutions Nig Ltd</span>
      </p>

      {/* 🎯 Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-700 text-lg max-w-xl mb-8"
      >
        Join the fun, win <span className="text-orange-600 font-semibold">tablets, phones, smartwatches, cash rewards</span>, hoodies, t-shirts and much more every month!
      </motion.p>

      {/* 🚀 CTA Buttons */}
      <div className="flex gap-4 flex-wrap justify-center mb-8">
        <Link
          href="/register"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-md font-medium transition"
        >
          Join the Giveaway
        </Link>
        <Link
          href="/dashboard"
          className="border border-orange-400 text-orange-600 hover:bg-orange-100 px-6 py-3 rounded-full shadow-md font-medium transition"
        >
          Go to Dashboard
        </Link>
      </div>

      {/* 🏆 Prize Preview Section (images/video placeholders) */}
      <section className="w-full max-w-5xl mx-auto mb-10">
        <h3 className="text-2xl font-bold text-orange-600 mb-4">This Month’s Prizes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-center">
          <Image src="/prizes/phone.png" alt="Phone Prize" width={160} height={160} className="rounded-lg shadow" />
          <Image src="/prizes/tablet.png" alt="Tablet Prize" width={160} height={160} className="rounded-lg shadow" />
          <Image src="/prizes/watch.png" alt="Smartwatch Prize" width={160} height={160} className="rounded-lg shadow" />
          <Image src="/prizes/cash.png" alt="Cash Prize" width={160} height={160} className="rounded-lg shadow" />
        </div>
      </section>

      {/* 🧠 Scrolling/Interactive Line */}
      <motion.div
        animate={{ x: [0, -200, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        className="text-orange-500 font-semibold text-lg mb-8"
      >
        Join the fun • Win Big • Every Month • Join the fun • Win Big • Every Month
      </motion.div>

      {/* 🧩 AdZone - Landing Midsection */}
      <div className="w-full max-w-4xl mb-10">
        <AdZoneDisplay zone="landing-mid" />
      </div>

      {/* 🏅 Recent Winners (rotating placeholder) */}
      <section className="w-full bg-orange-50 py-8 border-y border-orange-200 mb-10">
        <h3 className="text-xl font-semibold text-orange-600 mb-4">Recent Winners</h3>
        <p className="text-gray-700">
          🎉 <strong>Chinedu A.</strong> just won a Smartwatch! <br />
          🎁 <strong>Oluwatobi E.</strong> claimed ₦10,000 airtime voucher!
        </p>
      </section>

      {/* 🤝 Partners Section */}
      <section className="w-full bg-orange-50 py-12 border-t border-orange-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-6">Our Partners</h2>
          <p className="text-gray-700 mb-8">
            Proudly supported by organizations and brands that believe in empowerment, growth, and giving back.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-center">
            <a href="https://solarizesolutions.com.ng" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
              <img src="/partners/solarize.png" alt="Solarize Solutions" className="mx-auto h-14 object-contain" />
            </a>
            <a href="https://falconsubs.com.ng" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
              <img src="/partners/falconsubs.png" alt="FalconSubs" className="mx-auto h-14 object-contain" />
            </a>
            <a href="https://cfortnmore.com.ng" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
              <img src="/partners/cfort.png" alt="Cfort & More" className="mx-auto h-14 object-contain" />
            </a>
            <div className="text-gray-400 italic">Coming soon…</div>
            <div className="text-gray-400 italic">Coming soon…</div>
          </div>
        </div>
      </section>

      {/* 📢 Bottom Ad Zone */}
      <div className="w-full max-w-4xl mb-10">
        <AdZoneDisplay zone="landing-bottom" />
      </div>

      {/* ⚙️ Footer */}
      <footer className="mt-8 text-sm text-gray-500">
        App designed by{" "}
        <span className="text-orange-600 font-semibold">FalconerOne Technologies</span>
      </footer>
    </main>
  );
}
