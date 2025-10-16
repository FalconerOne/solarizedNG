import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Send a notification to all users.
 * @param message - Text to broadcast
 * @param type - Variant: success | info | warning | error
 */
export async function sendBroadcastNotification(
  message: string,
  type: "success" | "info" | "warning" | "error" = "info"
) {
  // Fetch all active user IDs
  const { data: users, error: usersError } = await supabase
    .from("user_profiles")
    .select("id");

  if (usersError) throw new Error(usersError.message);
  if (!users) return;

  const rows = users.map((u) => ({
    user_id: u.id,
    message,
    type,
    is_read: false,
  }));

  const { error: insertError } = await supabase.from("notifications").insert(rows);
  if (insertError) throw new Error(insertError.message);

  return true;
}
