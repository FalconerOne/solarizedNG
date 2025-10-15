// pages/api/admin/test.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({
        ok: false,
        message: "Missing Supabase environment variables",
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 🔍 Try to read from a small, safe table
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email")
      .limit(1);

    if (error) {
      return res.status(500).json({
        ok: false,
        message: "Supabase connection failed",
        error: error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Supabase connection successful ✅",
      sample: data,
    });
  } catch (err) {
    console.error("Test API error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
}
