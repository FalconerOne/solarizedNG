// components/about/TimelineEditor.tsx
"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TimelineEditor() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ year: "", title: "", description: "" });

  useEffect(() => {
    fetchMilestones();
  }, []);

  async function fetchMilestones() {
    setLoading(true);
    const { data, error } = await supabase
      .from("about_milestones")
      .select("*")
      .order("year", { ascending: true });
    if (!error) setMilestones(data || []);
    setLoading(false);
  }

  async function addMilestone() {
    if (!form.year || !form.title) return;
    const { error } = await supabase.from("about_milestones").insert([
      {
        year: parseInt(form.year),
        title: form.title,
        description: form.description,
      },
    ]);
    if (!error) {
      setForm({ year: "", title: "", description: "" });
      fetchMilestones();
    } else {
      console.error("Insert error:", error.message);
    }
  }

  async function deleteMilestone(id: number) {
    const { error } = await supabase.from("about_milestones").delete().eq("id", id);
    if (!error) fetchMilestones();
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">📜 Timeline / Milestones</h2>

      {/* Add Form */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <button
          onClick={addMilestone}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white font-semibold transition"
        >
          <PlusCircle size={18} /> Add
        </button>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Loading timeline...
        </div>
      ) : milestones.length === 0 ? (
        <p className="text-gray-400">No milestones added yet.</p>
      ) : (
        <ul className="space-y-3">
          {milestones.map((ms) => (
            <li
              key={ms.id}
              className="flex items-start justify-between bg-gray-800 p-4 rounded-lg"
            >
              <div>
                <p className="font-semibold text-orange-400">{ms.year}</p>
                <p className="text-lg">{ms.title}</p>
                <p className="text-sm text-gray-400">{ms.description}</p>
              </div>
              <button
                onClick={() => deleteMilestone(ms.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
