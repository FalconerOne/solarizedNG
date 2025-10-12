"use client";

import { motion } from "framer-motion";
import * as Icons from "react-icons/fa";
import { socialLinks } from "@/config/socials";

export default function Footer() {
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SolarizedNG",
          text: "Check out SolarizedNG – Empowering and uplifting lives 🌞",
          url: "https://solarizedng.vercel.app",
        });
      } catch (err) {
        console.error("Share cancelled or failed:", err);
      }
    } else {
      alert("Sharing not supported on this device — use the social icons instead!");
    }
  };

  return (
    <footer className="w-full bg-gradient-to-b from-white to-orange-50 py-10 border-t border-orange-100 text-center">
      <motion.div
        className="max-w-5xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 💬 Tagline */}
        <p className="text-gray-700 mb-4 text-base">
          Love Helping Kids?{" "}
          <span className="text-orange-600 font-semibold">
            Humanity starts with compassion.
          </span>
        </p>

        {/* 🌐 Main Social Icons */}
        <div className="flex justify-center gap-5 mb-6 flex-wrap">
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
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = hoverColor;
                  (e.currentTarget as HTMLElement).style.filter =
                    `drop-shadow(0 0 6px ${hoverColor})`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#EA580C";
                  (e.currentTarget as HTMLElement).style.filter = "none";
                }}
              >
                <Icon size={22} />
              </a>
            );
          })}
        </div>

        {/* 🔗 Share This App / Site */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            🔗 Share this App/Site
          </p>

          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 mx-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full shadow-md transition-transform hover:scale-105"
          >
            <Icons.FaShareAlt size={16} />
            <span>Share Now</span>
          </button>

          {/* 🌐 Fallback social links for desktop */}
          <div className="flex justify-center gap-4 flex-wrap mt-4">
            {socialLinks.slice(0, 3).map(({ name, icon, url, hoverColor }) => {
              const Icon = (Icons as any)[icon];
              return (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="text-orange-600 hover:scale-110 transition-transform"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = hoverColor;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#EA580C";
                  }}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
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
