import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getDashboardData } from "@/lib/dashboardData";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 🔒 1️⃣ Get session and validate user role
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    // Fetch user role securely
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied: Admins only" },
        { status: 403 }
      );
    }

    // 🧮 2️⃣ Fetch dashboard metrics using existing server function
    const dashboardData = await getDashboardData();

    // ✅ 3️⃣ Return JSON response
    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error: any) {
    console.error("Admin Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
