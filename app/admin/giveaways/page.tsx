"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Trophy, Users, PartyPopper } from "lucide-react";

type Giveaway = {
  id: string;
  title: string;
  description: string;
  prize: string;
  created_at: string;
  winner_id?: string | null;
  winner_name?: string | null;
};

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);

  // 🎯 Load giveaways
  const fetchGiveaways = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("id, title, description, prize, created_at, winner_id, winner_name")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching giveaways:", error);
    else setGiveaways(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchGiveaways();

    // 🔁 Realtime updates
    const channel = supabase
      .channel("admin_giveaways_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "giveaways" },
        () => fetchGiveaways()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchGiveaways]);

  // 🎉 Canvas Confetti Celebration
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const canvas = document.createElement("canvas");
    canvas.id = "confettiCanvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9999";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const particles: any[] = [];
    const colors = ["#FFC107", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 2,
        speed: Math.random() * 4 + 1,
      });
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.speed;
        if (p.y > canvas.height) p.y = -10;
      });
      requestAnimationFrame(draw);
    }
    draw();

    setTimeout(() => {
      document.body.removeChild(canvas);
    }, duration);
  };

  // 🏆 Finalize winner
  const finalizeWinner = async (giveawayId: string) => {
    setFinalizing(giveawayId);
    const { data: participants } = await supabase
      .from("participants")
      .select("id, name")
      .eq("giveaway_id", giveawayId)
      .limit(60);

    if (!participants || participants.length === 0) {
      alert("No participants found for this giveaway!");
      setFinalizing(null);
      return;
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];

    const { error } = await supabase
      .from("giveaways")
      .update({ winner_id: winner.id, winner_name: winner.name })
      .eq("id", giveawayId);

    if (error) {
      console.error("Error finalizing winner:", error);
      alert("An error occurred while finalizing winner.");
    } else {
      triggerConfetti();
      alert(`🎉 Winner finalized: ${winner.name}`);
    }

    setFinalizing(null);
  };

  // 🧩 Render
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Trophy className="text-yellow-500" /> Admin Giveaways
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin mr-2" /> Loading Giveaways...
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {giveaways.map((g) => (
            <Card key={g.id} className="shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{g.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{g.description}</p>
                <p className="text-sm">
                  🎁 <strong>Prize:</strong> {g.prize}
                </p>
                <p className="text-sm">
                  📅 <strong>Created:</strong> {new Date(g.created_at).toLocaleDateString()}
                </p>

                {g.winner_id ? (
                  <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center font-medium">
                    <PartyPopper className="inline-block mr-1" />
                    Winner: {g.winner_name || "Hidden"}
                  </div>
                ) : (
                  <Button
                    onClick={() => finalizeWinner(g.id)}
                    disabled={!!finalizing}
                    className="w-full flex items-center gap-2"
                  >
                    {finalizing === g.id ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" /> Finalizing...
                      </>
                    ) : (
                      <>
                        <Trophy className="h-4 w-4" /> Finalize Winner
                      </>
                    )}
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
