// pages/api/admin/notification-stats.js
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("segment, recipient_count, created_at")
      .eq("type", "broadcast")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return res.status(200).json({ total: 0, segments: {}, latest: null });

    const total = data.length;
    const segments = data.reduce((acc, row) => {
      acc[row.segment] = (acc[row.segment] || 0) + row.recipient_count;
      return acc;
    }, {});

    const latest = data[0]?.created_at;

    res.status(200).json({ total, segments, latest });
  } catch (err) {
    console.error("notification-stats error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
