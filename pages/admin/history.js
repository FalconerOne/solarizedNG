// pages/api/admin/history.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: "Missing Supabase environment vars" });
  }

  const supabase = createClient(url, key);

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("type", "broadcast")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing ID" });

      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("History API error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
