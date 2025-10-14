"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showBanner, setShowBanner] = useState(false);

  // Load banner setting from Supabase
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadSetting() {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "show_banner")
        .single();

      if (!error && data) setShowBanner(data.value);
    }

    loadSetting();

    // Subscribe to realtime changes for instant update
    const channel = supabase
      .channel("app_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        (payload) => {
          if (payload.new?.key === "show_banner") {
            setShowBanner(payload.new.value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-950 text-white">
      {showBanner && (
        <div className="fixed top-0 left-0 w-full text-center bg-emerald-600 text-white text-xs py-1 z-50 shadow-md">
          ✅ SolarizedNG v1.0 Stable — Live Sync Active
        </div>
      )}

      <main className="pt-6 px-4">{children}</main>
    </div>
  );
}
