"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Edit, RefreshCcw } from "lucide-react";

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState<any[]>([]);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: null,
    giveaway_id: "",
    title: "",
    description: "",
    value: "",
    rank: 1,
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: prizesData }, { data: giveawaysData }] = await Promise.all([
      supabase.from("prizes").select("*").order("rank", { ascending: true }),
      supabase.from("giveaways").select("id, title").order("title"),
    ]);
    setPrizes(prizesData || []);
    setGiveaways(giveawaysData || []);
    setLoading(false);
  }

  async function savePrize() {
    if (!form.title.trim() || !form.giveaway_id) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      giveaway_id: form.giveaway_id,
      title: form.title.trim(),
      description: form.description.trim(),
      value: form.value.trim(),
      rank: form.rank,
      active: form.active,
    };

    if (form.id) {
      const { error } = await supabase.from("prizes").update(payload).eq("id", form.id);
      if (error) return toast.error("Update failed");
      toast.success("Prize updated");
    } else {
      const { error } = await supabase.from("prizes").insert([payload]);
      if (error) return toast.error("Create failed");
      toast.success("Prize added");
    }

    setForm({
      id: null,
      giveaway_id: "",
      title: "",
      description: "",
      value: "",
      rank: 1,
      active: true,
    });
    await loadData();
  }

  function editPrize(p: any) {
    setForm({ ...p });
  }

  async function deletePrize(id: number) {
    if (!confirm("Delete this prize?")) return;
    const { error } = await supabase.from("prizes").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Prize deleted");
      setPrizes((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        🏆 Manage Prizes
        <Button onClick={loadData} variant="outline" size="sm" className="ml-auto flex items-center gap-1">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </h1>

      {/* Form */}
      <Card className="mb-6">
        <CardContent className="p-4 grid gap-3">
          <select
            value={form.giveaway_id}
            onChange={(e) => setForm({ ...form, giveaway_id: e.target.value })}
            className="border rounded-lg px-3 py-2"
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
            placeholder="Prize Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Value (e.g. ₦50,000 or iPhone 15)"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="number"
            placeholder="Rank (1 for 1st Prize)"
            value={form.rank}
            onChange={(e) => setForm({ ...form, rank: parseInt(e.target.value) })}
            className="border rounded-lg px-3 py-2 w-32"
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>

            <Button onClick={savePrize} className="bg-orange-500 hover:bg-orange-600 text-white">
              {form.id ? "Update Prize" : "Add Prize"}
            </Button>
            {form.id && (
              <Button
                onClick={() =>
                  setForm({ id: null, giveaway_id: "", title: "", description: "", value: "", rank: 1, active: true })
                }
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="text-gray-500">Loading prizes...</div>
      ) : prizes.length === 0 ? (
        <div className="text-gray-500">No prizes found.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {prizes.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-1">
                  {p.rank}. {p.title}
                </h2>
                <p className="text-gray-600 text-sm mb-2">{p.description}</p>
                <p className="text-gray-800 font-medium mb-3">{p.value}</p>
                <div className="flex gap-2">
                  <Button onClick={() => editPrize(p)} variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deletePrize(p.id)}
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
