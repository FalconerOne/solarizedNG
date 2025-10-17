import { NextResponse } from "next/server";
import { createClient } from "@/config/supabase";

/**
 * This route finalizes a giveaway winner, updates the database,
 * and triggers a global realtime celebration event that all users listen to.
 *
 * Table dependencies:
 *  - public.giveaways
 *  - public.participants
 *  - public.winner_events
 */

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json();
    const { giveaway_id, winner_id } = body;

    if (!giveaway_id || !winner_id) {
      return NextResponse.json(
        { error: "Missing giveaway_id or winner_id" },
        { status: 400 }
      );
    }

    // 🏆 Step 1: Fetch giveaway details
    const { data: giveaway, error: giveawayError } = await supabase
      .from("giveaways")
      .select("id, title, prize_name, prize_image")
      .eq("id", giveaway_id)
      .single();

    if (giveawayError || !giveaway) {
      throw new Error("Giveaway not found");
    }

    // 🎯 Step 2: Fetch winner details
    const { data: winner, error: winnerError } = await supabase
      .from("participants")
      .select("id, full_name, email, phone")
      .eq("id", winner_id)
      .single();

    if (winnerError || !winner) {
      throw new Error("Winner not found");
    }

    // ✅ Step 3: Mark winner in giveaways table
    await supabase
      .from("giveaways")
      .update({ winner_id: winner.id, status: "completed" })
      .eq("id", giveaway.id);

    // 🎉 Step 4: Insert into winner_events table (triggers realtime)
    const { error: eventError } = await supabase.from("winner_events").insert([
      {
        winner_id: winner.id,
        giveaway_id: giveaway.id,
        winner_name: winner.full_name,
        winner_email: winner.email,
        winner_phone: winner.phone,
        prize_name: giveaway.prize_name,
        giveaway_title: giveaway.title,
        prize_image: giveaway.prize_image,
        created_at: new Date().toISOString(),
      },
    ]);

    if (eventError) throw eventError;

    // 🪄 Step 5: Broadcast realtime event manually (extra reliability)
    await supabase.channel("winner-celebrations-global").send({
      type: "broadcast",
      event: "winner-finalized",
      payload: {
        winner_name: winner.full_name,
        prize_name: giveaway.prize_name,
        giveaway_title: giveaway.title,
        prize_image: giveaway.prize_image,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Winner finalized and broadcast successfully!",
    });
  } catch (error: any) {
    console.error("Finalize Winner Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
