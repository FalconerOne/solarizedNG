"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Trophy, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize_image: string | null;
  status: "active" | "ended";
  winner_id: string | null;
  winner_name?: string;
}

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetchGiveaways();

    // Subscribe to real-time changes for winner finalization
    const channel = supabase
      .channel("giveaway_winner_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "giveaways",
        },
        (payload) => {
          const updated = payload.new as Giveaway;
          setGiveaways((prev) =>
            prev.map((g) => (g.id === updated.id ? updated : g))
          );

          if (updated.winner_id) {
            launchConfetti();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchGiveaways() {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("id, title, description, prize_image, status, winner_id")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching giveaways:", error);
    else setGiveaways(data || []);
    setLoading(false);
  }

  async function finalizeWinner(giveawayId: string) {
    const { data: participants, error } = await supabase
      .from("participants")
      .select("id, user_name")
      .eq("giveaway_id", giveawayId);

    if (error || !participants?.length) {
      alert("No participants found for this giveaway.");
      return;
    }

    const winner =
      participants[Math.floor(Math.random() * participants.length)];

    const { error: updateError } = await supabase
      .from("giveaways")
      .update({
        winner_id: winner.id,
        status: "ended",
      })
      .eq("id", giveawayId);

    if (updateError) {
      alert("Error finalizing winner.");
      console.error(updateError);
    } else {
      alert(`Winner finalized: ${winner.user_name}`);
      launchConfetti();
      triggerGlobalCelebration(giveawayId, winner.user_name);
      fetchGiveaways();
    }
  }

  function launchConfetti() {
    if (confettiRef.current) {
      const canvas = confettiRef.current;
      const myConfetti = confetti.create(canvas, { resize: true });
      myConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    } else {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  }

  async function triggerGlobalCelebration(giveawayId: string, winnerName: string) {
    await supabase.from("notifications").insert([
      {
        type: "winner_announcement",
        title: "🎉 Giveaway Winner Finalized!",
        message: `The giveaway "${giveawayId}" now has a winner: ${winnerName}`,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  return (
    <div className="p-6">
      <canvas
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999 }}
      />
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="text-yellow-500" /> Manage Giveaways
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : giveaways.length === 0 ? (
        <p>No giveaways found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {giveaways.map((g) => (
            <Card key={g.id} className="shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {g.title}
                  {g.status === "ended" && (
                    <Sparkles className="text-yellow-400" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{g.description}</p>
                {g.prize_image && (
                  <img
                    src={g.prize_image}
                    alt="Prize"
                    className="rounded-xl w-full h-40 object-cover mb-3"
                  />
                )}
                {g.status === "ended" && g.winner_id ? (
                  <div className="bg-green-100 text-green-800 p-3 rounded-xl">
                    🎉 Winner Finalized
                  </div>
                ) : (
                  <Button
                    onClick={() => finalizeWinner(g.id)}
                    className="w-full mt-2"
                  >
                    Finalize Winner
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
