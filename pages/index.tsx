import FloatingShareBar from "@/components/FloatingShareBar";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import WinnerCarousel from "@/components/WinnerCarousel";

const prizes = [
  { img: "/images/prize1.jpg", title: "1kVA Inverter", drawDate: "Oct 25, 2025" },
  { img: "/images/prize2.jpg", title: "₦50,000 Cash", drawDate: "Nov 10, 2025" },
  { img: "/images/prize3.jpg", title: "₦30,000 Cash", drawDate: "Dec 5, 2025" },
  { img: "/images/prize4.jpg", title: "₦20,000 Cash", drawDate: "Jan 1, 2026" },
];

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % prizes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prize = prizes[index];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-green-50 to-orange-50 text-center p-6 font-segoe">
      
      {/* 🩵 Pulsing Heart Heroes Logo */}
      <motion.div
        className="relative flex justify-center items-center my-8"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Image
          src="/images/HHSF-2.png"
          alt="Heart Heroes Logo"
          width={140}
          height={140}
          className="rounded-full shadow-xl border-4 border-orange-400 cursor-pointer"
          onClick={() => window.open("https://heatheroes.org.ng/campaigns", "_blank")}
        />
      </motion.div>

      {/* 🌞 Banner Section */}
      <section className="w-full max-w-3xl bg-white/80 py-10 px-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-4xl font-extrabold text-orange-brand mb-4">
          SolarizedNG Charity Giveaway
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto mb-6 leading-relaxed">
          Activate Your Chance NOW! — Win, Share, Support & Impact. 
          Keep the Fun Rolling and Help Heart Heroes Foundation Support More Kids!
        </p>

        {/* 🌟 Upgraded Buttons */}
        <div className="flex justify-center gap-4 font-segoe">
          <Link
            href="/register"
            className="bg-orange-brand text-white px-8 py-3 rounded-xl shadow-glow hover:bg-orange-brand-light transition-all duration-300 hover:scale-105"
          >
            🎉 Join the Giveaway
          </Link>
          <Link
            href="/status"
            className="
