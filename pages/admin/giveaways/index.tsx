"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Giveaway {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at?: string;
}

export default function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Giveaway | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

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
    if (error) console.error(error);
    else setGiveaways(data || []);
    setLoading(false);
  }

  function showToast(message: string, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAddModal() {
    setEditing(null);
    setForm({ title: "", description: "", start_date: "", end_date: "" });
    setShowModal(true);
  }

  function openEditModal(giveaway: Giveaway) {
    setEditing(giveaway);
    setForm({
      title: giveaway.title,
      description: giveaway.description,
      start_date: giveaway.start_date?.split("T")[0] || "",
      end_date: giveaway.end_date?.split("T")[0] || "",
    });
    setShowModal(true);
  }

  async function saveGiveaway() {
    const { title, description, start_date, end_date } = form;
    if (!title || !description) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("giveaways")
        .update({ title, description, start_date, end_date })
        .eq("id", editing.id);
      if (error) {
        console.error(error);
        showToast("Error updating giveaway", "error");
      } else {
        showToast("Giveaway updated successfully!");
        setShowModal(false);
        fetchGiveaways();
      }
    } else {
      const { error } = await supabase
        .from("giveaways")
        .insert([{ title, description, start_date, end_date }]);
      if (error) {
        console.error(error);
        showToast("Error creating giveaway", "error");
      } else {
        showToast("Giveaway added successfully!");
        setShowModal(false);
        fetchGiveaways();
      }
    }
  }

  async function deleteGiveaway(id: string) {
    if (!confirm("Are you sure you want to delete this giveaway?")) return;
    const { error } = await supabase.from("giveaways").delete().eq("id", id);
    if (error) {
      console.error(error);
      showToast("Failed to delete giveaway", "error");
    } else {
      showToast("Giveaway deleted!");
      fetchGiveaways();
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Giveaways</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow"
        >
          <Plus size={18} /> Add Giveaway
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
        <div className="text-gray-500">Loading giveaways...</div>
      ) : giveaways.length === 0 ? (
        <div className="text-gray-500">No giveaways found.</div>
      ) : (
        <div className="grid gap-4">
          {giveaways.map((g) => (
            <div
              key={g.id}
              className="p-4 bg-white shadow rounded-xl border flex justify-between items-start hover:shadow-md transition"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {g.title}
                </h2>
                <p className="text-gray-600 mt-1">{g.description}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {g.start_date
                    ? `📅 ${new Date(g.start_date).toLocaleDateString()} - ${new Date(
                        g.end_date
                      ).toLocaleDateString()}`
                    : "No date range"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => openEditModal(g)}
                  className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => deleteGiveaway(g.id)}
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
              {editing ? "Edit Giveaway" : "Add Giveaway"}
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              <div className="flex gap-2">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  className="w-1/2 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  className="w-1/2 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveGiveaway}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                {editing ? "Save Changes" : "Add Giveaway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
