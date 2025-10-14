"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({
    show_banner: false,
    maintenance_mode: false,
    system_message: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadUserAndSettings() {
      // Fetch settings
      const { data: settingsData } = await supabase
        .from("app_settings")
        .select("key, value, value_text");
      if (settingsData) {
        const mapped: any = {};
        settingsData.forEach((s) => {
          mapped[s.key] = s.value ?? s.value_text;
        });
        setSettings({
          show_banner: mapped.show_banner ?? false,
          maintenance_mode: mapped.maintenance_mode ?? false,
          system_message: mapped.system_message ?? "",
        });
      }

      // Fetch current user and check role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile && profile.role === "admin") setIsAdmin(true);
      }

      setLoading(false);
    }

    loadUserAndSettings
