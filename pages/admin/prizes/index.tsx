"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams } from "next/navigation";
import { PlusCircle, Edit, Trash2, ArrowLeft } from "lucide-react";

export default function PrizesPage() {
  const supabase = createClientComponentClient();
  const params = useSearchParams();
  const giveaway_id = params.get("giveaway_id");

  const [prizes, setPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    value: "",
  });

  useEffect(() => {
    if (giveaway_id) fetchPrizes();
  }, [giveaway_id]);

  async function fetchPrizes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("prizes")
      .select("*")
      .eq("giveaway_id", giveaway_id)
      .order("created_at", { ascending: false });
    if (!error && data) setPrizes(data);
    setLoading(false);
  }

  async function savePrize() {
    const payload = {
      giveaway_id,
      title: form.title,
      description: form.description,
      image_url: form.image_url,
      value: form.value ? parseFloat(form.value) : null,
    };

    if (editing) {
      await supabase.from("prizes").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("prizes").insert([payload]);
    }

    setShowModal(false);
    setEditing(null);
    setForm({ title: "", description: "", image_url: "", value: "" });
    fetchPrizes();
  }

  async function deletePrize(id: number) {
    if (!confirm("Are you sure you want to delete this prize?")) return;
    await supabase.from("prizes").delete().eq("id", id);
    fetchPrizes();
  }

  function openModal(prize?: any) {
    if (prize) {
      setEditing(prize);
      setForm({
        title: prize.title,
        description: prize.description,
        image_url: prize.image_url || "",
        value: prize.value || "",
      });
    } else {
      setEditing(null);
      setForm({ title: "", description: "", image_url: "", value: "" });
    }
    setShowModal(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.href = "/admin/giveaways")}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            🎁 Prizes Management
          </h1>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Prize
        </button>
      </div>

      {loading ? (
        <p>Loading prizes...</p>
      ) : prizes.length === 0 ? (
        <p className="text-gray-500">No prizes yet for this giveaway.</p>
      ) : (
        <div className="grid gap-4">
          {prizes.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-start"
            >
              <div className="flex gap-4 items-center">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    🏆
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-medium text-gray-800">
                    {p.title}
                  </h2>
                  <p className="text-gray-500 text-sm mb-2">{p.description}</p>
                  {p.value && (
                    <p className="text-xs text-gray-400">Value: ${p.value}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(p)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  title="Edit"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deletePrize(p.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? "Edit Prize" : "Add Prize"}
            </h2>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mb-3 border px-3 py-2 rounded-lg"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full mb-3 border px-3 py-2 rounded-lg"
            />
            <input
              type="url"
              placeholder="Image URL"
              value={form.image_url}
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value })
              }
              className="w-full mb-3 border px-3 py-2 rounded-lg"
            />
            <input
              type="number"
              placeholder="Value (optional)"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full mb-3 border px-3 py-2 rounded-lg"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={savePrize}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
