import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const services = [
  {
    id: "falconsubs",
    title: "FALCONSUBS",
    subtitle: "Get free Airtime / Data / Electricity",
    url: "https://falconsubs.com.ng",
    logo: "/partners/falconsubs.jpg",
  },
  {
    id: "solarize",
    title: "SOLARIZEDNG",
    subtitle: "Light up your life with Solar",
    url: "https://solarizesolutions.com.ng",
    logo: "/partners/solarize.png",
  },
  {
    id: "smoothglow",
    title: "SmoothGlow",
    subtitle: "Get smooth glowing skin — Cfort N' More",
    url: "https://cfortnmore.com.ng",
    logo: "/partners/cfort.png",
  },
];

const partners = [
  { name: "Falconsubs", logo: "/partners/falconsubs.jpg" },
  { name: "Cfort N' More", logo: "/partners/cfort.png" },
  { name: "Solarize Solutions Nig Ltd", logo: "/partners/solarize.png" },
  { name: "Falcon Wireless Communications", logo: "/partners/falconwireless.png" },
  { name: "Talk District", logo: "/partners/talkdistrict.png" },
  { name: "Metro Anges", logo: "/partners/metroangels.png" },
  { name: "FadaSon Logistics", logo: "/partners/fadason.png" },
  { name: "HeroWears", logo: "/partners/herowears.png" },
];

export default function Home() {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* HERO */}
      <section className="relative w-full flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-b from-yellow-50 via-orange-50 to-white overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 50% 10%, rgba(255,213,79,0.18) 0%, transparent 45%)",
          }}
        />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-wide mb-2" style={{ color: "#9CCC65" }}>
            SOLARIZED
          </h1>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4" style={{ color: "#D4A017" }}>
            CHARITY GIVEAWAY
          </h2>
          <p className="text-sm md:text-base font-medium mb-3" style={{ color: "#8BC34A" }}>
            Powered by{" "}
            <span className="font-semibold" style={{ color: "#7CB342" }}>
              Solarize Solutions Nig. Ltd
            </span>
          </p>
          <p className="text-base md:text-lg text-gray-700 font-medium mb-2">
            Win with friends, family, and others — while supporting
          </p>
          <p className="text-sm md:text-base text-gray-600 mb-4 max-w-xl mx-auto">
            Together, we bring smiles to children and families through love, compassion,
            and support. Be part of the change — it starts with you.
          </p>

          {/* Live clock */}
          <div className="mt-2 text-sm text-gray-700 bg-white/60 px-4 py-2 rounded-full inline-flex items-center gap-3 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
            <div>
              <div className="text-xs text-gray-500">Current time</div>
              <div className="text-sm font-medium">
                {now.toLocaleString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="w-full max-w-5xl px-6 mt-10">
        <div className="bg-gradient-to-r from-sky-800/90 to-indigo-800/90 text-white rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {services.map((s) => (
              <motion.a
                key={s.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white/6 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 relative flex-shrink-0 rounded-md overflow-hidden bg-white/10 flex items-center justify-center">
                  <Image
                    src={s.logo}
                    alt={s.title}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-white/80">{s.subtitle}</div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS / SPONSORS - Marquee */}
      <section className="w-full max-w-6xl px-6 mt-10 mb-12">
        <div className="bg-white/80 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Our Partners & Sponsors</h3>
            <p className="text-sm text-gray-500">Trusted partners supporting our mission</p>
          </div>

          {/* marquee */}
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
              {[...partners, ...partners].map((p, i) => (
                <div
                  key={p.name + i}
                  className="flex flex-col items-center justify-center p-2 flex-shrink-0"
                  style={{ width: "120px" }}
                >
                  <div className="relative w-[100px] h-[60px] rounded-md overflow-hidden bg-white/90 border border-gray-100 flex items-center justify-center shadow-sm">
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
                </div>
              ))}
            </motion.div>

            {/* fade edges */}
            <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
