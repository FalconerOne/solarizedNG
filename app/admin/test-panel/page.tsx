"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminTestPanel() {
  const [showBanner, setShowBanner] = useState(false);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadSetting = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "show_banner")
        .single();
      if (data) setShowBanner(data.value);
    };
    loadSetting();
  }, []);

  const toggleBanner = async () => {
    const newValue = !showBanner;
    setShowBanner(newValue);
    await supabase
      .from("app_settings")
      .update({ value: newValue })
      .eq("key", "show_banner");
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Admin Test Panel</h2>

      <div className="flex items-center justify-between border-t border-gray-700 pt-4">
        <span>Show “Live Sync” Banner</span>
        <button
          onClick={toggleBanner}
          className={`px-4 py-1 rounded-lg text-sm font-semibold transition ${
            showBanner ? "bg-emerald-600" : "bg-gray-700"
          }`}
        >
          {showBanner ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
