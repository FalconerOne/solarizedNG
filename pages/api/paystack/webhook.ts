import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { supabase } from "../../../lib/supabaseClient";

export const config = {
  api: {
    bodyParser: false, // disable automatic body parsing
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const buf = await getRawBody(req);
  const sig = req.headers["x-paystack-signature"] as string || "";
  const secret = process.env.PAYSTACK_SECRET_KEY || "";

  const hmac = crypto.createHmac("sha512", secret).update(buf).digest("hex");

  if (hmac !== sig) {
    console.warn("Invalid signature", hmac, sig);
    return res.status(401).json({ error: "invalid signature" });
  }

  const event = JSON.parse(buf.toString());

  try {
    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;
      const amount = data.amount / 100;
      const customerEmail = data.customer.email;

      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("email", customerEmail)
        .single();

      if (user) {
        await supabase
          .from("users")
          .update({
            activated: true,
            activation_amount: amount,
            activated_at: new Date(),
          })
          .eq("id", user.id);

        await supabase.from("payments").insert([
          {
            user_id: user.id,
            reference,
            amount,
            status: "completed",
            gateway: "paystack",
          },
        ]);

        await supabase.from("message_queue").insert([
          {
            user_id: user.id,
            message: "Activation successful! Good luck.",
            channel: "in-app",
          },
        ]);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Webhook handling error", err);
    return res.status(500).json({ error: "handler error" });
  }
}
