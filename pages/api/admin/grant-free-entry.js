import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { giveawayId } = req.body;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ message: "Missing env" });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // find previous winners across all giveaways (you could scope to a specific giveaway)
    const { data: winners } = await supabase
      .from("winners")
      .select("user_id")
      .order("created_at", { ascending: false });

    if (!winners || winners.length === 0) return res.status(200).json({ message: "No winners found" });

    // build entries for current giveaway
    const inserts = winners.map(w => ({
      user_id: w.user_id,
      giveaway_id: giveawayId,
      is_activated: true,
      is_free_entry: true,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase.from("entries").insert(inserts);
    if (error) return res.status(500).json({ message: error.message });

    return res.status(200).json({ ok: true, count: inserts.length });
  } catch (err) {
    return res.status(500).json({ message: String(err) });
  }
}
