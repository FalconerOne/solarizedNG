'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import confetti from 'canvas-confetti';
import Image from 'next/image';

interface WinnerData {
  title: string;
  message: string;
  prize_image?: string | null;
  target_user?: string | null;
}

export default function WinnerCelebrationModal() {
  const supabase = createClientComponentClient();
  const [show, setShow] = useState(false);
  const [winnerData, setWinnerData] = useState<WinnerData | null>(null);

  const launchConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 9999 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  useEffect(() => {
    const channel = supabase
      .channel('winner-celebration-popup')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const data = payload.new as any;
          if (data.type === 'winner_announcement') {
            const winner: WinnerData = {
              title: data.title,
              message:
                data.target_user === null
                  ? '🎉 A giveaway just had a winner! Activate your account to view full details.'
                  : data.message,
              prize_image: data.prize_image,
              target_user: data.target_user,
            };
            setWinnerData(winner);
            setShow(true);
            launchConfetti();
            setTimeout(() => setShow(false), 10000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (!show || !winnerData) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-[90%] animate-fadeIn"
        onClick={() => setShow(false)}
      >
        <h2 className="text-2xl font-bold text-primary mb-4">
          {winnerData.title}
        </h2>
        <p className="text-lg mb-4">{winnerData.message}</p>
        {winnerData.prize_image && (
          <div className="flex justify-center mb-4">
            <Image
              src={winnerData.prize_image}
              alt="Prize"
              width={180}
              height={180}
              className="rounded-xl object-cover"
            />
          </div>
        )}
        <p className="text-sm text-gray-500">(Click anywhere to close)</p>
      </div>
    </div>
  );
}
