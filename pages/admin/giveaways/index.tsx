"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PlusCircle, Edit, Trash2, Gift } from "lucide-react";

export default function GiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchGiveaways();
  }, []);

  async function fetchGiveaways() {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setGiveaways(data);
    setLoading(false);
  }

  async function saveGiveaway() {
    const payload = {
      title: form.title,
      description: form.description,
      start_date: form.start_date,
      end_date: form.end_date,
    };

    if (editing) {
      await supabase.from("giveaways").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("giveaways").insert([payload]);
    }

    setShowModal(false);
    setEditing(null);
    setForm({ title: "", description: "", start_date: "", end_date: "" });
    fetchGiveaways();
  }

  async function deleteGiveaway(id: number) {
    if (!confirm("Are you sure you want to delete this giveaway?")) return;
    await supabase.from("giveaways").delete().eq("id", id);
    fetchGiveaways();
  }

  function openModal(giveaway?: any) {
    if (giveaway) {
      setEditing(giveaway);
      setForm({
        title: giveaway.title,
        description: giveaway.description,
        start_date: giveaway.start_date,
        end_date: giveaway.end_date,
      });
    } else {
      setEditing(null);
      setForm({ title: "", description: "", start_date: "", end_date: "" });
    }
    setShowModal(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          🎉 Giveaways Management
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Giveaway
        </button>
      </div>

      {loading ? (
        <p>Loading giveaways...</p>
      ) : giveaways.length === 0 ? (
        <p className="text-gray-500">No giveaways yet. Create one to begin.</p>
      ) : (
        <div className="grid gap-4">
          {giveaways.map((g) => (
            <div
              key={g.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-start"
            >
              <div>
                <h2 className="text-lg font-medium text-gray-800">{g.title}</h2>
                <p className="text-gray-500 text-sm mb-2">{g.description}</p>
                <p className="text-xs text-gray-400">
                  {new Date(g.start_date).toLocaleDateString()} →{" "}
                  {new Date(g.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(g)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  title="Edit"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteGiveaway(g.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    (window.location.href = `/admin/prizes?giveaway_id=${g.id}`)
                  }
                  className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                  title="View Prizes"
                >
                  <Gift className="w-5 h-5" />
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
              {editing ? "Edit Giveaway" : "Add Giveaway"}
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
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mb-3 border px-3 py-2 rounded-lg"
            />
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                className="flex-1 border px-3 py-2 rounded-lg"
              />
              <input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
                className="flex-1 border px-3 py-2 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveGiveaway}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
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
