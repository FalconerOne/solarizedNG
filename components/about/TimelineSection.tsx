"use client";

import { motion } from "framer-motion";

interface Milestone {
  year: number;
  title: string;
  description: string;
}

export default function TimelineSection({ milestones }: { milestones: Milestone[] }) {
  return (
    <section className="py-20 bg-zinc-950 text-center">
      <h2 className="text-3xl font-bold text-amber-400 mb-10">Our Journey</h2>
      <div className="max-w-3xl mx-auto space-y-8">
        {milestones?.map((m, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative border-l-2 border-amber-400 pl-6 text-left"
          >
            <span className="text-amber-400 font-semibold">{m.year}</span>
            <h3 className="text-lg text-zinc-100 mt-1">{m.title}</h3>
            <p className="text-zinc-400 text-sm">{m.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
