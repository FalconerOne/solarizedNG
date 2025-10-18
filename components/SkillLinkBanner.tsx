"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const slogans = [
  "🎯 Got Skills? Turn them into Cash on SkillLink Africa!",
  "💼 Your hustle fit pay — Link up with real gigs on SkillLink Africa!",
  "🚀 Don’t just wait for giveaways — start earning on SkillLink!",
  "💡 Show your talent, connect across Africa — SkillLink!",
  "🔥 From Lagos to Nairobi — Get paid for your skill on SkillLinkAfrica.ng!",
];

export const SkillLinkBanner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slogans.length);
    }, 5000); // ⏱️ Change slogan every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 text-center shadow-md">
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
            href="https://www.SkillLinkAfrica.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-700 transition-colors"
          >
            {slogans[index]}
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
