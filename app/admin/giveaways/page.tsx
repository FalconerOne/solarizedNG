"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient"; // existing project client (used for queries + realtime)
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // for auth.getUser()
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import PrizeMediaUpload from "@/components/admin/PrizeMediaUpload";
import { logAdminActivity } from "@/lib/logAdminActivity";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Trophy, Lock } from "lucide-react";

/**
 * app/admin/giveaways/page.tsx
 * - Preserves CRUD, PrizeMediaUpload, announceWinner, logAdminActivity
 * - Adds: winner finalization, masked display, canvas confetti, role-based controls
 * - Adds cross-role realtime listener: all connected clients (admins, supervisors, activated users)
 *   using the same subscription will receive updates; confetti triggers automatically on finalize.
 */

export default function AdminGiveawaysPage() {
  const supabaseClient = createClientComponentClient(); // for auth.getUser()
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [finalizing, setFinalizing] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // keep a small in-memory map of last known finalized state to avoid repeated confetti
  const lastFinalizedMapRef = useRef<Record<string, boolean>>({});

  // ----------------------
  // Fetch giveaways (centralized)
  // ----------------------
  const fetchGiveaways = useCallback(async () => {
    const { data, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("fetchGiveaways error:", error);
    } else {
      setGiveaways(data || []);
      // update local finalized map for new data
      const map: Record<string, boolean> = {};
      (data || []).forEach((g: any) => {
        map[String(g.id)] = !!g.winner_finalized;
      });
      lastFinalizedMapRef.current = map;
    }
  }, []);

  useEffect(() => {
    fetchGiveaways();
  }, [fetchGiveaways]);

  // ----------------------
  // Load current user (role)
  // ----------------------
  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await supabaseClient.auth.getUser();
        if (data.user) {
          const { data: profile, error } = await supabase
            .from("users")
            .select("id, email, role")
            .eq("id", data.user.id)
            .single();
          if (!error) setCurrentUser(profile);
        }
      } catch (err) {
        console.error("loadUser error:", err);
      }
    }
    loadUser();
  }, [supabaseClient]);

  // ----------------------
  // Realtime subscription (cross-role)
  // - Listens for any changes on giveaways table (insert, update, delete).
  // - On update: refetch and, if a giveaway transitioned to finalized, trigger confetti.
  // ----------------------
  useEffect(() => {
    // subscribe
    const channel = supabase
      .channel("giveaways-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "giveaways" },
        (payload) => {
          // payload contains new/old row info; sometimes only new is present
          try {
            const newRow = (payload as any).new;
            const oldRow = (payload as any).old;

            // If we received an update where winner_finalized became true, and it was previously false
            const id = newRow?.id ?? oldRow?.id;
            const newFinalized = !!newRow?.winner_finalized;
            const prevFinalized =
              typeof oldRow?.winner_finalized !== "undefined"
                ? !!oldRow?.winner_finalized
                : !!lastFinalizedMapRef.current[String(id)];

            // Refresh the list (debounced lightly by setTimeout to avoid storms)
            setTimeout(() => fetchGiveaways(), 150);

            if (id && newFinalized && !prevFinalized) {
              // Only trigger confetti once per client per giveaway transition
              const alreadyShown = lastFinalizedMapRef.current[String(id)];
              if (!alreadyShown) {
                lastFinalizedMapRef.current[String(id)] = true;
                // small delay to let UI update before confetti runs
                setTimeout(() => {
                  launchConfetti();
                  navigator.vibrate?.(200);
                }, 350);
              }
            }
          } catch (err) {
            console.error("Realtime payload handling error:", err);
            // still refetch to be safe
            fetchGiveaways();
          }
        }
      )
      .subscribe();

    return () => {
      // cleanup subscription
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn("removeChannel error:", err);
      }
    };
  }, [fetchGiveaways]);

  // ----------------------
  // Canvas Confetti (lightweight)
  // ----------------------
  const launchConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const confettiCount = 140;
    const confetti = Array.from({ length: confettiCount }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H - H,
      r: Math.random() * 6 + 2,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
    }));

    let animationFrame = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      confetti.forEach((c) => {
        ctx.beginPath();
        ctx.lineWidth = c.r / 2;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
        ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);
        ctx.stroke();
      });
      update();
      animationFrame = requestAnimationFrame(draw);
    }

    function update() {
      confetti.forEach((c) => {
        c.tiltAngle += c.tiltAngleIncremental;
        c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
        c.x += Math.sin(c.tiltAngle);
        c.tilt = Math.sin(c.tiltAngle) * 15;
        if (c.y > H) {
          c.y = -10;
          c.x = Math.random() * W;
        }
      });
    }

    draw();

    // Stop after 7.5s
    setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, W, H);
    }, 7500);
  }, []);

  // ----------------------
  // Mask winner display (visibility rules preserved)
  // ----------------------
  const maskWinnerName = useCallback((name: string) => {
    if (!name) return "Hidden Winner";
    if (name.length <= 2) return name[0] + "*";
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  }, []);

  // ----------------------
  // Finalize winner (Admin-only)
  // - Picks a random participant from giveaway_participants
  // - Updates giveaways (winner_user_id, winner_finalized, finalized_at)
  // - Inserts into giveaway_winner_logs with finalized_by = admin id
  // - Real-time channel will broadcast change to all connected clients which triggers confetti there too
  // ----------------------
  const finalizeWinner = useCallback(
    async (giveawayId: string) => {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("You do not have permission to finalize winners.");
        return;
      }
      try {
        setFinalizing(giveawayId);

        const { data: participants, error: partErr } = await supabase
          .from("giveaway_participants")
          .select("user_id")
          .eq("giveaway_id", giveawayId);

        if (partErr || !participants?.length) {
          toast.error("No participants found for this giveaway!");
          setFinalizing(null);
          return;
        }

        const winner =
          participants[Math.floor(Math.random() * participants.length)];

        const { error: updateErr } = await supabase
          .from("giveaways")
          .update({
            winner_user_id: winner.user_id,
            winner_finalized: true,
            finalized_at: new Date().toISOString(),
          })
          .eq("id", giveawayId);

        if (updateErr) throw updateErr;

        await supabase.from("giveaway_winner_logs").insert([
          {
            giveaway_id: giveawayId,
            winner_user_id: winner.user_id,
            finalized_by: currentUser.id,
            notes: `Winner finalized by Admin (${currentUser.email})`,
          },
        ]);

        // local optimistic mark to avoid double confetti runs
        lastFinalizedMapRef.current[String(giveawayId)] = true;

        // small delay to ensure UI shows updated winner, then celebrate
        setTimeout(() => {
          launchConfetti();
          navigator.vibrate?.(200);
          toast.success("🎉 Winner finalized successfully!");
          fetchGiveaways();
        }, 300);
      } catch (err) {
        console.error("finalizeWinner error:", err);
        toast.error("Error finalizing winner!");
      } finally {
        setFinalizing(null);
      }
    },
    [currentUser, launchConfetti, fetchGiveaways]
  );

  // ----------------------
  // CRUD Ops (kept from original)
  // ----------------------
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

  // ----------------------
  // Announce winner (keeps existing backend flow)
  // ----------------------
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

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="p-6 relative">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      ></canvas>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Manage Giveaways
      </h1>

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
        <AnimatePresence>
          {giveaways.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl border border-gray-200 p-4 shadow-md bg-white"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg">{g.title}</h2>
                  <p className="text-sm text-gray-600">{g.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {g.start_date ? new Date(g.start_date).toLocaleDateString() : "—"} →{" "}
                    {g.end_date ? new Date(g.end_date).toLocaleDateString() : "—"}
                  </p>

                  {g.winner_user_id ? (
                    <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      🏆 Winner:{" "}
                      <strong>{maskWinnerName(String("User #" + g.winner_user_id))}</strong>
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm mt-1">No winner finalized yet</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => startEdit(g)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(g.id)} variant="destructive">
                    Delete
                  </Button>

                  {g.winner_user_id ? (
                    <Button
                      onClick={() =>
                        announceWinner(g.id, g.winner_user_id, currentUser?.id || "admin-system")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Announce Winner
                    </Button>
                  ) : currentUser?.role === "admin" ? (
                    <Button
                      onClick={() => finalizeWinner(g.id)}
                      disabled={finalizing === g.id}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      {finalizing === g.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        "Finalize Winner"
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-4 h-4" /> View-only
                    </div>
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
        </AnimatePresence>
      </div>
    </div>
  );
}
