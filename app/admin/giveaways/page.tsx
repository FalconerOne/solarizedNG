"use client";

import { useState } from "react";
import { createClient } from "@/config/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminGiveawaysPage() {
  const supabase = createClient();
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🚀 Fetch giveaways
  async function loadGiveaways() {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("id, title, prize_name, prize_image, status, winner_id")
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load giveaways");
    else setGiveaways(data || []);
    setLoading(false);
  }

  // 🏆 Finalize a winner
  async function finalizeWinner(giveawayId: string) {
    try {
      setLoading(true);
      toast.info("Finalizing winner…");

      const { data: participant } = await supabase
        .from("participants")
        .select("id")
        .eq("giveaway_id", giveawayId)
        .limit(1)
        .single();

      if (!participant) throw new Error("No participants found");

      const response = await fetch("/api/admin/finalize-winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giveaway_id: giveawayId,
          winner_id: participant.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed");

      // 🎉 Confetti & toast
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });
      toast.success("Winner finalized successfully!");
      await loadGiveaways();
    } catch (err: any) {
      toast.error(err.message || "Error finalizing winner");
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useState(() => {
    loadGiveaways();
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎯 Admin Giveaways Management</h1>

      {loading && <p>Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {giveaways.map((g) => (
          <Card key={g.id} className="rounded-2xl shadow-md">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <img
                src={g.prize_image || "/placeholder.svg"}
                alt={g.prize_name}
                className="w-32 h-32 object-cover rounded-xl mb-3"
              />
              <h2 className="text-lg font-semibold mb-1">{g.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{g.prize_name}</p>
              <p
                className={`mb-3 font-medium ${
                  g.status === "completed" ? "text-green-600" : "text-orange-500"
                }`}
              >
                {g.status === "completed" ? "Completed" : "Active"}
              </p>

              {g.status !== "completed" && (
                <Button
                  disabled={loading}
                  onClick={() => finalizeWinner(g.id)}
                  className="w-full"
                >
                  Finalize Winner 🏆
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!giveaways.length && !loading && (
        <p className="text-gray-500 text-center">No giveaways found.</p>
      )}
    </div>
  );
}
