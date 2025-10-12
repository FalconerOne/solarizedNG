// /pages/api/cron/send-draw-notifications.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!;
const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = dayjs().tz("Africa/Lagos"); // GMT+1
    const today = now.startOf("day");

    // Get upcoming draws within the next 3 days
    const { data: draws, error } = await supabase
      .from("prizes")
      .select("*")
      .gte("draw_date", today.toISOString())
      .lte("draw_date", today.add(3, "day").toISOString());

    if (error) throw error;
    if (!draws || draws.length === 0)
      return res.status(200).json({ message: "No draws within next 3 days." });

    for (const draw of draws) {
      const drawTime = dayjs(draw.draw_date).tz("Africa/Lagos");
      const hoursToDraw = drawTime.diff(now, "hour");

      // Define notification slots
      const shouldSend =
        hoursToDraw === 72 ||
        hoursToDraw === 48 ||
        hoursToDraw === 24 ||
        (hoursToDraw <= 1 && now.hour() === 12); // Noon on draw day

      if (!shouldSend) continue;

      // Build the message
      let message = "";
      if (hoursToDraw >= 72)
        message = `🎁 Only 3 days left until the ${draw.title} draw!`;
      else if (hoursToDraw >= 48)
        message = `💫 2 days to go! Don’t miss your chance to win ${draw.title}.`;
      else if (hoursToDraw >= 24)
        message = `⏰ Tomorrow’s the big day for ${draw.title}! Stay tuned.`;
      else message = `🏆 It’s time! The ${draw.title} draw is happening now.`

      const fullMessage = `${message}\n\nYour participation is appreciated. Thank you for being part of this journey ❤️`;

      // Send Push via OneSignal
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          included_segments: ["All"],
          headings: { en: "Heart Heroes Draw Update" },
          contents: { en: fullMessage },
        }),
      });

      // Log message in DB (optional)
      await supabase.from("message_queue").insert([
        {
          type: "push",
          subject: "Draw Notification",
          content: fullMessage,
          recipient_group: "participants",
          scheduled_at: now.toISOString(),
        },
      ]);
    }

    res.status(200).json({ message: "Notifications processed." });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

