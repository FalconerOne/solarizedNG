import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    res.status(500).json({ error: "Missing Supabase environment variables" });
    return;
  }

  const supabase = createClient(url, key);

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      res.status(200).json(data || []);
    } else if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing id" });
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
      res.status(200).json({ success: true });
    } else {
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error("Error in /api/admin/history:", err);
    res.status(500).json({ error: err.message });
  }
}
