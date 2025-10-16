"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ProgressBarProps {
  isActive: boolean;
}

export default function ProgressBar({ isActive }: ProgressBarProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="progress-bar"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[9999]"
        />
      )}
    </AnimatePresence>
  );
}
