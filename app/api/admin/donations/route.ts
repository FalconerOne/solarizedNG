// app/api/admin/donations/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Donations endpoint:
 * - GET: return latest donations (admin)
 * - POST: record a donation (server-side)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export async function GET(req: Request) {
  try {
    const { data, error } = await admin.from("charity_donations").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json({ success: true, donations: data ?? [] });
  } catch (err: any) {
    console.error("donations GET error", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { donor_name, amount, currency = "USD", note, giveaway_id = null } = body;
    if (!donor_name || !amount) {
      return NextResponse.json({ success: false, error: "donor_name and amount are required" }, { status: 400 });
    }

    const { data: inserted, error } = await admin.from("charity_donations").insert([{
      donor_name,
      amount,
      currency,
      note,
      giveaway_id,
      created_at: new Date().toISOString()
    }]).select().single();

    if (error) throw error;

    // log and broadcast donation notification (optional)
    await admin.from("admin_activity_log").insert([{ action: "donation_recorded", details: JSON.stringify(inserted), created_at: new Date().toISOString() }]);

    return NextResponse.json({ success: true, donation: inserted });
  } catch (err: any) {
    console.error("donations POST error", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
