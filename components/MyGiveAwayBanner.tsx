"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const messages = [
  "🎁 Win, Track, and Celebrate Giveaways on MyGiveAway.ng!",
  "🌟 Join Giveaways that Support Charities and Spark Joy!",
  "🎉 Every Win Counts — Be Part of Something Giving!",
  "💖 Turn Celebration into Purpose — Explore MyGiveAway.ng!",
  "🚀 Discover Giveaways that Delight You & Support Charity!",
];

export const MyGiveAwayBanner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50 p-4 text-center shadow-md">
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
            href="https://www.MyGiveAway.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rose-600 transition-colors"
          >
            {messages[index]}
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
