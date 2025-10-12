"use client";

import { motion } from "framer-motion";
import * as Icons from "react-icons/fa";
import { socialLinks } from "@/config/socials";

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
          Love Helping Kids?{" "}
          <span className="text-orange-600 font-semibold">
            Humanity starts with compassion.
          </span>
        </p>

        {/* 🌐 Social Icons with Brand Hover */}
        <div className="flex justify-center gap-5 mb-4">
          {socialLinks.map(({ name, icon, url, hoverColor }) => {
            const Icon = (Icons as any)[icon];
            return (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="text-orange-600 transition-transform transform hover:scale-110"
                style={{
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = hoverColor;
                  (e.currentTarget as HTMLElement).style.filter =
                    `drop-shadow(0 0 6px ${hoverColor})`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#EA580C"; // Tailwind orange-600
                  (e.currentTarget as HTMLElement).style.filter = "none";
                }}
              >
                <Icon size={22} />
              </a>
            );
          })}
        </div>

        {/* 🧡 Footer Note */}
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()}{" "}
          <span className="text-orange-600 font-semibold">SolarizedNG</span> •
          Built with 💖 to empower and uplift lives.
        </p>
      </motion.div>
    </footer>
  );
}
