// pages/api/admin/notification-stats.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("segment, created_at, recipient_count")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const total = data.length;
    const latest = data[0]?.created_at || null;
    const segments = {};

    for (const row of data) {
      if (!segments[row.segment]) segments[row.segment] = 0;
      segments[row.segment] += row.recipient_count || 0;
    }

    return res.status(200).json({
      total,
      latest,
      segments,
    });
  } catch (err) {
    console.error("Stats API error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
