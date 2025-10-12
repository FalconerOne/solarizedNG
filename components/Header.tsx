"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* 🩵 Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Image
            src="/images/HHSF-2.png"
            alt="Heart Heroes Logo"
            width={45}
            height={45}
            className="rounded-full border border-orange-300"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-orange-600">
            SolarizedNG
          </h1>
        </motion.div>

        {/* 🍔 Mobile Menu Button */}
        <button
          className="md:hidden text-orange-600 text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {/* 🧡 Navigation */}
        <nav
          className={`${
            isOpen ? "block" : "hidden"
          } absolute md:static top-full left-0 w-full md:w-auto bg-white md:bg-transparent md:flex items-center md:gap-6 mt-2 md:mt-0 border-t md:border-none`}
        >
          <Link
            href="/"
            className="block px-6 py-2 text-orange-700 hover:text-orange-500 transition"
          >
            Home
          </Link>
          <Link
            href="/register"
            className="block px-6 py-2 text-orange-700 hover:text-orange-500 transition"
          >
            Register
          </Link>
          <Link
            href="/status"
            className="block px-6 py-2 text-orange-700 hover:text-orange-500 transition"
          >
            Status
          </Link>
          <Link
            href="/contact"
            className="block px-6 py-2 text-orange-700 hover:text-orange-500 transition"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
