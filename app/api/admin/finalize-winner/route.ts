import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/notify";
import { logAdminActivity } from "@/lib/logAdminActivity";
import { sendPushNotification } from "@/lib/push";
import { sendEmailNotification } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { giveaway_id, user_id, prize_name, giveaway_title } = await req.json();

    // 1️⃣ Create new winner record
    const { data, error } = await supabase
      .from("winners")
      .insert([
        {
          giveaway_id,
          user_id,
          announced_at: new Date().toISOString(),
          verified: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 2️⃣ Notify all activated users
    const { data: users } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("activated", true);

    if (users && users.length > 0) {
      for (const u of users) {
        await sendNotification(
          u.id,
          "🎉 New Giveaway Winner Announced!",
          `A winner has been chosen for "${giveaway_title}" — Prize: ${prize_name}`
        );
      }
    }

    // 3️⃣ Push notification broadcast
    await sendPushNotification(
      "🎉 New Winner!",
      `A winner just won ${prize_name} in ${giveaway_title}! Check it out.`
    );

    // 4️⃣ Optional email
    await sendEmailNotification(
      "New Giveaway Winner!",
      `A winner has been announced for "${giveaway_title}". Prize: ${prize_name}`
    );

    // 5️⃣ Log admin activity
    await logAdminActivity("finalize_winner", `Finalized winner for ${giveaway_title}`);

    return NextResponse.json({ success: true, winner: data });
  } catch (err: any) {
    console.error("Error finalizing winner:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
