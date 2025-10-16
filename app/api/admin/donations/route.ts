import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Fetch all donation records (admin view)
  const { data, error } = await supabase
    .from("charity_donations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  const { amount, organization, description } = body;
  if (!amount || !organization)
    return NextResponse.json(
      { error: "Missing required fields: amount or organization" },
      { status: 400 }
    );

  // Get current user (must be admin)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Insert donation entry
  const { data, error } = await supabase
    .from("charity_donations")
    .insert([
      {
        amount,
        organization,
        description: description || "",
        created_by: user.id,
      },
    ])
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, data });
}
