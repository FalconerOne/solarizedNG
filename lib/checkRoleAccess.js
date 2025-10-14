// /lib/checkRoleAccess.js
import { supabase } from "@/lib/supabaseClient";

/**
 * Async version — for server-side or route guards
 */
export async function checkRoleAccessAsync(requiredRoles = []) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { authorized: false, role: null };

  const { user } = session;

  // Fetch profile for role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "user";
  const authorized =
    requiredRoles.length === 0 || requiredRoles.includes(role);

  return { authorized, role };
}

/**
 * Sync version — for components like Sidebar
 */
export default function checkRoleAccess(requiredRoles = [], userRole) {
  if (!requiredRoles?.length) return true; // public or unrestricted
  return requiredRoles.includes(userRole);
}
