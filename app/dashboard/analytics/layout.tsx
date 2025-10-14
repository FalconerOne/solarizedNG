"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({
    show_banner: false,
    maintenance_mode: false,
    system_message: "",
  });

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadSettings() {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value, value_text");
      if (data) {
        const mapped: any = {};
        data.forEach((s) => {
          mapped[s.key] = s.value ?? s.value_text;
        });
        setSettings((prev) => ({
          ...prev,
          show_banner: mapped.show_banner ?? prev.show_banner,
          maintenance_mode: mapped.maintenance_mode ?? prev.maintenance_mode,
          system_message: mapped.system_message ?? prev.system_message,
        }));
      }
    }

    loadSettings();

    const channel = supabase
      .channel("app_settings_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () =>
        loadSettings()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (settings.maintenance_mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center px-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">🚧 Maintenance Mode Active</h1>
          <p>SolarizedNG is temporarily under update. Please check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-950 text-white">
      {settings.show_banner && (
        <div className="fixed top-0 left-0 w-full text-center bg-emerald-600 text-white text-xs py-1 z-50 shadow-md">
          ✅ SolarizedNG v1.0 Stable — Live Sync Active
        </div>
      )}

      {settings.system_message && (
        <div className="fixed bottom-0 left-0 w-full text-center bg-blue-700 text-white text-xs py-1 z-40 shadow-md">
          {settings.system_message}
        </div>
      )}

      <main className="pt-6 px-4">{children}</main>
    </div>
  );
}
