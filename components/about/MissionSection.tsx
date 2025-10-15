// components/about/MissionSection.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { fetchAboutData } from "@/lib/fetchaboutdata";

export default function MissionSection() {
  const [mission, setMission] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchAboutData("mission");
        setMission(data?.content || "Our mission is to create sustainable engagement and trust through transparent innovation.");
      } catch (err) {
        console.error("Mission fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <section
      id="mission"
      className="relative bg-zinc-950/90 text-gray-200 py-20 px-6 border-t border-white/10"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-orange-400 mb-6"
        >
          Our Mission
        </motion.h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-500 w-6 h-6 mb-3" />
            <p className="text-gray-500 text-sm animate-pulse">Loading mission...</p>
            <div className="mt-4 w-64 h-4 bg-gray-800 rounded-md overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-gray-700 to-gray-500 animate-[shimmer_1.5s_infinite]" />
            </div>
            <style jsx>{`
              @keyframes shimmer {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(300%);
                }
              }
            `}</style>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
