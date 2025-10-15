"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AdZoneProps {
  zone: string; // e.g., "landing-bottom", "profile-mid", "dashboard-top"
}

export default function AdZone({ zone }: AdZoneProps) {
  const [adCode, setAdCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data, error } = await supabase
        .from("ad_zones")
        .select("code")
        .eq("zone", zone)
        .maybeSingle();

      if (!error && data?.code) setAdCode(data.code);
    };

    fetchAd();
  }, [zone]);

  if (!adCode) return null; // Don’t render empty blocks

  return (
    <div
      className="w-full my-10 flex justify-center"
      dangerouslySetInnerHTML={{ __html: adCode }}
    />
  );
}
