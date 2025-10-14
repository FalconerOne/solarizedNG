"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, Trash2, Upload } from "lucide-react";

interface Prize {
  id: string;
  giveaway_id: string;
  name: string;
  description: string;
  image_url?: string;
  created_at?: string;
}

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [giveaways, setGiveaways] = useState<{ id: string; title: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Prize | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

  const [form, setForm] = useState({
    giveaway_id: "",
    name: "",
    description: "",
    imageFile: null as File | null,
  });

  useEffect(() => {
    fetchPrizes();
    fetchGiveaways();
  }, []);

  async function fetchPrizes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("prizes")
      .select("*, giveaways(title)")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setPrizes(data || []);
    setLoading(false);
  }

  async function fetchGiveaways() {
    const { data } = await supabase.from("giveaways").select("id, title");
    setGiveaways(data || []);
  }

  function showToast(message: string, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAddModal() {
    setEditing(null);
    setForm({ giveaway_id: "", name: "", description: "", imageFile: null });
    setShowModal(true);
  }

  function openEditModal(prize: Prize) {
    setEditing(prize);
    setForm({
      giveaway_id: prize.giveaway_id,
      name: prize.name,
      description: prize.description,
      imageFile: null,
    });
    setShowModal(true);
  }

  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("prize-images")
      .upload(fileName, file);
    if (uploadError) {
      console.error(uploadError);
      showToast("Image upload failed", "error");
      return null;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("prize-images").getPublicUrl(fileName);
    return publicUrl;
  }

  async function savePrize() {
    const { giveaway_id, name, description, imageFile } = form;
    if (!giveaway_id || !name) {
      showToast("Giveaway and name are required", "error");
      return;
    }

    let imageUrl = editing?.image_url || null;
    if (imageFile) {
      const uploaded = await uploadImage(imageFile);
      if (uploaded) imageUrl = uploaded;
    }

    if (editing) {
      const { error } = await supabase
        .from("prizes")
        .update({ giveaway_id, name, description, image_url: imageUrl })
        .eq("id", editing.id);
      if (error) {
        console.error(error);
        showToast("Error updating prize", "error");
      } else {
        showToast("Prize updated successfully!");
        setShowModal(false);
        fetchPrizes();
      }
    } else {
      const { error } = await supabase
        .from("prizes")
        .insert([{ giveaway_id, name, description, image_url: imageUrl }]);
      if (error) {
        console.error(error);
        showToast("Error creating prize", "error");
      } else {
        showToast("Prize added successfully!");
        setShowModal(false);
        fetchPrizes();
      }
    }
  }

  async function deletePrize(id: string) {
    if (!confirm("Are you sure you want to delete this prize?")) return;
    const { error } = await supabase.from("prizes").delete().eq("id", id);
    if (error) {
      console.error(error);
      showToast("Failed to delete prize", "error");
    } else {
      showToast("Prize deleted!");
      fetchPrizes();
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Prizes</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow"
        >
          <Plus size={18} /> Add Prize
        </button>
      </div>

      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white shadow-md transition ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading prizes...</div>
      ) : prizes.length === 0 ? (
        <div className="text-gray-500">No prizes found.</div>
      ) : (
        <div className="grid gap-4">
          {prizes.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-white shadow rounded-xl border flex justify-between items-start hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {p.name}
                  </h2>
                  <p className="text-gray-600 text-sm">{p.description}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    🎯 {p.giveaways?.title || "Unlinked Giveaway"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => deletePrize(p.id)}
                  className="p-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editing ? "Edit Prize" : "Add Prize"}
            </h2>
            <div className="space-y-3">
              <select
                value={form.giveaway_id}
                onChange={(e) =>
                  setForm({ ...form, giveaway_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select Giveaway</option>
                {giveaways.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Prize name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-400"
              />

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                />
                {form.imageFile
                  ? form.imageFile.name
                  : "Upload prize image (optional)"}
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={savePrize}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                {editing ? "Save Changes" : "Add Prize"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
