// src/lib/notifications.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* 
Table structure expected in Supabase:

notifications
-------------
id              bigint (PK)
user_id         uuid
title           text
message         text
type            text (e.g. "system" | "activity" | "reward")
read            boolean  default false
created_at      timestamptz  default now()
*/

// 📨 Fetch all notifications for a user
export async function getNotifications(user_id: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) console.error("❌ getNotifications:", error.message);
  return data || [];
}

// 🆕 Add a new notification
export async function addNotification({
  user_id,
  title,
  message,
  type = "system",
}: {
  user_id: string;
  title: string;
  message: string;
  type?: string;
}) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([{ user_id, title, message, type }])
    .select()
    .single();

  if (error) console.error("❌ addNotification:", error.message);
  return data;
}

// ✅ Mark one notification as read
export async function markAsRead(id: number) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) console.error("❌ markAsRead:", error.message);
}

// 🧹 Mark all as read for a user
export async function markAllAsRead(user_id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user_id);

  if (error) console.error("❌ markAllAsRead:", error.message);
}

// 🔄 Realtime listener for live notifications
export function subscribeToNotifications(user_id: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`notifications:${user_id}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user_id}` },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
