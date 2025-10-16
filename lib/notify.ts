// lib/notify.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function sendNotification(userId: string, title: string, message: string, type: string = "system") {
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
