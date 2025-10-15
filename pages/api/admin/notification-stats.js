// pages/api/admin/notification-stats.js
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

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

    data.forEach((n) => {
      if (!segments[n.segment]) segments[n.segment] = 0;
      segments[n.segment] += n.recipient_count || 0;
    });

    return res.status(200).json({ total, latest, segments });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: err.message });
  }
};
