"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import PrizeMediaUpload from "@/components/admin/PrizeMediaUpload";
import { logAdminActivity } from "@/lib/logAdminActivity";
import { motion } from "framer-motion";

export default function AdminGiveawaysPage() {
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    prize: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function fetchGiveaways() {
    const { data, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setGiveaways(data || []);
  }

  useEffect(() => {
    fetchGiveaways();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = { ...form };

    if (editingId) {
      const { error } = await supabase
        .from("giveaways")
        .update(payload)
        .eq("id", editingId);
      if (error) toast.error("Error updating giveaway");
      else {
        await logAdminActivity("update_giveaway", `Updated giveaway: ${form.title}`);
        toast.success("Giveaway updated!");
      }
    } else {
      const { error } = await supabase.from("giveaways").insert([payload]);
      if (error) toast.error("Error creating giveaway");
      else {
        await logAdminActivity("create_giveaway", `Created new giveaway: ${form.title}`);
        toast.success("Giveaway created!");
      }
    }

    setForm({ title: "", description: "", prize: "", start_date: "", end_date: "" });
    setEditingId(null);
    setLoading(false);
    fetchGiveaways();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this giveaway?")) return;
    const { error } = await supabase.from("giveaways").delete().eq("id", id);
    if (error) toast.error("Error deleting giveaway");
    else {
      await logAdminActivity("delete_giveaway", `Deleted giveaway ID: ${id}`);
      toast.success("Giveaway deleted");
      fetchGiveaways();
    }
  }

  function startEdit(g: any) {
    setForm({
      title: g.title,
      description: g.description,
      prize: g.prize,
      start_date: g.start_date,
      end_date: g.end_date,
    });
    setEditingId(g.id);
  }

  // ✅ NEW — Trigger backend announcement + notifications
  async function announceWinner(giveawayId: string, winnerId: string, adminId: string) {
    if (!winnerId) {
      toast.error("No winner selected yet for this giveaway.");
      return;
    }

    try {
      const res = await fetch("/api/admin/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giveawayId, winnerId, adminId }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to announce winner");
        return;
      }

      await logAdminActivity("announce_winner", `Announced winner for giveaway ID: ${giveawayId}`);
      toast.success("🎉 Winner announced! Notifications sent to all activated users.");
      fetchGiveaways();
    } catch (err) {
      console.error("announceWinner error:", err);
      toast.error("Something went wrong while announcing the winner.");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🎁 Manage Giveaways</h1>

      <Card className="mb-8 p-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Giveaway Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder="Prize Name"
            value={form.prize}
            onChange={(e) => setForm({ ...form, prize: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="md:col-span-2"
          />
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />

          <Button type="submit" className="md:col-span-2" disabled={loading}>
            {editingId ? "Update Giveaway" : "Create Giveaway"}
          </Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {giveaways.map((g) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gray-200 p-4 shadow-md bg-white"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{g.title}</h2>
                <p className="text-sm text-gray-600">{g.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(g.start_date).toLocaleDateString()} →{" "}
                  {new Date(g.end_date).toLocaleDateString()}
                </p>
                {g.winner_id && (
                  <p className="text-green-600 text-sm mt-1">
                    🏆 Winner selected: <strong>{g.winner_id}</strong>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => startEdit(g)} variant="secondary">
                  Edit
                </Button>
                <Button onClick={() => handleDelete(g.id)} variant="destructive">
                  Delete
                </Button>

                {/* ✅ New Winner Announce button */}
                {g.winner_id && (
                  <Button
                    onClick={() => announceWinner(g.id, g.winner_id, "admin-system")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Announce Winner
                  </Button>
                )}
              </div>
            </div>

            {g.media_url && (
              <div className="mt-3">
                <PrizeMediaUpload giveawayId={g.id} onUploaded={fetchGiveaways} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
