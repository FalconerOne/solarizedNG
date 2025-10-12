"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

type Partner = {
  id: number;
  name: string;
  logo_url: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, logo_url")
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ Error fetching partners:", error);
      } else if (data && data.length > 0) {
        setPartners(data);
      } else {
        // fallback if Supabase has no entries
        setPartners([
          { id: 1, name: "Falconsubs", logo_url: "/partners/falconsubs.jpg" },
          { id: 2, name: "Cfort N' More", logo_url: "/partners/cfort.png" },
          { id: 3, name: "Solarize Solutions Nig Ltd", logo_url: "/partners/solarize.png" },
          { id: 4, name: "Falcon Wireless Communications", logo_url: "/partners/falconwireless.png" },
          { id: 5, name: "Talk District", logo_url: "/partners/talkdistrict.png" },
          { id: 6, name: "Metro Anges", logo_url: "/partners/metroangels.png" },
          { id: 7, name: "FadaSon Logistics", logo_url: "/partners/fadason.png" },
          { id: 8, name: "HeroWears", logo_url: "/partners/herowears.png" },
        ]);
      }

      setLoading(false);
    }

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 animate-pulse">
        Loading partners...
      </div>
    );
  }

  const marqueePartners = [...partners, ...partners]; // duplicate for smooth scroll

  return (
    <section className="w-full max-w-6xl px-6 mt-10 mb-12">
      <div className="bg-white/80 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Our Partners & Sponsors</h3>
          <p className="text-sm text-gray-500">Trusted partners supporting our mission</p>
        </div>

        <div className="relative overflow-hidden group">
          <motion.div
            className="flex gap-8 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "linear",
            }}
          >
            {marqueePartners.map((p, i) => (
              <div
                key={p.name + i}
                className="flex flex-col items-center justify-center p-2 flex-shrink-0"
                style={{ width: "120px" }}
              >
                <div className="relative w-[100px] h-[60px] rounded-md overflow-hidden bg-white/90 border border-gray-100 flex items-center justify-center shadow-sm">
                  <Image
                    src={p.logo_url}
                    alt={p.name}
                    fill
                    className="object-contain p-2"
                    sizes="100px"
                  />
                </div>
                <div className="text-[10px] text-gray-700 mt-1 text-center truncate w-full">
                  {p.name}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Fade edges */}
          <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
