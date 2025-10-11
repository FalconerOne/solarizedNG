import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-orange-50 text-center p-6">
      
      {/* Pulsing Heart Heroes Logo */}
      <motion.div
        className="relative flex justify-center items-center mb-8"
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

      {/* Carousel */}
      <motion.div
        key={prize.img}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-md w-full bg-white/80 rounded-2xl shadow-lg p-4"
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

      {/* CTA */}
      <div className="mt-8 max-w-lg text-gray-700 leading-relaxed">
        <p className="text-md font-medium">
          Activate your chance today — Your Small Act/participation Helps Heart Heroes Support Foundation
          Support a Sick Child with Medical Bills, Surgery Cost and Medication Access.
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-sm text-gray-600">
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
