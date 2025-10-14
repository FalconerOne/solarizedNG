"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function AnimatedCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl shadow-sm bg-white/5 backdrop-blur p-4 hover:shadow-md transition-shadow"
    >
      {children}
    </motion.div>
  );
}
