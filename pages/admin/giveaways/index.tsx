"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Plus, CheckCircle, XCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function AdminGiveawaysPage() {
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    active: true,
  });

  // Load all giveaways
  useEffect(() => {
    loadGiveaways();
  }, []);

  async function loadGiveaways() {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load giveaways");
    else setGiveaways(data || []);
    setLoading(false);
  }

  // Save (create or update)
  async function saveGiveaway() {
    if (!form.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      active: form.active,
    };

    if (form.id) {
      const { error } = await supabase.from("giveaways").update(payload).eq("id", form.id);
      if (error) return toast.error("Update failed");
      toast.success("Giveaway updated");
    } else {
      const { error } = await supabase.from("giveaways").insert([payload]);
      if (error) return toast.error("Create failed");
      toast.success("Giveaway created");
    }

    setForm({ id: null, title: "", description: "", active: true });
    await loadGiveaways();
  }

  // Edit mode
  function editGiveaway(g: any) {
    setForm({
      id: g.id,
      title: g.title,
      description: g.description,
      active: g.active,
    });
  }

  // Delete
  async function deleteGiveaway(id: number) {
    if (!confirm("Delete this giveaway?")) return;
    const { error } = await supabase.from("giveaways").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Giveaway deleted");
      setGiveaways((prev) => prev.filter((g) => g.id !== id));
    }
  }

  // Toggle active/inactive
  async function toggleActive(id: number, active: boolean) {
    const { error } = await supabase.from("giveaways").update({ active }).eq("id", id);
    if (error) toast.error("Toggle failed");
    else {
      toast.success(`Giveaway ${active ? "activated" : "deactivated"}`);
      setGiveaways((prev) =>
        prev.map((g) => (g.id === id ? { ...g, active } : g))
      );
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        🎁 Manage Giveaways
        <Button onClick={loadGiveaways} variant="outline" size="sm" className="ml-auto flex items-center gap-1">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </h1>

      {/* Form */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Giveaway Title"
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
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Active
              </label>
              <Button onClick={saveGiveaway} className="bg-orange-500 hover:bg-orange-600 text-white">
                {form.id ? "Update Giveaway" : "Create Giveaway"}
              </Button>
              {form.id && (
                <Button
                  onClick={() => setForm({ id: null, title: "", description: "", active: true })}
                  variant="outline"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="text-gray-500">Loading giveaways...</div>
      ) : giveaways.length === 0 ? (
        <div className="text-gray-500">No giveaways found.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {giveaways.map((g) => (
            <Card key={g.id} className="relative">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-1">{g.title}</h2>
                <p className="text-gray-600 text-sm mb-3">{g.description}</p>
                <div className="flex items-center gap-3">
                  <Button onClick={() => editGiveaway(g)} variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteGiveaway(g.id)}
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => toggleActive(g.id, !g.active)}
                    variant="outline"
                    size="sm"
                    className={g.active ? "text-green-600" : "text-gray-500"}
                  >
                    {g.active ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="absolute top-3 right-3 text-xs text-gray-400">
                  {g.active ? "Active" : "Inactive"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
