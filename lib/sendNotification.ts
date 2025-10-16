// lib/sendNotification.ts

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * sendNotification()
 * Creates a new notification in the database and optionally triggers real-time subscriptions.
 * 
 * @param {Object} payload - Notification details
 * @param {string} payload.type - Type of event (e.g., 'giveaway_join', 'like', 'referral')
 * @param {string} payload.title - Notification title
 * @param {string} payload.message - Body content
 * @param {string} payload.target_user - Recipient type ('admin', 'supervisor', or a specific user_id)
 * @param {string} [payload.reference_id] - Optional related ID (giveaway, prize, etc.)
 */
export async function sendNotification(payload: {
  type: string;
  title: string;
  message: string;
  target_user: string;
  reference_id?: string;
}) {
  try {
    // Insert notification record into Supabase
    const { data, error } = await supabase.from("notifications").insert([
      {
        type: payload.type,
        title: payload.title,
        message: payload.message,
        target_user: payload.target_user,
        reference_id: payload.reference_id || null,
        created_at: new Date().toISOString(),
        read: false,
      },
    ]);

    if (error) {
      console.error("Notification insert error:", error.message);
      return { success: false, error: error.message };
    }

    // (Optional) Could add a real-time trigger for UI updates here later
    return { success: true, data };
  } catch (err: any) {
    console.error("sendNotification error:", err.message);
    return { success: false, error: err.message };
  }
}
