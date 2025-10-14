// /lib/supabase/eligibility.ts
import { supabase } from "./client";

export interface ViewerProfile {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  activated?: boolean | null;
  role?: string | null;
  is_admin?: boolean | null;
}

/** Get the current session's user id (or null) */
export async function getViewerId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id ?? null;
  } catch (e) {
    console.error("getViewerId error", e);
    return null;
  }
}

/** Fetch profile row for a given user id (profiles table). Returns null if not found. */
export async function fetchViewerProfile(userId?: string | null): Promise<ViewerProfile | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from<ViewerProfile>("profiles")
    .select("id, username, avatar_url, activated, role, is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("fetchViewerProfile error", error);
    return null;
  }
  return data ?? null;
}

/** Lightweight admin check */
export function isAdmin(profile: ViewerProfile | null): boolean {
  if (!profile) return false;
  const role = (profile.role ?? "").toLowerCase();
  return role === "admin" || role === "staff" || profile.is_admin === true;
}

/** Lightweight activated check */
export function isActivated(profile: ViewerProfile | null): boolean {
  return !!profile?.activated;
}

/**
 * Subscribe to profile changes for a specific userId.
 * callback(newProfileOrNull) runs when a row is INSERT/UPDATE/DELETE for that user occurs.
 * Returns an unsubscribe function.
 */
export function subscribeToProfile(userId: string | null, callback: (p: ViewerProfile | null) => void) {
  if (!userId) return () => {};
  // use Realtime channel on the profiles table for that user
  const chan = supabase
    .channel(`profile-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
      (payload) => {
        // payload.record is the new row for INSERT/UPDATE, null on DELETE
        callback(payload?.record ?? null);
      }
    )
    .subscribe();
  return () => {
    try {
      supabase.removeChannel(chan);
    } catch (e) {
      // best-effort cleanup
    }
  };
}
