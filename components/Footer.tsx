"use client";

import { motion } from "framer-motion";
import * as Icons from "react-icons/fa";
import { socialLinks } from "@/config/socials";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-white via-orange-50/50 to-orange-100/40 py-10 border-t border-orange-100 text-center">
      <motion.div
        className="max-w-5xl mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 💬 Tagline */}
        <p className="text-gray-700 text-base md:text-lg mb-5">
          Love Helping Kids?{" "}
          <span className="text-orange-600 font-semibold">
            Humanity starts with compassion.
          </span>
        </p>

        {/* 🌐 Social Icons */}
        <div className="flex justify-center gap-6 mb-6 text-orange-600">
          {socialLinks.map(({ name, icon, url }) => {
            const Icon = (Icons as any)[icon];
            return (
              <motion.a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-orange-100 text-orange-600 transition-all"
                aria-label={name}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={20} />
              </motion.a>
            );
          })}
        </div>

        {/* 🔸 Divider Line */}
        <div className="w-24 h-[2px] bg-orange-400/70 mx-auto mb-4 rounded-full" />

        {/* 🧡 Footer Note */}
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} <span className="font-semibold text-orange-700">SolarizedNG</span> • Built with 💖 to empower and uplift lives.
        </p>
      </motion.div>
    </footer>
  );
}
