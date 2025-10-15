import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be server-side only
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, message } = req.body;

  const { data: users } = await supabase.from("profiles").select("id");
  const notifications = users.map((u) => ({
    user_id: u.id,
    title,
    message,
    type: "broadcast",
  }));

  await supabase.from("notifications").insert(notifications);
  res.status(200).json({ success: true });
}
