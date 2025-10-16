// app/api/admin/new-winner/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_name, prize, giveaway_title } = body;

    const message = `${user_name} just won ${prize} in "${giveaway_title}"! 🎉`;
    const heading = "New Winner Announced!";

    // OneSignal Push Broadcast
    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ["Activated Users"],
        headings: { en: heading },
        contents: { en: message },
        small_icon: "ic_stat_onesignal_default",
        large_icon: "https://solarizedng.vercel.app/icons/icon-512x512.png",
        data: {
          type: "new_winner",
          prize,
          giveaway_title,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OneSignal error:", errText);
      return NextResponse.json({ error: errText }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push notification error:", err);
    return NextResponse.json({ error: "Notification failed" }, { status: 500 });
  }
}
