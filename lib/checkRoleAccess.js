import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function checkRoleAccess(allowedRoles = []) {
  try {
    const supabase = createClientComponentClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { authorized: false, role: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.role) {
      return { authorized: false, role: null };
    }

    const authorized = allowedRoles.includes(profile.role);
    return { authorized, role: profile.role };
  } catch (err) {
    console.error("checkRoleAccess error:", err);
    return { authorized: false, role: null };
  }
}
