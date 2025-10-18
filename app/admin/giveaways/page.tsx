"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SkillLinkBanner } from "@/components/SkillLinkBanner";
import { useUser } from "@supabase/auth-helpers-react";

type Giveaway = Database["public"]["Tables"]["giveaways"]["Row"];

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient<Database>();
  const { user } = useUser();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);

  // 🌈 Confetti Celebration
  const launchConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  // 🧩 Fetch Giveaways
  const fetchGiveaways = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setGiveaways(data || []);
    setLoading(false);
  }, [supabase]);

  // ⚡ Finalize Winner
  const finalizeWinner = async (giveawayId: string) => {
    try {
      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .eq("giveaway_id", giveawayId);

      if (participantsError) throw participantsError;
      if (!participants?.length) {
        toast.error("No participants found for this giveaway.");
        return;
      }

      const winner =
        participants[Math.floor(Math.random() * participants.length)];

      // 🏆 Update giveaway with winner
      const { error: updateError } = await supabase
        .from("giveaways")
        .update({
          winner_id: winner.user_id,
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", giveawayId);

      if (updateError) throw updateError;

      // 🔔 Broadcast Realtime Event
      await supabase.channel("winner_announcements").send({
        type: "broadcast",
        event: "winner_finalized",
        payload: {
          giveaway_id: giveawayId,
          winner_name: winner.display_name || "Anonymous",
          prize: "🎁 Giveaway Winner Announced!",
        },
      });

      toast.success("Winner finalized successfully!");
      launchConfetti();
      fetchGiveaways();
    } catch (err: any) {
      console.error(err);
      toast.error("Error finalizing winner.");
    }
  };

  // 🔔 Realtime Celebration Listener
  useEffect(() => {
    const channel = supabase
      .channel("winner_announcements")
      .on(
        "broadcast",
        { event: "winner_finalized" },
        (payload: any) => {
          setCelebrating(true);
          launchConfetti();
          toast(`🎉 ${payload.payload.winner_name} just won!`);
          setTimeout(() => setCelebrating(false), 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, launchConfetti]);

  // 🔁 Initial Load
  useEffect(() => {
    fetchGiveaways();
  }, [fetchGiveaways]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Loading giveaways...
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin — Giveaways
        </h1>
        <p className="text-gray-500">Manage, monitor, and celebrate winners.</p>
      </motion.div>

      {/* 🌍 Giveaway List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {giveaways.map((g) => (
          <Card key={g.id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="text-lg">{g.title}</CardTitle>
              <Badge
                variant={
                  g.status === "active"
                    ? "default"
                    : g.status === "ended"
                    ? "secondary"
                    : "outline"
                }
              >
                {g.status === "ended" ? "Ended" : "Active"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{g.description}</p>
              {g.status === "active" && (
                <Button
                  onClick={() => finalizeWinner(g.id)}
                  className="w-full mt-3"
                >
                  Finalize Winner
                </Button>
              )}
              {g.status === "ended" && (
                <div className="mt-2 text-sm text-green-600">
                  Winner finalized! 🎉
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🔗 SkillLink Africa Banner */}
      <div className="pt-8">
        <SkillLinkBanner />
      </div>

      {/* 🥳 Celebration Overlay */}
      {celebrating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 rounded-2xl shadow-xl text-center"
          >
            <h2 className="text-2xl font-bold mb-2">🎊 Winner Announced!</h2>
            <p className="text-gray-600">
              Celebration in progress — everyone sees it live!
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
