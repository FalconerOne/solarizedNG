// pages/api/admin/export-contacts.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; // public URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ message: "Missing env" });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Query contacts that are useful
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });

  // join with auth.users for email
  const emails = await supabase.from("users").select("id, email");
  const emailMap = {};
  emails.data?.forEach(u => { emailMap[u.id] = u.email });

  const rows = data.map(p => ({
    id: p.id,
    full_name: p.full_name || "",
    email: emailMap[p.id] || "",
    phone: p.phone || "",
    role: p.role || "",
    created_at: p.created_at || "",
  }));

  // CSV
  const header = "id,full_name,email,phone,role,created_at\n";
  const csv = header + rows.map(r => {
    return `${r.id},"${(r.full_name||"").replace(/"/g,'""')}",${r.email},${r.phone},${r.role},${r.created_at}`;
  }).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=contacts-${Date.now()}.csv`);
  res.status(200).send(csv);
}
