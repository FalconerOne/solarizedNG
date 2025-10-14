"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/register", label: "Register" },
    { href: "/status", label: "Status" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100 shadow-sm">
      {/* Top gradient accent line */}
      <div className="h-[3px] bg-gradient-to-r from-orange-400 via-pink-400 to-yellow-400" />

      {/* Header content */}
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4 transition-all duration-300">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          <Image
            src="/images/HHSF-2.png"
            alt="SolarizedNG Logo"
            width={45}
            height={45}
            className="rounded-full border-2 border-orange-300 shadow-md hover:shadow-orange-200 transition-all duration-300"
          />
          <h1 className="text-xl md:text-2xl font-semibold text-orange-600 drop-shadow-sm">
            SolarizedNG
          </h1>
        </motion.div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-orange-600 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-medium transition-all duration-300 group ${
                  isActive
                    ? "text-orange-600"
                    : "text-orange-700 hover:text-orange-600"
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-0 bottom-0 h-[2px] transition-all duration-300 ${
                    isActive
                      ? "w-full bg-orange-500"
                      : "w-0 group-hover:w-full bg-orange-400"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t border-orange-100 shadow-lg"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-6 py-3 font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? "text-orange-600 bg-orange-50"
                    : "text-orange-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
