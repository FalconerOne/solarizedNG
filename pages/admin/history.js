// pages/api/admin/history.js
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("❌ Missing Supabase environment variables");
    res.status(500).json({ error: "Missing Supabase credentials" });
    return;
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
      res.status(200).json(data || []);
      return;
    }

    if (req.method === "DELETE") {
      const id = req.query.id;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }

      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;

      res.status(200).json({ success: true });
      return;
    }

    res.setHeader("Allow", ["GET", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("❌ /api/admin/history error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
