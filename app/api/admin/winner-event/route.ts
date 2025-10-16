import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const { giveaway_id, winner_id, prize_name, image_url, message, visible_to } =
      await req.json();

    if (!giveaway_id || !winner_id || !prize_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("winner_events").insert([
      {
        giveaway_id,
        winner_id,
        prize_name,
        image_url: image_url || null,
        message:
          message ||
          "🎉 A new giveaway winner has emerged! Check the leaderboard to see the details!",
        visible_to: visible_to || "all",
      },
    ]);

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: "Winner event broadcasted successfully 🎊" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error broadcasting winner event:", err);
    return NextResponse.json(
      { error: "Failed to broadcast winner event", details: err.message },
      { status: 500 }
    );
  }
}
