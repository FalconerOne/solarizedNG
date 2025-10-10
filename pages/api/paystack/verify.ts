import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { reference, user_id } = req.body;
  if (!reference || !user_id) return res.status(400).json({ error: 'missing params' });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'paystack not configured' });

  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });

    const j: any = await r.json(); // 👈 This line tells TS to relax type checking

    if (j && j.status && j.data && j.data.status === 'success') {
      const { error } = await supabase
        .from('users')
        .update({
          activated: true,
          activation_amount: j.data.amount / 100,
          activated_at: new Date(),
        })
        .eq('id', user_id);

      await supabase.from('payments').insert([
        {
          user_id,
          reference,
          amount: j.data.amount / 100,
          status: 'completed',
          gateway: 'paystack',
        },
      ]);

      await supabase.from('message_queue').insert([
        {
          user_id,
          message: 'Activation successful! Good luck.',
          channel: 'in-app',
        },
      ]);

      return res.status(200).json({ ok: true, data: j.data });
    } else {
      return res.status(400).json({ ok: false, error: j?.message || 'not successful' });
    }
  } catch (err: any) {
    console.error('Paystack verify error:', err);
    return res.status(500).json({ error: 'verify failed' });
  }
}
