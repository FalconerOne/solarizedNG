"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminTestPanel() {
  const [settings, setSettings] = useState({
    show_banner: false,
    maintenance_mode: false,
    system_message: "",
  });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadSettings = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("key, value, value_text");
    if (data) {
      const mapped: any = {};
      data.forEach((s) => {
        mapped[s.key] = s.value ?? s.value_text;
      });
      setSettings({
        show_banner: mapped.show_banner ?? false,
        maintenance_mode: mapped.maintenance_mode ?? false,
        system_message: mapped.system_message ?? "",
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const toggleSetting = async (key: string) => {
    const newValue = !settings[key as keyof typeof settings];
    setSettings({ ...settings, [key]: newValue });
    await supabase.from("app_settings").update({ value: newValue }).eq("key", key);
  };

  const updateMessage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setSettings({ ...settings, system_message: newMessage });
    await supabase
      .from("app_settings")
      .update({ value_text: newMessage })
      .eq("key", "system_message");
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-lg space-y-6">
      <h2 className="text-xl font-semibold">Admin Test Panel</h2>

      {/* Toggle switches */}
      <div className="space-y-4">
        <ToggleRow
          label="Show Live Sync Banner"
          active={settings.show_banner}
          onClick={() => toggleSetting("show_banner")}
        />
        <ToggleRow
          label="Maintenance Mode"
          active={settings.maintenance_mode}
          onClick={() => toggleSetting("maintenance_mode")}
        />
      </div>

      {/* Message field */}
      <div className="mt-4">
        <label className="block text-sm text-gray-400 mb-1">System Message</label>
        <input
          type="text"
          value={settings.system_message}
          onChange={updateMessage}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Enter system-wide message"
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-700 pt-3">
      <span>{label}</span>
      <button
        onClick={onClick}
        className={`px-4 py-1 rounded-lg text-sm font-semibold transition ${
          active ? "bg-emerald-600" : "bg-gray-700"
        }`}
      >
        {active ? "ON" : "OFF"}
      </button>
    </div>
  );
}
