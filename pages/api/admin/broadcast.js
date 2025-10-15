// pages/api/admin/broadcast.js
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  try {
    const { title, message, segment = "all" } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Missing title or message" });
    }

    // 🎯 Filter users by segment
    let query = supabase.from("users").select("id, email").eq("status", "active");
    if (segment === "activated") query = query.eq("is_activated", true);
    if (segment === "supervisors") query = query.eq("role", "supervisor");

    const { data: users, error: userErr } = await query;
    if (userErr) throw userErr;

    const count = users?.length || 0;

    // 📦 Save broadcast record
    const { error: insertErr } = await supabase.from("notifications").insert([
      {
        title,
        message,
        type: "broadcast",
        segment,
        recipient_count: count,
        created_at: new Date().toISOString(),
      },
    ]);
    if (insertErr) throw insertErr;

    // (Optional) Could later add email/push sending here

    return res.status(200).json({ success: true, count });
  } catch (err) {
    console.error("Broadcast error:", err);
    res.status(500).json({ error: err.message });
  }
};
