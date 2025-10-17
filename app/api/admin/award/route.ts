// app/api/admin/award/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Award (create prize) endpoint:
 * - POST: create prize record and attach to giveaway (optional)
 * Body: { title, description, giveaway_id?, image_url? }
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description = null, giveaway_id = null, image_url = null } = body;
    if (!title) {
      return NextResponse.json({ success: false, error: "title required" }, { status: 400 });
    }

    const { data: prize, error } = await admin.from("prizes").insert([{
      title,
      description,
      giveaway_id,
      image_url,
      created_at: new Date().toISOString()
    }]).select().single();

    if (error) throw error;

    await admin.from("admin_activity_log").insert([{ action: "create_prize", target_id: prize.id, details: JSON.stringify(prize), created_at: new Date().toISOString() }]);

    return NextResponse.json({ success: true, prize });
  } catch (err: any) {
    console.error("award POST error", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
