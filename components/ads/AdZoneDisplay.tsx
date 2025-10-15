"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AdZone {
  zone_name: string;
  ad_code: string;
  is_active: boolean;
}

export default function AdZoneDisplay({ zone }: { zone: string }) {
  const [ad, setAd] = useState<AdZone | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data, error } = await supabase
        .from("ads_zone")
        .select("zone_name, ad_code, is_active")
        .eq("zone_name", zone)
        .eq("is_active", true)
        .single();

      if (!error && data) setAd(data);
    };

    fetchAd();
  }, [zone]);

  if (!ad) return null;

  return (
    <div
      className="my-6 mx-auto w-full flex justify-center"
      dangerouslySetInnerHTML={{ __html: ad.ad_code }}
    />
  );
}
