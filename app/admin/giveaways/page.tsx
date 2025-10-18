'use client';

import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Loader2, Gift, Trophy } from 'lucide-react';

interface Giveaway {
  id: string;
  title: string;
  prize: string;
  status: string;
  created_at: string;
}

interface Winner {
  winner_id: string;
  winner_name: string;
  winner_email: string;
  giveaway_title: string;
  prize_name: string;
  finalized_at: string;
}

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState<string | null>(null);
  const [winnerInfo, setWinnerInfo] = useState<Winner | null>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);

  // Fetch all giveaways for admin
  const fetchGiveaways = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('giveaways')
      .select('id, title, prize, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error loading giveaways');
      console.error(error);
    } else {
      setGiveaways(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGiveaways();
  }, []);

  // Canvas confetti trigger
  const runConfetti = () => {
    if (!confettiRef.current) return;
    const myCanvas = confettiRef.current;
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FF4500', '#00FF7F'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FF4500', '#00FF7F'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Finalize winner handler
  const finalizeWinner = async (giveawayId: string) => {
    setFinalizing(giveawayId);
    const {
      data: {
        user: { id: adminId },
      },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc('finalize_giveaway_winner', {
      giveaway_id: giveawayId,
      admin_id: adminId,
    });

    if (error) {
      toast.error(error.message || 'Error finalizing winner');
      console.error(error);
      setFinalizing(null);
      return;
    }

    if (data && data.length > 0) {
      const winner = data[0];
      setWinnerInfo(winner);
      toast.success(`Winner finalized: ${winner.winner_name}`);
      runConfetti();

      // 🔔 Realtime broadcast for global celebration
      await supabase
        .from('global_notifications')
        .insert({
          id: crypto.randomUUID(),
          type: 'winner_announcement',
          title: `${winner.giveaway_title}`,
          message: `${winner.winner_name} just won ${winner.prize_name}!`,
          created_at: new Date().toISOString(),
        });

      // Refresh list
      fetchGiveaways();
    }
    setFinalizing(null);
  };

  return (
    <div className="p-6 space-y-8">
      <Card className="border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="text-yellow-500" /> Admin Giveaways Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : giveaways.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No giveaways found.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giveaways.map((g) => (
                <motion.div
                  key={g.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white relative"
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h2 className="font-semibold text-lg">{g.title}</h2>
                      <p className="text-sm text-gray-500">
                        Prize: {g.prize}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Status:{' '}
                        <span
                          className={`font-medium ${
                            g.status === 'active'
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {g.status}
                        </span>
                      </p>
                    </div>
                    <div className="mt-4">
                      {g.status === 'finalized' ? (
                        <Button disabled variant="outline" className="w-full">
                          <Gift className="mr-2 h-4 w-4" /> Winner Finalized
                        </Button>
                      ) : (
                        <Button
                          onClick={() => finalizeWinner(g.id)}
                          disabled={!!finalizing}
                          className="w-full bg-gradient-to-r from-yellow-400 to-red-500 text-white"
                        >
                          {finalizing === g.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                              Finalizing...
                            </>
                          ) : (
                            <>
                              <Trophy className="mr-2 h-4 w-4" /> Finalize Winner
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Winner info modal */}
      {winnerInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setWinnerInfo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
          >
            <Trophy className="mx-auto text-yellow-500 mb-3 h-10 w-10" />
            <h2 className="text-xl font-semibold mb-2">Winner Finalized!</h2>
            <p className="text-gray-600 mb-1">{winnerInfo.winner_name}</p>
            <p className="text-gray-500 text-sm mb-3">
              won <strong>{winnerInfo.prize_name}</strong>
            </p>
            <Button onClick={() => setWinnerInfo(null)} className="w-full">
              Close
            </Button>
          </div>
        </motion.div>
      )}

      <canvas
        ref={confettiRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      />
    </div>
  );
}
