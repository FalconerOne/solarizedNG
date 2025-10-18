'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface Giveaway {
  id: string;
  title: string;
  description: string;
  status: string;
  winner_id?: string | null;
  winner_name?: string | null;
}

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(false);

  // 🧹 Auto-clean expired notifications on mount
  const cleanExpiredNotifications = useCallback(async () => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Notification cleanup error:', error);
    }
  }, [supabase]);

  // 🧠 Load all giveaways
  const fetchGiveaways = useCallback(async () => {
    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Fetch error:', error);
    else setGiveaways(data || []);
  }, [supabase]);

  // 🥳 Confetti animation
  const launchConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      });
    }, 250);
  };

  // 🎯 Finalize winner (RPC call)
  const finalizeWinner = async (giveawayId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('finalize_giveaway_winner', {
        giveaway_id: giveawayId,
      });

      if (error) throw error;

      toast.success('Winner finalized successfully!');
      launchConfetti();
      fetchGiveaways();
    } catch (err: any) {
      console.error('Finalize winner error:', err);
      toast.error('Failed to finalize winner.');
    } finally {
      setLoading(false);
    }
  };

  // 📡 Realtime broadcast listener
  useEffect(() => {
    const channel = supabase
      .channel('global-winner-broadcast')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const notification = payload.new as any;
          if (notification.type === 'winner_announcement') {
            // Masked or full message based on visibility
            const message =
              notification.target_user === null
                ? '🎉 A giveaway just had a winner! Activate your account to view details.'
                : `🎊 ${notification.title}: ${notification.message}`;
            toast.info(message);
            launchConfetti();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    cleanExpiredNotifications();
    fetchGiveaways();
  }, [fetchGiveaways, cleanExpiredNotifications]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎁 Admin Giveaways</h1>
      {giveaways.length === 0 && (
        <p className="text-muted-foreground">No giveaways yet.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {giveaways.map((giveaway) => (
          <Card key={giveaway.id} className="shadow-md">
            <CardHeader>
              <CardTitle>{giveaway.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{giveaway.description}</p>
              <p className="text-xs mb-2">
                Status: <strong>{giveaway.status}</strong>
              </p>
              {giveaway.winner_name ? (
                <p className="text-green-600 font-medium">
                  Winner: {giveaway.winner_name}
                </p>
              ) : (
                <Button
                  disabled={loading}
                  onClick={() => finalizeWinner(giveaway.id)}
                  className="mt-2"
                >
                  {loading ? 'Processing...' : 'Finalize Winner'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
