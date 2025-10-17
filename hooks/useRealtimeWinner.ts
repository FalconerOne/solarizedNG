// hooks/useRealtimeWinner.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import confetti from "canvas-confetti";
import { createClientSubscriber } from "@/lib/realtime";

type WinnerPayload = {
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

export function useRealtimeWinner() {
  const supabaseLocal = createClientComponentClient();
  const [currentWinner, setCurrentWinner] = useState<WinnerPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const subRef = useRef<any>(null);

  const runConfetti = useCallback(() => {
    try {
      const duration = 4000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (e) {
      // ignore confetti errors
      // eslint-disable-next-line no-console
      console.warn("confetti fail", e);
    }
  }, []);

  useEffect(() => {
    const { subscribe, unsubscribe } = createClientSubscriber();

    const onEvent = (payload: any) => {
      const pl: WinnerPayload = payload;
      // normalize: some broadcasts wrap payload under payload
      const normalized = (pl && (pl.payload ?? pl)) as WinnerPayload;
      setCurrentWinner(normalized);
      setVisible(true);
      runConfetti();
    };

    // subscribe
    const sub = subscribe(onEvent);
    subRef.current = sub;

    return () => {
      unsubscribe(subRef.current);
      subRef.current = null;
    };
  }, [runConfetti]);

  // Utility to programmatically trigger a celebration locally (for admin test)
  const triggerLocal = useCallback((payload: WinnerPayload) => {
    setCurrentWinner(payload);
    setVisible(true);
    runConfetti();
  }, [runConfetti]);

  return {
    currentWinner,
    visible,
    setVisible,
    triggerLocal,
  };
}
