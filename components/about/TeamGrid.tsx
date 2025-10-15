"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo_url?: string;
}

export default function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <section className="py-20 bg-zinc-900">
      <h2 className="text-3xl font-bold text-center text-amber-400 mb-10">
        Meet the Team
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {members?.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ scale: 1.05 }}
            className="bg-zinc-800 rounded-2xl p-6 text-center shadow-lg"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border border-amber-400">
              <Image
                src={m.photo_url || "/default-avatar.png"}
                alt={m.name}
                width={96}
                height={96}
              />
            </div>
            <h3 className="text-xl font-semibold text-zinc-100">{m.name}</h3>
            <p className="text-amber-400 text-sm">{m.role}</p>
            <p className="text-zinc-400 mt-2 text-sm">{m.bio}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
