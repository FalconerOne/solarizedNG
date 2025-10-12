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
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-green-50 to-orange-50 text-center p-6">
      
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
        <h1 className="text-4xl font-extrabold text-orange-600 mb-4">
          SolarizedNG Charity Giveaway
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto mb-6">
          Activate your chance today — Your Small Act/participation Helps Heart Heroes Support Foundation
          Support a Sick Child with Medical Bills, Surgery Cost and Medication Access.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow hover:bg-orange-600 transition"
          >
            Join the Giveaway
          </Link>
          <Link
            href="/status"
            className="bg-white border border-orange-400 text-orange-700 px-6 py-3 rounded-xl hover:bg-orange-50 transition"
          >
            Check My Status
          </Link>
        </div>
      </section>

      {/* 🎁 Revolving Prizes Section */}
      <motion.div
        key={prize.img}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-md w-full bg-white/90 rounded-2xl shadow-lg p-4 mb-10"
      >
        <Image
          src={prize.img}
          alt={prize.title}
          width={500}
          height={300}
          className="rounded-xl shadow-md mb-4"
        />
        <h2 className="text-2xl font-semibold text-orange-600">{prize.title}</h2>
        <p className="text-gray-700">Draw Date: {prize.drawDate}</p>
      </motion.div>

      {/* 🏆 Dynamic Winners Carousel */}
      <div className="w-full max-w-2xl mb-10">
        <WinnerCarousel />
      </div>

      {/* 💖 Humanity Footer */}
      <footer className="mt-auto text-sm text-gray-600 text-center">
        <p>
          Humanity starts with compassion...{" "}
          <a
            href="https://heatheroes.org.ng/campaigns"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 font-semibold underline"
          >
            Make an Impact
          </a>
        </p>
      </footer>
    </div>
  );
}

