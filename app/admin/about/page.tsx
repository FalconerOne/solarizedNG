"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchAboutData } from "@/lib/fetchAboutData";
import HeroSection from "@/components/about/HeroSection";
import MissionSection from "@/components/about/MissionSection";
import TeamGrid from "@/components/about/TeamGrid";
import TimelineSection from "@/components/about/TimelineSection";
import ContactCTA from "@/components/about/ContactCTA";

export const revalidate = 3600; // Refresh data hourly

export default function AboutPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchAboutData();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch about data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="bg-zinc-950 text-white overflow-hidden min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <HeroSection />
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="w-3/4 h-8 bg-zinc-800 animate-pulse rounded-md"></div>
          <div className="w-2/3 h-6 bg-zinc-800 animate-pulse rounded-md"></div>
          <div className="w-3/4 h-8 bg-zinc-800 animate-pulse rounded-md"></div>
        </div>
      ) : (
        <>
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <MissionSection missionText={data?.mission?.mission_text || ""} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <TeamGrid members={data?.team || []} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <TimelineSection milestones={data?.milestones || []} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <ContactCTA />
          </motion.section>
        </>
      )}
    </main>
  );
}
