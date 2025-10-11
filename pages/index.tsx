import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-white to-pink-50 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Pulsating animated background */}
      <motion.div
        className="absolute inset-0 bg-pink-200 opacity-30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Heart Heroes logo */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/images/HEART HEROES SUPPORT pn.png"
          alt="Heart Heroes Logo"
          width={120}
          height={120}
          className="rounded-full shadow-lg"
        />

        <h1 className="mt-6 text-4xl md:text-5xl font-bold text-pink-700">
          SolarizedNG Giveaway
        </h1>

        <p className="mt-4 text-gray-700 max-w-2xl text-lg px-4">
          Activate your chance today — Your Small Act/participation Helps Heart Heroes Support Foundation Support a Sick Child with Medical bills, Surgery cost and Medication access.
        </p>

        <Link
          href="/register"
          className="mt-8 bg-pink-600 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-pink-700 transition-all shadow-md"
        >
          Join Giveaway
        </Link>
      </motion.div>

      {/* Footer CTA */}
      <footer className="absolute bottom-4 w-full text-center text-sm text-gray-600">
        Humanity starts with compassion...{" "}
        <a
          href="https://heatheroes.org.ng/campaigns"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 font-medium hover:underline"
        >
          Make an impact
        </a>
      </footer>
    </div>
  );
}
