import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 🧠 1️⃣ Verify Admin Access
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userEmail = session?.user?.email || "";

    const isAdmin =
      userEmail.endsWith("@solarizesolutions.com.ng") ||
      userEmail.endsWith("@falconerone.com");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized — Admin access required." },
        { status: 403 }
      );
    }

    // 🧩 2️⃣ Run Aggregation SQL Function
    const { error } = await supabase.rpc("update_giveaway_daily_stats");

    if (error) {
      console.error("Aggregation Error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to refresh analytics.", error },
        { status: 500 }
      );
    }

    // ✅ 3️⃣ Return Success Response
    return NextResponse.json({
      success: true,
      message: "Giveaway analytics successfully refreshed.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: err },
      { status: 500 }
    );
  }
}
