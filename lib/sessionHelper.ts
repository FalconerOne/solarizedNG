import { supabase } from "./supabaseClient";

// Refresh session automatically on app load
export async function restoreSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) console.error("Session restore error:", error);
  return session;
}
