// components/about/TeamEditor.tsx
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

  async function addMember() {
    if (!form.name || !form.role) return;
    const { error } = await supabase.from("about_team").insert([form]);
    if (!error) {
      setForm({ name: "", role: "", image_url: "" });
      fetchTeam();
    } else {
      console.error("Insert error:", error.message);
    }
  }

  async function deleteMember(id: number) {
    const { error } = await supabase.from("about_team").delete().eq("id", id);
    if (!error) fetchTeam();
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
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <button
          onClick={addMember}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white font-semibold transition"
        >
          <UserPlus size={18} /> Add
        </button>
      </div>

      {/* Team List */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Loading team...
        </div>
      ) : team.length === 0 ? (
        <p className="text-gray-400">No team members added yet.</p>
      ) : (
        <ul className="space-y-3">
          {team.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {member.image_url && (
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-gray-400">{member.role}</p>
                </div>
              </div>
              <button
                onClick={() => deleteMember(member.id)}
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
