// lib/realtime.ts
// Utilities for broadcasting and subscribing to the global winner event.
// Works for server-side broadcasts (service role) and lightweight client-side subscription helpers.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

type BroadcastPayload = {
  giveaway_id: string;
  giveaway_title?: string | null;
  prize_name?: string | null;
  prize_image?: string | null;
  winner_id?: string | null;
  winner_name?: string | null;
  winner_email?: string | null;
  winner_phone?: string | null;
  announced_at?: string | null;
};

// ---------- Server broadcast (use SUPABASE_SERVICE_ROLE_KEY) ----------
export async function broadcastWinnerEvent(payload: BroadcastPayload) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("broadcastWinnerEvent: missing SUPABASE env keys, skipping broadcast");
    return { ok: false, reason: "env_missing" };
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const channel = admin.channel("global_winner_event", {
      config: { broadcast: { ack: true } },
    });

    await channel.send({
      type: "broadcast",
      event: "winner_celebration",
      payload,
    });

    // try to cleanup (best-effort)
    try {
      if (typeof (channel as any).unsubscribe === "function") {
        await (channel as any).unsubscribe();
      } else if (typeof (admin as any).removeChannel === "function") {
        await (admin as any).removeChannel(channel);
      }
    } catch (e) {
      // ignore cleanup failure
    }

    return { ok: true };
  } catch (err) {
    console.warn("broadcastWinnerEvent failed:", err);
    return { ok: false, reason: err };
  }
}

// ---------- Client subscribe helper (works in browser) ----------
export function createClientSubscriber(): {
  client?: SupabaseClient;
  subscribe: (onEvent: (payload: BroadcastPayload) => void) => any;
  unsubscribe: (sub: any) => void;
} {
  if (typeof window === "undefined") {
    // Not in browser
    return {
      client: undefined,
      subscribe: () => null,
      unsubscribe: () => null,
    };
  }

  // prefer global import from a shared client location if present
  // otherwise create a lightweight client using public keys
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const client = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: true },
  });

  function subscribe(onEvent: (payload: BroadcastPayload) => void) {
    // Support v2 "channel().on('broadcast')" if available
    try {
      // @ts-ignore
      if (typeof (client as any).channel === "function") {
        const ch = (client as any)
          .channel("global_winner_event")
          .on(
            "broadcast",
            { event: "winner_celebration" },
            (p: any) => {
              // payload is p.payload (send wraps it)
              const pl = p?.payload ?? p;
              onEvent(pl);
            }
          )
          .subscribe();
        return ch;
      }
    } catch (e) {
      // fallback
      // eslint-disable-next-line no-console
      console.warn("realtime subscribe v2 failed", e);
    }

    // v1 fallback: .from('...').on('broadcast') is not standard;
    // fallback to listening on table changes as backup (less preferred)
    try {
      // listen to giveaways updates
      const sub = (client as any)
        .from("giveaways")
        .on("UPDATE", (p: any) => {
          const rec = p.new ?? p.record ?? p;
          if (rec?.winner_id) {
            onEvent(rec);
          }
        })
        .subscribe();
      return sub;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("realtime subscribe fallback failed", e);
      return null;
    }
  }

  function unsubscribe(sub: any) {
    if (!sub) return;
    try {
      if (typeof (client as any).removeChannel === "function") {
        (client as any).removeChannel(sub);
        return;
      }
    } catch (e) {
      // ignore
    }
    try {
      if (typeof sub.unsubscribe === "function") {
        sub.unsubscribe();
        return;
      }
    } catch (e) {
      // ignore
    }
    try {
      if (typeof (client as any).removeSubscription === "function") {
        (client as any).removeSubscription(sub);
      }
    } catch (e) {
      // ignore
    }
  }

  return { client, subscribe, unsubscribe };
}
