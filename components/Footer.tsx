// components/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden mt-12 py-8 text-center border-t border-gray-200 bg-gradient-to-t from-pink-50 via-white to-white">
      {/* Floating hearts background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-pink-300"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 20}px`,
              fontSize: `${Math.random() * 14 + 10}px`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [-10, -120],
              transition: {
                duration: Math.random() * 6 + 5,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              },
            }}
          >
            ❤️
          </motion.span>
        ))}
      </div>

      {/* Main footer content */}
      <div className="relative flex flex-col items-center justify-center space-y-2 px-4 z-10">
        {/* CTA Section */}
        <p className="text-sm text-gray-700 max-w-md leading-relaxed">
          <strong>Activate your chance today —</strong> Your small act of participation helps{" "}
          <span className="font-semibold text-pink-600">
            Heart Heroes Support Foundation
          </span>{" "}
          support a sick child with medical bills, surgery costs, and medication access.
        </p>

        {/* Humanity tagline + clickable logo */}
        <div className="flex items-center justify-center space-x-2 mt-3">
          <p className="text-gray-700 text-sm">
            Humanity starts with compassion...{" "}
            <Link
              href="https://heatheroes.org.ng/campaigns"
              target="_blank"
              className="text-pink-600 font-semibold hover:underline"
            >
              Make an impact
            </Link>
          </p>

          <Link
            href="https://heatheroes.org.ng/campaigns"
            target="_blank"
            className="animate-pulse"
          >
            <Image
              src="/images/heart-heroes-logo.png"
              alt="Heart Heroes Logo"
              width={34}
              height={34}
              className="ml-2 rounded-full shadow-md hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
