"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SkillLinkBanner } from "@/components/SkillLinkBanner";

type GiveawayRow = {
  id: string;
  title: string;
  description?: string | null;
  status: "active" | "ended" | string;
  winner_id?: string | null;
  winner_name?: string | null;
  created_at: string;
  ended_at?: string | null;
};

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<GiveawayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const [userRole, setUserRole] = useState<string>("guest");

  // --- fetch user role (to ensure admin-only UI where needed)
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setUserRole("guest");
          return;
        }
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!error && data?.role) setUserRole(data.role);
        else setUserRole("user");
      } catch (err) {
        console.error("Failed to fetch user/role:", err);
        setUserRole("guest");
      }
    })();
  }, [supabase]);

  // --- confetti helper
  const launchConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    (function frame() {
      confetti({
        ...defaults,
        particleCount: 5,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // --- load giveaways
  const fetchGiveaways = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setGiveaways((data as GiveawayRow[]) || []);
    } catch (err) {
      console.error("Error fetching giveaways:", err);
      toast.error("Failed to fetch giveaways.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchGiveaways();
  }, [fetchGiveaways]);

  // --- finalize winner flow
  const finalizeWinner = async (giveawayId: string) => {
    if (userRole !== "admin") {
      toast.error("Only admins can finalize winners.");
      return;
    }

    try {
      setLoading(true);

      // fetch participants (light)
      const { data: participants, error: pError } = await supabase
        .from("participants")
        .select("user_id, display_name")
        .eq("giveaway_id", giveawayId);

      if (pError) throw pError;
      if (!participants || participants.length === 0) {
        toast.error("No participants found.");
        return;
      }

      const winner =
        participants[Math.floor(Math.random() * participants.length)];

      // update giveaway
      const { error: updateError } = await supabase
        .from("giveaways")
        .update({
          winner_id: winner.user_id,
          winner_name: winner.display_name || null,
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", giveawayId);

      if (updateError) throw updateError;

      // create notification (broadcast)
      const message = `The giveaway "${giveawayId}" has a winner: ${winner.display_name || "Anonymous"}`;
      const { error: notifError } = await supabase.from("notifications").insert([
        {
          type: "winner_announcement",
          title: "🎉 Winner Announced!",
          message,
          prize_image: null,
          target_user: null, // broadcast to all
        },
      ]);

      if (notifError) console.warn("Notification insert warning:", notifError);

      // local feedback
      toast.success("Winner finalized — broadcasting celebration!");
      launchConfetti();
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 7000);

      // refresh list
      fetchGiveaways();
    } catch (err) {
      console.error("Finalize winner error:", err);
      toast.error("Failed to finalize winner.");
    } finally {
      setLoading(false);
    }
  };

  // --- listen for global winner announcements (notifications table)
  useEffect(() => {
    const channel = supabase
      .channel("global-winner-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          try {
            const notif = payload.new as any;
            if (notif?.type === "winner_announcement") {
              // role-based masking: only show full message to privileged roles
              const allowedRoles = ["admin", "supervisor", "activated"];
              const displayMessage =
                allowedRoles.includes(userRole) || notif.target_user
                  ? notif.message
                  : "🎉 A winner has been announced! Activate your account to view details.";

              // show confetti + popup toast
              launchConfetti();
              toast(displayMessage);
              setCelebrating(true);
              setTimeout(() => setCelebrating(false), 7000);
            }
          } catch (err) {
            console.error("Realtime notif handling error:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, launchConfetti, userRole]);

  // --- visual shimmer background for celebration (soft gold wave)
  const shimmer = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-yellow-50 via-yellow-100 to-white opacity-30 blur-[30px] animate-[shimmer_4s_linear_infinite]"
        style={{
          mixBlendMode: "screen",
        }}
      />
      <style>{`
        @keyframes shimmer_4s_linear_infinite {
          0% { transform: translateX(-40%) scale(1.02); opacity: 0.18; }
          50% { transform: translateX(0%) scale(1.03); opacity: 0.34; }
          100% { transform: translateX(40%) scale(1.02); opacity: 0.18; }
        }
      `}</style>
    </motion.div>
  );

  return (
    <div className="p-6 md:p-10 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-semibold">🎁 Admin — Giveaways</h1>
        <p className="text-gray-500">Manage giveaways, finalize winners and broadcast celebrations.</p>
      </motion.div>

      {loading && (
        <div className="text-gray-500">Loading giveaways — please wait...</div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {giveaways.map((g) => (
          <Card key={g.id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="text-lg">{g.title}</CardTitle>
              <div className="ml-auto">
                <Badge variant={g.status === "active" ? "default" : "secondary"}>
                  {g.status === "active" ? "Active" : "Ended"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{g.description}</p>

              {g.status === "active" ? (
                <Button onClick={() => finalizeWinner(g.id)} className="w-full">
                  Finalize Winner
                </Button>
              ) : (
                <div className="text-sm text-green-600">Winner finalized 🎉</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SkillLink rotating banner */}
      <div className="pt-8">
        <SkillLinkBanner />
      </div>

      {/* Celebration overlay with shimmer */}
      {celebrating && (
        <>
          {shimmer}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-[90%] text-center">
              <h2 className="text-2xl font-bold mb-2">🎊 Winner Announced!</h2>
              <p className="text-gray-600 mb-4">A winner has been finalized and a celebration is being broadcast to all connected users.</p>
              <Button onClick={() => { setCelebrating(false); }} className="bg-blue-600 text-white">
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
