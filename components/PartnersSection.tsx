"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
}

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    async function fetchPartners() {
      const { data, error } = await supabase
        .from("partners")
        .select("id, name, logo_url, website_url")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching partners:", error.message);
      } else if (data && data.length > 0) {
        setPartners(data);
      } else {
        // fallback default partners if table is empty
        setPartners([
          {
            id: "1",
            name: "Falconsubs",
            logo_url: "/partners/falconsubs.jpg",
            website_url: "https://falconsubs.com.ng",
          },
          {
            id: "2",
            name: "Cfort N' More",
            logo_url: "/partners/cfort.png",
            website_url: "https://cfortnmore.com.ng",
          },
          {
            id: "3",
            name: "Solarize Solutions Nig Ltd",
            logo_url: "/partners/solarize.png",
            website_url: "https://solarizesolutions.com.ng",
          },
        ]);
      }
    }

    fetchPartners();
  }, []);

  return (
    <section className="w-full max-w-6xl px-6 mt-10 mb-12">
      <div className="bg-white/80 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Our Partners & Sponsors
          </h3>
          <p className="text-sm text-gray-500">
            Trusted partners supporting our mission
          </p>
        </div>

        {/* animated marquee */}
        <div className="relative overflow-hidden group">
          <motion.div
            className="flex gap-8 items-center"
            animate={{ x: ["0%", "-50%"], opacity: [0, 1] }}
            transition={{
              repeat: Infinity,
              duration: 30,
              ease: "linear",
            }}
          >
            {[...partners, ...partners].map((p, i) => (
              <motion.a
                key={p.id + i}
                href={p.website_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, opacity: 1 }}
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
              </motion.a>
            ))}
          </motion.div>

          {/* fade edges */}
          <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
