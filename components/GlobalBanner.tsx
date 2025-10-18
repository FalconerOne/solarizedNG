"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { fetchBanners } from "@/lib/fetchBanners";

interface GlobalBannerProps {
  platform: "mygiveaway" | "skilllink";
}

export default function GlobalBanner({ platform }: GlobalBannerProps) {
  const [banners, setBanners] = useState<{ message: string; url: string }[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const data = await fetchBanners(platform);
      if (data.length > 0) setBanners(data);
    })();
  }, [platform]);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 text-center shadow-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="text-lg font-medium text-gray-800"
        >
          <Link
            href={banners[index].url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 transition-colors"
          >
            {banners[index].message}
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
