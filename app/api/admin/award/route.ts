import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { giveawayId, winnerId, adminId } = await req.json();

    if (!giveawayId || !winnerId || !adminId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify admin privileges
    const { data: adminCheck } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", adminId)
      .single();

    if (adminCheck?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get giveaway details
    const { data: giveaway } = await supabase
      .from("giveaways")
      .select("title, description")
      .eq("id", giveawayId)
      .single();

    // Mark winner in DB
    await supabase
      .from("giveaways")
      .update({ winner_id: winnerId, status: "completed" })
      .eq("id", giveawayId);

    // Get winner info
    const { data: winner } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", winnerId)
      .single();

    // Create notification message
    const message = `🎉 ${winner?.full_name} has won the giveaway "${giveaway?.title}"! Congratulations!`;
    const title = "New Giveaway Winner Announced!";

    // Notify all activated users
    const { data: users } = await supabase
      .from("profiles")
      .select("id, email, full_name, onesignal_player_id")
      .eq("activated", true);

    for (const user of users || []) {
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          title,
          message,
          type: "giveaway_winner",
        },
      ]);

      // Send Resend email
      if (user.email) {
        await resend.emails.send({
          from: "MyGiveAway <notify@mygiveaway.app>",
          to: user.email,
          subject: title,
          html: `<p>${message}</p><p>Visit <a href="https://mygiveaway.vercel.app">MyGiveAway</a> to join the next one!</p>`,
        });
      }

      // Send OneSignal push
      if (user.onesignal_player_id) {
        await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          },
          body: JSON.stringify({
            app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            include_player_ids: [user.onesignal_player_id],
            headings: { en: title },
            contents: { en: message },
          }),
        });
      }
    }

    return NextResponse.json({ success: true, message: "Winner announced and notifications sent" });
  } catch (error) {
    console.error("Error announcing winner:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
