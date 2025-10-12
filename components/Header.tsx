"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/register", label: "Register" },
    { href: "/status", label: "Status" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer" onClick={() => (window.location.href = "/")}>
          <Image src="/images/HHSF-2.png" alt="Heart Heroes Logo" width={45} height={45} className="rounded-full border-2 border-orange-300 shadow-sm" />
          <h1 className="text-xl md:text-2xl font-semibold text-orange-600">SolarizedNG</h1>
        </motion.div>

        <button className="md:hidden text-orange-600 text-3xl focus:outline-none" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="relative text-orange-700 hover:text-orange-600 font-medium transition group">
              {link.label}
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="md:hidden bg-white border-t border-orange-100 shadow-lg">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block px-6 py-3 text-orange-700 hover:bg-orange-50 hover:text-orange-600 transition" onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
);
}
