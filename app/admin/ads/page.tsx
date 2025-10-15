"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Ad {
  id: number;
  title: string;
  ad_code: string;
  zone: string;
  is_active: boolean;
  created_at: string;
}

export default function AdsManagerPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState({ title: "", ad_code: "", zone: "landing_bottom", is_active: true });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 🧭 Fetch all ads
  const fetchAds = async () => {
    const { data, error } = await supabase.from("adzone").select("*").order("created_at", { ascending: false });
    if (!error && data) setAds(data);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // 💾 Add or update ad
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      await supabase.from("adzone").update(form).eq("id", editingId);
      setEditingId(null);
    } else {
      await supabase.from("adzone").insert([form]);
    }

    setForm({ title: "", ad_code: "", zone: "landing_bottom", is_active: true });
    await fetchAds();
    setLoading(false);
  };

  // 🗑️ Delete ad
  const handleDelete = async (id: number) => {
    if (confirm("Delete this ad?")) {
      await supabase.from("adzone").delete().eq("id", id);
      await fetchAds();
    }
  };

  // ✏️ Edit ad
  const handleEdit = (ad: Ad) => {
    setForm({ title: ad.title, ad_code: ad.ad_code, zone: ad.zone, is_active: ad.is_active });
    setEditingId(ad.id);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.h1
        className="text-2xl font-bold text-orange-600 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Ad Manager
      </motion.h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-5 mb-8 space-y-3">
        <Input
          placeholder="Ad Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <Textarea
          placeholder="Paste Ad Code (HTML/JS)"
          rows={5}
          value={form.ad_code}
          onChange={(e) => setForm({ ...form, ad_code: e.target.value })}
          required
        />

        <div className="flex gap-4 flex-wrap items-center">
          <select
            className="border rounded-md px-3 py-2"
            value={form.zone}
            onChange={(e) => setForm({ ...form, zone: e.target.value })}
          >
            <option value="landing_bottom">Landing Bottom</option>
            <option value="profile_mid">Profile Mid</option>
            <option value="dashboard_side">Dashboard Side</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>

          <Button type="submit" disabled={loading}>
            {editingId ? "Update Ad" : "Add Ad"}
          </Button>
        </div>
      </form>

      {/* 📋 Display all ads */}
      <div className="grid md:grid-cols-2 gap-5">
        {ads.map((ad) => (
          <motion.div
            key={ad.id}
            className="border rounded-lg p-4 shadow-sm bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold text-orange-600">{ad.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{ad.zone}</p>
            <div
              className="border p-2 bg-gray-50 text-xs text-gray-600 overflow-auto h-28 rounded"
              dangerouslySetInnerHTML={{ __html: ad.ad_code }}
            />
            <div className="flex justify-between mt-3 text-sm">
              <button onClick={() => handleEdit(ad)} className="text-blue-600 hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(ad.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

