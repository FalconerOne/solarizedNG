"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, UserPlus, Trash2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeamEditor() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", role: "", image_url: "" });

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    setLoading(true);
    const { data, error } = await supabase
      .from("about_team")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setTeam(data || []);
    setLoading(false);
  }

  async function triggerRevalidate() {
    try {
      await fetch("/api/revalidate-about", {
        method: "POST",
        headers: {
          "x-revalidate-secret":
            process.env.NEXT_PUBLIC_REVALIDATE_SECRET || "solarizedng_about_refresh",
        },
      });
    } catch (err) {
      console.warn("Revalidate trigger failed:", err);
    }
  }

  async function addMember() {
    if (!form.name || !form.role) return;
    const { error } = await supabase.from("about_team").insert([form]);
    if (!error) {
      setForm({ name: "", role: "", image_url: "" });
      await fetchTeam();
      await triggerRevalidate(); // ✅ D7.3 auto-refresh About page
    } else {
      console.error("Insert error:", error.message);
    }
  }

  async function deleteMember(id: number) {
    const { error } = await supabase.from("about_team").delete().eq("id", id);
    if (!error) {
      await fetchTeam();
      await triggerRevalidate(); // ✅ D7.3 auto-refresh About page
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">👥 Team Members</h2>

      {/* Add Form */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="text"
          placeholder="Role / Position"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={form.image_url}
