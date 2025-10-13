// /lib/checkRoleAccess.js
import { supabase } from "@/lib/supabaseClient";

export async function checkRoleAccess(requiredRoles = []) {
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

