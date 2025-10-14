// /lib/logActivity.js
import { supabase } from "@/lib/supabaseClient";

/**
 * Logs a user action to the activity_log table
 *
 * @param {string} userId - Supabase Auth user ID
 * @param {string} role - user role ('admin', 'supervisor', 'user', etc.)
 * @param {string} action - short keyword like 'LOGIN', 'UPDATE_PROFILE'
 * @param {string} details - optional description of what happened
 */
export async function logActivity(userId, role, action, details = "") {
  if (!userId || !action) {
    console.warn("logActivity: missing userId or action");
    return;
  }

  const { error } = await supabase.from("activity_log").insert([
    {
      user_id: userId,
      role,
      action,
      details,
    },
  ]);

  if (error) {
    console.error("Failed to log activity:", error.message);
  }
}
