"use client";

import { motion } from "framer-motion";
import { FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn, FaTelegramPlane } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-white to-orange-50 py-8 border-t border-orange-100 text-center">
      <motion.div
        className="max-w-5xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 💬 Tagline */}
        <p className="text-gray-700 mb-4">
          Love Helping Kids? <span className="text-orange-600 font-semibold">Humanity starts with compassion.</span>
        </p>

        {/* 🌐 Social Icons */}
        <div className="flex justify-center gap-5 mb-4 text-orange-600">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
            <FaFacebookF size={20} />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
            <FaXTwitter size={20} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
            <FaInstagram size={20} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
            <FaLinkedinIn size={20} />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
            <FaTelegramPlane size={20} />
          </a>
        </div>

        {/* 🧡 Footer Note */}
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} SolarizedNG • Built with 💖 to empower and uplift lives.
        </p>
      </motion.div>
    </footer>
  );
}
