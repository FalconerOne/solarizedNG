"use client";

/**
 * app/admin/giveaways/page.tsx
 *
 * Fully self-contained Admin Giveaways page:
 * - Lists giveaways
 * - Finalizes winners (updates giveaways table)
 * - Broadcasts global celebration implicitly via DB realtime updates
 * - Exports `useGlobalWinnerCelebration` hook for reuse across the app (Option A)
 * - Works with Supabase v1 or v2 realtime client at runtime
 * - Applies Participation Visibility Rule:
 *     Admins & Activated users: full name + prize thumbnail
 *     Guests/unactivated: masked info + capped participant counts
 *
 * Notes:
 * - This file does not change other files or DB schema.
 * - It relies on your existing Supabase realtime triggers or the built-in postgres_changes subscription
 *   (we subscribe to "giveaways" table updates).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, RefreshCcw } from "lucide-react";

/* ---------- Helper types ---------- */
type GiveawayRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  prize?: string | null;
  prize_image_url?: string | null;
  created_at?: string | null;
  winner_id?: string | null;
  winner_name?: string | null;
  participant_count?: number | null;
  status?: string | null;
};

type UserProfile = {
  id_uuid?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  role?: string | null; // admin / supervisor / user
  status?: string | null; // activated / pending / etc
};

/* ---------- Utility: masking helpers ---------- */
const maskEmail = (email?: string | null) => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  const prefix = local.slice(0, Math.max(1, Math.min(3, Math.floor(local.length / 2))));
  return `${prefix}***@${domain}`;
};

const maskPhone = (phone?: string | null) => {
  if (!phone) return "";
  // keep last 3 digits
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length <= 4) return "***" + cleaned.slice(-1);
  return `${cleaned.slice(0, 2)}***${cleaned.slice(-3)}`;
};

const clampParticipantsForGuest = (count: number | null | undefined) => {
  if (!count && count !== 0) return Math.floor(20 + Math.random() * 30); // fallback
  return Math.min(60, Math.floor((count || 0) * (0.85 + Math.random() * 0.15)));
};

/* ---------- Confetti (lightweight canvas) ---------- */
function runCanvasConfettiOnce() {
  try {
    const duration = 3500;
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9999";
    canvas.style.pointerEvents = "none";
    canvas.id = "global-confetti-canvas";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#FFC107", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];
    const pieces = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 8 + 2,
      dx: Math.random() * 4 - 2,
      dy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
    }));
    let running = true;

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();

        p.x += p.dx;
        p.y += p.dy;
        p.rot += 0.1;
        if (p.y > canvas.height + 50) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => {
      running = false;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }, duration);
  } catch (e) {
    // silent fail — confetti is optional
    // eslint-disable-next-line no-console
    console.warn("Confetti failed", e);
  }
}

/* ---------- Hook: unified detection and subscription (exported) ---------- */
/**
 * useGlobalWinnerCelebration
 * - Subscribes to giveaways updates globally (works with v1 or v2 Supabase client)
 * - On receiving a winner announcement (giveaways.winner_id set), triggers confetti + toast
 * - Returns a small control object (for manual trigger during testing)
 *
 * Exportable so other pages can import and reuse.
 */
export function useGlobalWinnerCelebration(supabase?: SupabaseClient | null) {
  const supa = supabase || createClientComponentClient();

  const subscribe = useCallback(
    (onEvent: (payload: any) => void) => {
      // Support both supabase-js v1 and v2 patterns
      // v2: supabase.channel(...).on('postgres_changes', filter, handler).subscribe()
      // v1: supabase.from('giveaways').on('UPDATE', handler).subscribe()
      let sub: any = null;
      try {
        // prefer v2 style if available
        // @ts-ignore
        if (typeof (supa as any).channel === "function") {
          // v2 style
          sub = (supa as any)
            .channel("global-giveaway-events")
            .on(
              "postgres_changes",
              { event: "UPDATE", schema: "public", table: "giveaways" },
              (payload: any) => onEvent(payload)
            )
            .subscribe();
          return sub;
        }
      } catch (e) {
        // fallthrough to v1
      }

      // v1 fallback
      try {
        // @ts-ignore
        sub = (supa as any)
          .from("giveaways")
          .on("UPDATE", (payload: any) => onEvent(payload))
          .subscribe();
        return sub;
      } catch (e) {
        // If subscribe fails, just return null
        // eslint-disable-next-line no-console
        console.warn("Realtime subscription failed", e);
        return null;
      }
    },
    [supa]
  );

  const unsubscribe = useCallback(
    (sub: any) => {
      if (!sub) return;
      try {
        // v2: supabase.removeChannel(sub)
        // v1: supabase.removeSubscription(sub) or sub.unsubscribe()
        // try all safe methods
        // @ts-ignore
        if (typeof (supa as any).removeChannel === "function") {
          // v2
          (supa as any).removeChannel(sub);
        } else if (typeof sub.unsubscribe === "function") {
          sub.unsubscribe();
        } else if (typeof (supa as any).removeSubscription === "function") {
          (supa as any).removeSubscription(sub);
        }
      } catch (e) {
        // ignore
      }
    },
    [supa]
  );

  return { subscribe, unsubscribe, runConfetti: runCanvasConfettiOnce };
}

/* ---------- Admin Page Component ---------- */
export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();
  const hook = useGlobalWinnerCelebration(supabase);

  const [loading, setLoading] = useState<boolean>(true);
  const [giveaways, setGiveaways] = useState<GiveawayRow[]>([]);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [toastStack, setToastStack] = useState<
    { id: string; title: string; body?: string; image?: string }[]
  >([]);

  const toastPush = (title: string, body?: string, image?: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setToastStack((s) => [{ id, title, body, image }, ...s].slice(0, 5));
    // auto remove after 5s
    setTimeout(() => {
      setToastStack((s) => s.filter((t) => t.id !== id));
    }, 5000);
  };

  /* ---------- Load current user profile to determine role/status ---------- */
  const loadProfile = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUserProfile(null);
        return;
      }
      const { data: profile } = await supabase
        .from<UserProfile>("users")
        .select("id_uuid, email, full_name, phone, role, status")
        .eq("id_uuid", user.id)
        .single();
      if (profile) setUserProfile(profile);
      else setUserProfile(null);
    } catch (e) {
      // ignore
      setUserProfile(null);
    }
  }, [supabase]);

  /* ---------- Fetch Giveaways ---------- */
  const fetchGiveaways = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<GiveawayRow>("giveaways")
        .select(
          `id, title, description, prize, prize_image_url, created_at, winner_id, winner_name, participant_count, status`
        )
        .order("created_at", { ascending: false });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("fetchGiveaways error:", error);
        setGiveaways([]);
      } else {
        // apply participation visibility rule for non-admin/non-activated
        const adjusted = (data || []).map((g) => {
          const copy = { ...g };
          if (!userProfile) {
            // guest: cap participants
            copy.participant_count = clampParticipantsForGuest(g.participant_count ?? 0);
            // mask winner name for guests (we'll show masked on toast)
          } else if (userProfile.role !== "admin" && userProfile.status !== "activated") {
            // unactivated user: cap and mask
            copy.participant_count = clampParticipantsForGuest(g.participant_count ?? 0);
          }
          return copy;
        });
        setGiveaways(adjusted);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("fetchGiveaways exception:", err);
      setGiveaways([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, userProfile]);

  useEffect(() => {
    loadProfile().then(() => fetchGiveaways());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Global realtime subscription for winner announcements ---------- */
  useEffect(() => {
    // subscribe and react to updates
    const onEvent = async (payload: any) => {
      // payload format differs between v1 and v2; handle both
      const record = payload.new ?? payload.record ?? payload;
      // If winner set, celebrate
      if (record && record.winner_id) {
        // Build toast message according to visibility rules
        // If admin or activated user - show prize image and masked/real info
        const isAdmin = userProfile?.role === "admin";
        const isActivated = userProfile?.status === "activated";
        const showFull = isAdmin || isActivated;

        // show masked email/phone with real name when allowed
        const winnerName = showFull ? record.winner_name || "Winner" : record.winner_name || null;
        const email = showFull ? record.winner_email ?? null : record.winner_email ?? null;
        const phone = showFull ? record.winner_phone ?? null : record.winner_phone ?? null;

        // assemble toast
        if (showFull) {
          const body = `${winnerName}${
            email ? ` • ${maskEmail(email)}` : ""
          }${phone ? ` • ${maskPhone(phone)}` : ""}`;
          toastPush(`Winner: ${winnerName}`, body, record.prize_image_url);
        } else {
          // guest
          toastPush(`🎉 A lucky participant just won!`, `Activate your account to view details.`);
        }

        hook.runConfetti();
      }

      // refresh local list to stay in sync
      fetchGiveaways();
    };

    const sub = hook.subscribe(onEvent);
    return () => {
      hook.unsubscribe(sub);
    };
  }, [hook, userProfile, fetchGiveaways]);

  /* ---------- Finalize winner flow (admin only) ---------- */
  const finalizeWinner = async (giveawayId: string) => {
    if (!userProfile || userProfile.role !== "admin") {
      alert("Only admins can finalize winners.");
      return;
    }

    setFinalizingId(giveawayId);

    try {
      // fetch participants (capped selection size)
      const { data: participants, error: partErr } = await supabase
        .from("participants")
        .select("id, display_name, email, phone")
        .eq("giveaway_id", giveawayId)
        .limit(100); // admin selection sample

      if (partErr) throw partErr;
      if (!participants || participants.length === 0) {
        alert("No participants found!");
        setFinalizingId(null);
        return;
      }

      // pick a random winner from the participants (respecting cap of 60 visible, but admin sample could be bigger)
      const winner = participants[Math.floor(Math.random() * participants.length)];

      // update giveaways table with winner info (this should fire existing realtime triggers)
      const { error: updateErr } = await supabase
        .from("giveaways")
        .update({
          winner_id: winner.id,
          winner_name: winner.display_name ?? winner.email ?? "Winner",
          // optionally store more fields for consumption by frontends
          winner_email: winner.email ?? null,
          winner_phone: winner.phone ?? null,
        })
        .eq("id", giveawayId);

      if (updateErr) throw updateErr;

      // toast on admin screen + confetti
      toastPush("Winner finalized", `${winner.display_name || winner.email}`, undefined);
      runCanvasConfettiOnce();

      // refresh list
      await fetchGiveaways();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("finalizeWinner error", e);
      alert(e?.message ?? "Failed to finalize winner");
    } finally {
      setFinalizingId(null);
    }
  };

  /* ---------- UI render ---------- */
  return (
    <div className="relative p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Trophy className="text-yellow-500" /> Admin Giveaways
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadProfile().then(() => fetchGiveaways());
            }}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin mr-2" /> Loading...
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {giveaways.map((g) => (
            <Card key={g.id} className="shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-lg">{g.title ?? "Untitled Giveaway"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {g.description ?? ""}
                </p>

                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="text-sm">
                      <strong>Prize:</strong> {g.prize ?? "Prize"}
                    </div>
                    {g.prize_image_url ? (
                      <img
                        src={g.prize_image_url}
                        alt="prize"
                        className="mt-2 w-28 h-20 object-cover rounded"
                      />
                    ) : null}
                  </div>
                  <div className="text-sm text-right">
                    <div>
                      <strong>Participants:</strong>{" "}
                      {g.participant_count ?? clampParticipantsForGuest(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {g.created_at ? new Date(g.created_at).toLocaleString() : "-"}
                    </div>
                  </div>
                </div>

                {g.winner_id ? (
                  <div className="p-3 rounded bg-green-50 text-green-900 font-medium">
                    {userProfile && (userProfile.role === "admin" || userProfile.status === "activated") ? (
                      <div>
                        <div>🎉 Winner: {g.winner_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {g["winner_email"] ? maskEmail(g["winner_email"]) : ""}
                          {g["winner_phone"] ? ` • ${maskPhone(g["winner_phone"])}` : ""}
                        </div>
                      </div>
                    ) : (
                      <div>🎉 Winner announced — activate your account to view details</div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => finalizeWinner(g.id)}
                      disabled={finalizingId === g.id}
                      className="flex-1"
                    >
                      {finalizingId === g.id ? "Finalizing..." : "Finalize Winner"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Toast area (small) */}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col items-end gap-3">
        {toastStack.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 bg-white border rounded p-3 shadow"
            style={{ minWidth: 260 }}
          >
            {t.image ? (
              <img src={t.image} className="w-12 h-12 object-cover rounded" alt="thumb" />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                <Trophy className="text-yellow-500" />
              </div>
            )}
            <div>
              <div className="font-semibold text-sm">{t.title}</div>
              {t.body ? <div className="text-xs text-muted-foreground">{t.body}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
