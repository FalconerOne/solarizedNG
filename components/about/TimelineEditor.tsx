"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TimelineEditor() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ year: "", title: "", description: "" });
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" | null }>({
    msg: "",
    type: null,
  });

  // Load milestones
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

  async function addMilestone() {
    if (!form.year || !form.title.trim()) {
      setFeedback({ msg: "Year and title are required.", type: "error" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("about_milestones").insert([
      {
        year: parseInt(form.year),
        title: form.title,
        description: form.description,
      },
    ]);

    if (!error) {
      setForm({ year: "", title: "", description: "" });
      await fetchMilestones();
      await triggerRevalidate(); // ✅ D7.3 auto-refresh
      setFeedback({ msg: "Milestone added successfully!", type: "success" });
    } else {
      console.error("Add milestone error:", error.message);
      setFeedback({ msg: "Failed to add milestone.", type: "error" });
    }
    setSaving(false);
  }

  async function deleteMilestone(id: number) {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    const { error } = await supabase.from("about_milestones").delete().eq("id", id);

    if (!error) {
      await fetchMilestones();
      await triggerRevalidate(); // ✅ D7.3 auto-refresh
      setFeedback({ msg: "Milestone deleted successfully!", type: "success" });
    } else {
      setFeedback({ msg: "Failed to delete milestone.", type: "error" });
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-md transition-all duration-300">
      <h2 className="text-2xl font-semibold mb-4">📜 Timeline / Milestones</h2>

      {/* Feedback Message */}
      {feedback.type && (
        <div
          className={`mb-4 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            feedback.type === "success"
              ? "bg-green-700 text-green-100"
              : "bg-red-700 text-red-100"
          }`}
        >
          {feedback.msg}
        </div>
      )}

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
          placeholder="Short description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <button
          onClick={addMilestone}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded font-semibold text-white transition ${
            saving
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
          {saving ? "Saving..." : "Add"}
        </button>
      </div>

      {/* Milestone List */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Loading milestones...
        </div>
      ) : milestones.length === 0 ? (
        <p className="text-gray-400">No milestones yet.</p>
      ) : (
        <ul className="space-y-3">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-800 p-4 rounded-lg hover:bg-gray-850 transition-all"
            >
              <div>
                <p className="font-semibold text-orange-400">{m.year}</p>
                <p className="text-white">{m.title}</p>
                {m.description && <p className="text-gray-400 text-sm">{m.description}</p>}
              </div>
              <button
                onClick={() => deleteMilestone(m.id)}
                className="text-red-500 hover:text-red-600 mt-2 sm:mt-0 flex items-center gap-1"
              >
                <Trash2 size={18} /> Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
