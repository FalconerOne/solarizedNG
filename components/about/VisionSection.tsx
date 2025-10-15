// components/about/VisionSection.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchAboutData } from "@/lib/fetchaboutdata";
import { Sparkles, Loader2 } from "lucide-react";

export default function VisionSection() {
  const [vision, setVision] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchAboutData("vision");
        setVision(
          data?.content ||
            "We envision a transparent, user-driven ecosystem where innovation and community trust drive lasting impact."
        );
      } catch (err) {
        console.error("Vision fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <section
      id="vision"
      className="relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-24 px-6 overflow-hidden"
    >
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,0,0.12)_0%,transparent_70%)] animate-[pulseGlow_6s_ease-in-out_infinite]" />
      <style jsx>{`
        @keyframes pulseGlow {
          0% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-orange-400 mb-6 flex items-center justify-center gap-2"
        >
          <Sparkles className="text-orange-500 w-6 h-6" />
          Our Vision
        </motion.h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="animate-spin text-orange-400 w-6 h-6 mb-3" />
            <p className="text-gray-500 text-sm animate-pulse">Loading vision...</p>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-lg leading-relaxed text-gray-300 max-w-3xl mx-auto"
          >
            {vision}
          </motion.p>
        )}
      </div>
    </section>
  );
}
