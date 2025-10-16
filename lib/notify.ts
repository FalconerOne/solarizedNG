// lib/notify.ts
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// --- Core database insert ---
export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: string = "system"
) {
  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      title,
      message,
      type,
    },
  ]);

  if (error) console.error("Notification insert error:", error);
}

/**
 * 🔔 Unified event-trigger system
 * Automatically triggers:
 * - Database notification
 * - Email (via Resend)
 * - Push (via OneSignal)
 */
export async function notifyEvent(
  userId: string,
  eventType: string,
  data: Record<string, any> = {}
) {
  // Fetch user info
  const { data: user, error } = await supabase
    .from("profiles")
    .select("email, full_name, onesignal_player_id")
    .eq("id", userId)
    .single();

  if (error || !user) {
    console.error("User not found for notifyEvent:", error);
    return;
  }

  // Define event templates
  const templates: Record<
    string,
    { title: string; message: string }
  > = {
    user_joined_giveaway: {
      title: "🎉 You Joined a Giveaway!",
      message: `Hi ${user.full_name || "there"}, you successfully joined the giveaway.`,
    },
    giveaway_created: {
      title: "🚀 New Giveaway Available!",
      message: "A new giveaway has just gone live. Join now and stand a chance to win!",
    },
    prize_won: {
      title: "🏆 Congratulations!",
      message: `You’ve just won a prize in one of your joined giveaways. Check your dashboard for details!`,
    },
  };

  const event = templates[eventType] || {
    title: "SolarizedNG Update",
    message: "Something new just happened on SolarizedNG!",
  };

  // --- 1️⃣ Database Notification ---
  await sendNotification(userId, event.title, event.message, eventType);

  // --- 2️⃣ Email via Resend ---
  try {
    await resend.emails.send({
      from: "SolarizedNG <noreply@solarizedng.com>",
      to: user.email,
      subject: event.title,
      html: `<p>${event.message}</p>`,
    });
  } catch (err) {
    console.error("Resend email error:", err);
  }

  // --- 3️⃣ Push via OneSignal ---
  try {
    if (user.onesignal_player_id) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.ONESIGNAL_APP_ID,
          include_player_ids: [user.onesignal_player_id],
          headings: { en: event.title },
          contents: { en: event.message },
          url: "https://solarizedng.vercel.app/dashboard",
        }),
      });
    }
  } catch (err) {
    console.error("OneSignal push error:", err);
  }
}
