"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ContactCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-zinc-900 to-amber-500/10 text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-3xl font-bold text-amber-400 mb-4"
      >
        Let’s Connect
      </motion.h2>
      <p className="text-zinc-300 mb-6">
        Join our community or collaborate with us on the next big idea.
      </p>
      <div className="flex justify-center gap-4">
        <Button className="bg-amber-500 hover:bg-amber-600 text-white">
          Contact Us
        </Button>
        <Button variant="outline" className="text-white border-zinc-500">
          Follow on X
        </Button>
      </div>
    </section>
  );
}
