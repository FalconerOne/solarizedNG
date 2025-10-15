"use client";

import { motion } from "framer-motion";

export default function MissionSection({ missionText }: { missionText: string }) {
  return (
    <section className="py-20 bg-zinc-950 text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-3xl font-bold text-amber-400 mb-4"
      >
        Our Mission
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-zinc-300 text-lg"
      >
        {missionText ||
          "Empowering creators and brands to reward authentic engagement through transparent giveaways."}
      </motion.p>
    </section>
  );
}
