// app/api/admin/finalize-winner/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Finalize a giveaway winner (admin).
 * Body: { giveaway_id: string, winner_id?: string }
 * If winner_id omitted, picks a random participant.
 * Inserts into winner_events and broadcasts realtime notification.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const giveaway_id = body.giveaway_id as string | undefined;
    let winner_id = body.winner_id as string | undefined;

    if (!giveaway_id) {
      return NextResponse.json({ success: false, error: "giveaway_id required" }, { status: 400 });
    }

    // fetch giveaway
    const { data: giveaway, error: gErr } = await admin
      .from("giveaways")
      .select("id, title, prize, prize_image")
      .eq("id", giveaway_id)
      .single();
    if (gErr || !giveaway) throw gErr ?? new Error("giveaway not found");

    // if winner_id not provided, pick random participant
    if (!winner_id) {
      const { data: participants, error: pErr } = await admin
        .from("participants")
        .select("id, full_name, email, phone")
        .eq("giveaway_id", giveaway_id)
        .limit(500);
      if (pErr) throw pErr;
      if (!participants || participants.length === 0) {
        return NextResponse.json({ success: false, error: "No participants" }, { status: 400 });
      }
      const pick = participants[Math.floor(Math.random() * participants.length)];
      winner_id = pick.id;
    }

    // fetch winner participant
    const { data: winner, error: wErr } = await admin
      .from("participants")
      .select("id, full_name, email, phone")
      .eq("id", winner_id)
      .single();
    if (wErr || !winner) throw wErr ?? new Error("winner not found");

    // update giveaway row
    const updates = {
      winner_id: winner.id,
      winner_name: winner.full_name ?? winner.email ?? "Winner",
      winner_email: winner.email ?? null,
      winner_phone: winner.phone ?? null,
      status: "completed",
      updated_at: new Date().toISOString(),
    };
    const { data: updatedGiveaway, error: uErr } = await admin
      .from("giveaways")
      .update(updates)
      .eq("id", giveaway_id)
      .select()
      .single();
    if (uErr) throw uErr;

    // insert into winner_events
    const eventRow = {
      giveaway_id: updatedGiveaway.id,
      winner_id: winner.id,
      winner_name: winner.full_name,
      winner_email: winner.email,
      winner_phone: winner.phone,
      prize_name: updatedGiveaway.prize ?? updatedGiveaway.prize_name ?? null,
      giveaway_title: updatedGiveaway.title ?? null,
      prize_image: updatedGiveaway.prize_image ?? null,
      created_at: new Date().toISOString(),
    };
    const { data: insertedEvent, error: eErr } = await admin.from("winner_events").insert([eventRow]).select().single();
    if (eErr) throw eErr;

    // broadcast via realtime channel
    try {
      const channel = admin.channel("global_winner_events", {
        config: { broadcast: { ack: true } },
      });
      await channel.send({
        type: "broadcast",
        event: "winner_finalized",
        payload: insertedEvent,
      });
      // best-effort cleanup
      try {
        if (typeof (channel as any).unsubscribe === "function") {
          await (channel as any).unsubscribe();
        } else if (typeof (admin as any).removeChannel === "function") {
          await (admin as any).removeChannel(channel);
        }
      } catch (cleanup) {
        // ignore
      }
    } catch (bcErr) {
      console.warn("broadcast failed", bcErr);
    }

    // activity log
    await admin.from("admin_activity_log").insert([{
      admin_id: null,
      action: "finalize_winner",
      target_id: updatedGiveaway.id,
      details: JSON.stringify({ winner_id: winner.id }),
      created_at: new Date().toISOString()
    }]);

    return NextResponse.json({ success: true, giveaway: updatedGiveaway, event: insertedEvent });
  } catch (err: any) {
    console.error("finalize-winner error:", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
