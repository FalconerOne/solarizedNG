"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const partners = [
  { name: "Falconsubs", logo: "/partners/falconsubs.jpg" },
  { name: "Cfort N' More", logo: "/partners/cfort.png" },
  { name: "Solarize Solutions Nig Ltd", logo: "/partners/solarize.png" },
  { name: "Falcon Wireless Communications", logo: "/partners/falconwireless.png" },
  { name: "Talk District", logo: "/partners/talkdistrict.png" },
  { name: "Metro Angels", logo: "/partners/metroangels.png" },
  { name: "FadaSon Logistics", logo: "/partners/fadason.png" },
  { name: "HeroWears", logo: "/partners/herowears.png" },
];

export default function PartnersSection() {
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

        {/* animated partners showcase */}
        <div className="relative overflow-hidden group">
          <motion.div
            className="flex gap-8 items-center"
            animate={{ x: ["0%", "-50%"], opacity: [0, 1] }}
            transition={{
              repeat: Infinity,
              duration: 30, // slower movement
              ease: "linear",
            }}
          >
            {[...partners, ...partners].map((p, i) => (
              <motion.div
                key={p.name + i}
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex flex-col items-center justify-center p-2 flex-shrink-0"
                style={{ width: "100px" }}
              >
                <div className="relative w-[90px] h-[50px] rounded-md overflow-hidden bg-white/90 border border-gray-100 flex items-center justify-center shadow-sm">
                  <Image
                    src={p.logo}
                    alt={p.name}
                    fill
                    className="object-contain p-2"
                    sizes="100px"
                  />
                </div>
                <div className="text-[10px] text-gray-700 mt-1 text-center truncate w-full">
                  {p.name}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* fade edges for smooth look */}
          <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
