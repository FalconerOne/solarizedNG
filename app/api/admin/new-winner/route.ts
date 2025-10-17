// app/api/admin/new-winner/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Insert a manual winner event (useful for admin corrections).
 * Body expects: { giveaway_id, winner_id, winner_name?, winner_email?, winner_phone? }
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { giveaway_id, winner_id, winner_name, winner_email, winner_phone } = body;
    if (!giveaway_id || !winner_id) {
      return NextResponse.json({ success: false, error: "giveaway_id and winner_id required" }, { status: 400 });
    }

    const eventRow = {
      giveaway_id,
      winner_id,
      winner_name: winner_name ?? null,
      winner_email: winner_email ?? null,
      winner_phone: winner_phone ?? null,
      prize_name: null,
      giveaway_title: null,
      prize_image: null,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await admin.from("winner_events").insert([eventRow]).select().single();
    if (error) throw error;

    // broadcast
    try {
      const channel = admin.channel("global_winner_events");
      await channel.send({ type: "broadcast", event: "winner_finalized", payload: inserted });
      if (typeof (channel as any).unsubscribe === "function") await (channel as any).unsubscribe();
    } catch (bcErr) {
      console.warn("broadcast failed:", bcErr);
    }

    // log activity
    await admin.from("admin_activity_log").insert([{ action: "manual_new_winner", target_id: giveaway_id, details: JSON.stringify(inserted), created_at: new Date().toISOString() }]);

    return NextResponse.json({ success: true, event: inserted });
  } catch (err: any) {
    console.error("new-winner error", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
