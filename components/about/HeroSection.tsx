"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-b from-amber-200/20 to-zinc-900/90 text-center py-24">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-extrabold text-amber-400"
      >
        SolarizedNG
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-zinc-200 mt-4 text-lg md:text-xl max-w-2xl"
      >
        Building transparent, fair, and engaging digital giveaway experiences.
      </motion.p>

      <div className="mt-6 flex gap-4">
        <Button className="bg-amber-500 hover:bg-amber-600 text-white">
          Get Started
        </Button>
        <Button variant="outline" className="text-white border-zinc-500">
          Learn More
        </Button>
      </div>
    </section>
  );
}
