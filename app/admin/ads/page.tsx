"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCopy, FaEye } from "react-icons/fa";

interface AdZone {
  id: number;
  zone_name: string;
  ad_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export default function AdminAdManager() {
  const [ads, setAds] = useState<AdZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAd, setNewAd] = useState({ zone_name: "", ad_code: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAd, setEditingAd] = useState<AdZone | null>(null);
  const [previewAd, setPreviewAd] = useState<AdZone | null>(null);

  // 🧠 Load ads from DB
  const fetchAds = async () => {
    const { data, error } = await supabase.from("ads_zone").select("*").order("id", { ascending: false });
    if (!error && data) setAds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // ➕ Add new ad
  const addAd = async () => {
    if (!newAd.zone_name || !newAd.ad_code) return alert("Please enter zone name and ad code.");
    const { error } = await supabase.from("ads_zone").insert([newAd]);
    if (!error) {
      setNewAd({ zone_name: "", ad_code: "" });
      fetchAds();
    }
  };

  // ✏️ Edit ad
  const saveEdit = async () => {
    if (!editingAd) return;
    const { error } = await supabase
      .from("ads_zone")
      .update({ zone_name: editingAd.zone_name, ad_code: editingAd.ad_code })
      .eq("id", editingAd.id);
    if (!error) {
      setEditingAd(null);
      fetchAds();
    }
  };

  // 🗑 Delete ad
  const deleteAd = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    const { error } = await supabase.from("ads_zone").delete().eq("id", id);
    if (!error) fetchAds();
  };

  // 🔁 Toggle active/inactive
  const toggleAd = async (id: number, currentState: boolean) => {
    const { error } = await supabase.from("ads_zone").update({ is_active: !currentState }).eq("id", id);
    if (!error) fetchAds();
  };

  // 📋 Copy ad code
  const copyAdCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Ad code copied!");
  };

  // 🔍 Filtered ads
  const filteredAds = ads.filter((ad) =>
    ad.zone_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading ads...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <motion.h1
        className="text-3xl font-bold text-orange-600"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🪧 Ad Manager
      </motion.h1>

      {/* ADD NEW AD FORM */}
      <motion.div
        className="bg-white shadow-lg rounded-2xl p-6 border border-orange-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Ad Zone</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Ad Zone Name (e.g., Profile Midsection)"
            value={newAd.zone_name}
            onChange={(e) => setNewAd({ ...newAd, zone_name: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="text"
            placeholder="Ad Embed Code or Script"
            value={newAd.ad_code}
            onChange={(e) => setNewAd({ ...newAd, ad_code: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <button
          onClick={addAd}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition-all"
        >
          Add Ad Zone
        </button>
      </motion.div>

      {/* SEARCH BAR */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search Ad Zones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-64 focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* AD TABLE */}
      <motion.table
        className="w-full border border-orange-100 rounded-xl overflow-hidden shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <thead className="bg-orange-100 text-orange-700">
          <tr>
            <th className="p-3 text-left">Zone</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAds.map((ad) => (
            <tr key={ad.id} className="border-b hover:bg-orange-50">
              <td className="p-3 font-medium text-gray-700">
                {editingAd?.id === ad.id ? (
                  <input
                    value={editingAd.zone_name}
                    onChange={(e) =>
                      setEditingAd({ ...editingAd, zone_name: e.target.value })
                    }
                    className="border rounded-lg p-1"
                  />
                ) : (
                  ad.zone_name
                )}
              </td>
              <td className="p-3">
                <button
                  onClick={() => toggleAd(ad.id, ad.is_active)}
                  className="text-orange-600 hover:scale-110 transition-transform"
                >
                  {ad.is_active ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
                </button>
              </td>
              <td className="p-3 flex gap-3">
                {editingAd?.id === ad.id ? (
                  <button
                    onClick={saveEdit}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingAd(ad)}
                    className="text-blue-600 hover:scale-110 transition-transform"
                  >
                    <FaEdit />
                  </button>
                )}
                <button
                  onClick={() => copyAdCode(ad.ad_code)}
                  className="text-gray-600 hover:scale-110 transition-transform"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={() => setPreviewAd(ad)}
                  className="text-orange-500 hover:scale-110 transition-transform"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => deleteAd(ad.id)}
                  className="text-red-600 hover:scale-110 transition-transform"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </motion.table>

      {/* PREVIEW MODAL */}
      {previewAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full relative">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Preview: {previewAd.zone_name}
            </h2>
            <div
              className="border border-gray-200 rounded-lg p-4"
              dangerouslySetInnerHTML={{ __html: previewAd.ad_code }}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setPreviewAd(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
