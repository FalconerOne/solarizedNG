// /lib/sendNotification.ts
import { createClient } from "@supabase/supabase-js";

export async function sendNotification({
  type,
  title,
  message,
  target_user,
  reference_id = null,
}: {
  type: string;
  title: string;
  message: string;
  target_user: string; // 'admin', 'supervisor', or specific user_id
  reference_id?: string | null;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("notifications").insert([
    {
      type,
      title,
      message,
      target_user,
      reference_id,
    },
  ]);

  if (error) {
    console.error("❌ Notification error:", error);
    return false;
  }

  console.log("✅ Notification sent:", title);
  return true;
}
