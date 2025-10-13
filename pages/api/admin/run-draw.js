// pages/api/admin/run-draw.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  // In Vercel set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PROJECT_REF in Project Settings > Environment Variables
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const PROJECT_REF = process.env.SUPABASE_PROJECT_REF; // e.g. yacftysswuumjbrfarmx
  if (!SERVICE_KEY || !PROJECT_REF) return res.status(500).json({ message: "Missing server env" });

  try {
    const fnUrl = `https://${PROJECT_REF}.functions.supabase.co/auto_pick_winners`;
    const r = await fetch(fnUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const text = await r.text();
    return res.status(r.status).send({ ok: r.ok, body: text });
  } catch (err) {
    return res.status(500).json({ message: String(err) });
  }
}
