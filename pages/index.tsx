"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import WinnerCarousel from "@/components/WinnerCarousel";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-orange-50 overflow-hidden text-gray-800">
      {/* 🌞 Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 sm:pt-32 sm:pb-24">
        {/* Decorative background glow */}
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,165,0,0.15),_transparent_70%)] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />

        {/* Hero text */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-orange-600 drop-shadow-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          SolarizedNG Charity Giveaway 🌞
        </motion.h1>

        <motion.p
          className="max-w-2xl text-gray-700 text-lg sm:text-xl leading-relaxed mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Win with friends, family, and others — while supporting{" "}
          <span className="text-orange-600 font-semibold">
            Heart Heroes Foundation.
          </span>
        </motion.p>

        {/* Hero Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Link
            href="/register"
            className="px-6 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 hover:shadow-glow transition-transform hover:scale-105"
          >
            Register Now
          </Link>
          <Link
            href="/status"
            className="px-6 py-3 rounded-full border border-orange-400 text-orange-600 font-semibold hover:bg-orange-50 transition-transform hover:scale-105"
          >
            Check Status
          </Link>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          className="relative mt-14 w-full max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Image
            src="/images/HHSF-2.png"
            alt="Heart Heroes Foundation"
            width={700}
            height={400}
            className="rounded-2xl shadow-md mx-auto"
            priority
          />
        </motion.div>
      </section>

      {/* 🏆 Winner Carousel */}
      <section className="bg-white py-16 border-t border-orange-100">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center text-orange-600 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Recent Winners 🏅
        </motion.h2>
        <WinnerCarousel />
      </section>

      {/* ❤️ CTA Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-orange-50 to-white text-center border-t border-orange-100">
        <motion.h3
          className="text-3xl font-bold text-orange-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Every Entry Makes a Difference 💖
        </motion.h3>
        <motion.p
          className="max-w-xl mx-auto text-gray-700 text-lg leading-relaxed mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Together, we bring smiles to children and families through love,
          compassion, and support. Be part of the change — it starts with you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Link
            href="/register"
            className="px-8 py-3 bg-orange-500 text-white rounded-full text-lg font-semibold shadow-md hover:bg-orange-600 hover:scale-105 transition-all"
          >
            Join the Giveaway
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
