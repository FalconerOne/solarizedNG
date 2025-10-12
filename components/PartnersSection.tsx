"use client";

import { useEffect, useState } from "react";
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

      if (error) console.error("❌ Error fetching partners:", error);
      else setPartners(data || []);
      setLoading(false);
    }

    fetchPartners();
  }, []);

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500 animate-pulse">
        Loading partners...
      </div>
    );

  return (
    <section className="w-full bg-gradient-to-r from-orange-100 via-white to-orange-50 py-12 px-4 text-center rounded-t-3xl">
      <h2 className="text-xl md:text-2xl font-semibold text-orange-700 mb-8">
        Our Partners & Sponsors
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="flex flex-col items-center space-y-2 transform transition hover:scale-105 hover:opacity-90"
          >
            <div className="relative w-28 h-16 md:w-36 md:h-20 overflow-hidden rounded-lg shadow-md bg-white">
              <Image
                src={partner.logo_url}
                alt={partner.name}
                fill
                className="object-contain p-2"
              />
            </div>
            <p className="text-sm text-gray-700 font-medium">{partner.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
