"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

interface Ad {
  id: string;
  zone_name: string;
  ad_code: string;
  is_active: boolean;
  created_at: string;
}

export default function AdManagerPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAd, setNewAd] = useState({ zone_name: "", ad_code: "" });

  // 🟠 Fetch all ads
  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from("ad_zones")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setAds(data);
      setLoading(false);
    };
    fetchAds();
  }, []);

  // ➕ Add new ad
  const handleAddAd = async () => {
    if (!newAd.zone_name.trim() || !newAd.ad_code.trim()) return alert("Please fill all fields");

    const { error } = await supabase
      .from("ad_zones")
      .insert([{ zone_name: newAd.zone_name, ad_code: newAd.ad_code, is_active: true }]);

    if (error) {
      alert("Failed to add ad");
    } else {
      setNewAd({ zone_name: "", ad_code: "" });
      location.reload();
    }
  };

  // 🔄 Toggle ad status
  const toggleAdStatus = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("ad_zones")
      .update({ is_active: !current })
      .eq("id", id);

    if (!error) {
      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, is_active: !current } : ad))
      );
    }
  };

  // 🗑 Delete ad
  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    const { error } = await supabase.from("ad_zones").delete().eq("id", id);
    if (!error) setAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  if (loading)
    return <div className="p-6 text-gray-500">Loading ads...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.h1
        className="text-2xl font-bold mb-6 text-orange-600"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Ad Manager
      </motion.h1>

      {/* ➕ Add New Ad Form */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 border border-orange-100">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Add New Ad</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Zone Name"
            value={newAd.zone_name}
            onChange={(e) => setNewAd({ ...newAd, zone_name: e.target.value })}
            className="border border-gray-300 p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Ad Code (HTML/JS)"
            value={newAd.ad_code}
            onChange={(e) => setNewAd({ ...newAd, ad_code: e.target.value })}
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            onClick={handleAddAd}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Add Ad
          </button>
        </div>
      </div>

      {/* 📋 Ad Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg border border-orange-100">
        <table className="w-full text-left">
          <thead className="bg-orange-50 text-orange-800">
            <tr>
              <th className="p-3">Zone</th>
              <th className="p-3">Created</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr
                key={ad.id}
                className="border-t border-gray-100 hover:bg-orange-50 transition"
              >
                <td className="p-3">{ad.zone_name}</td>
                <td className="p-3 text-sm text-gray-500">
                  {new Date(ad.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      ad.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {ad.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => deleteAd(ad.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ads.length === 0 && (
          <p className="p-4 text-center text-gray-500">
            No ads yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}
