'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient'; // <-- Change this import if your supabase client is in another path
import clsx from 'clsx';

/**
 * Admin Giveaways Page
 * - List giveaways
 * - View entries for a giveaway
 * - Finalize a winner (server-side call)
 * - Realtime listener -> triggers global celebration (confetti)
 *
 * Paste this file at: app/admin/giveaways/page.tsx
 */

/* ----------------------------- Helpers ----------------------------- */

function maskEmail(email: string | null | undefined) {
  if (!email) return 'hidden';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const first = local[0] ?? '';
  return `${first}***@${domain}`;
}

function maskPhone(phone: string | null | undefined) {
  if (!phone) return 'hidden';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 3) return '***';
  const lastTwo = digits.slice(-2);
  return `${'*'.repeat(Math.max(0, digits.length - 2))}${lastTwo}`;
}

/* Simple toast-like alert */
function smallAlert(msg: string) {
  // simple fallback; adapt to your toast system
  // e.g., if you have a Toast component, call it here
  // For now we use alert() so it works out-of-the-box
  // (You can replace this with your project's toast)
  alert(msg);
}

/* -------------------------- Confetti System ------------------------- */

/**
 * Lightweight canvas confetti implementation
 * - Creates particles and animates them
 * - Auto-cleans up once animation completes
 */
function fireConfetti(canvas: HTMLCanvasElement, opts?: { duration?: number; particleCount?: number }) {
  const duration = opts?.duration ?? 3500;
  const particleCount = opts?.particleCount ?? 90;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = (canvas.width = canvas.clientWidth || window.innerWidth);
  const h = (canvas.height = canvas.clientHeight || window.innerHeight);

  // create particles
  const particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rot: number;
    vr: number;
    life: number;
  }[] = [];

  const colors = ['#FFB703', '#FB8500', '#8ECAE6', '#219EBC', '#2A9D8F', '#F94144'];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 200,
      y: h / 4 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 6 + 2,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      life: Math.random() * 80 + 60,
    });
  }

  let raf = 0;
  const start = performance.now();

  function frame(now: number) {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      // gravity
      p.vy += 0.15;
      // apply velocity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    // remove dead particles
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    if (particles.length > 0 && t < duration + 1000) {
      raf = requestAnimationFrame(frame);
    } else {
      // finish and cleanup
      ctx.clearRect(0, 0, w, h);
      cancelAnimationFrame(raf);
      // remove canvas by parent if you created it externally
    }
  }

  raf = requestAnimationFrame(frame);
}

/* -------------------------- Main Component ------------------------- */

export default function AdminGiveawaysPage() {
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGiveaway, setSelectedGiveaway] = useState<any | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [pendingWinnerId, setPendingWinnerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // For celebration UI
  const [celebration, setCelebration] = useState<{
    winnerName?: string;
    winnerEmailMasked?: string;
    winnerPhoneMasked?: string;
    giveawayTitle?: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const winnerSubscriptionRef = useRef<any | null>(null);

  /* -------------------- Fetch giveaways list -------------------- */
  async function fetchGiveaways() {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('giveaways')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setGiveaways(data ?? []);
    } catch (err: any) {
      console.error('fetchGiveaways error', err);
      smallAlert('Could not load giveaways: ' + (err.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  }

  /* -------------------- Fetch entries for a giveaway -------------------- */
  async function fetchEntriesForGiveaway(giveawayId: string) {
    setEntriesLoading(true);
    try {
      // Fetch entries for the giveaway
      const { data: entriesData, error: entriesError } = await supabaseClient
        .from('entries')
        .select('id, user_id')
        .eq('giveaway_id', giveawayId)
        .order('created_at', { ascending: true });
      if (entriesError) throw entriesError;

      const userIds = (entriesData ?? []).map((r: any) => r.user_id).filter(Boolean);

      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: pData, error: pError } = await supabaseClient
          .from('profiles')
          .select('id, full_name, email, phone_number')
          .in('id', userIds);
        if (pError) throw pError;
        profiles = pData ?? [];
      }

      // Merge entries with profile data
      const merged = (entriesData ?? []).map((e: any) => {
        const profile = profiles.find((p) => p.id === e.user_id) ?? null;
        return { ...e, profile };
      });

      setEntries(merged);
    } catch (err: any) {
      console.error('fetchEntriesForGiveaway', err);
      smallAlert('Could not load entries: ' + (err.message ?? String(err)));
    } finally {
      setEntriesLoading(false);
    }
  }

  /* -------------------- Finalize winner (server-side) -------------------- */
  async function finalizeWinner(giveawayId: string, winnerUserId: string) {
    setFinalizing(true);
    try {
      // Call your serverless endpoint that finalizes a winner:
      // Should: set winner row in winners table, update giveaway status, and broadcast event
      const res = await fetch('/api/admin/finalize-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId, winnerUserId }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error ?? 'Finalize failed');
      }

      // Expect server to return winner details (full_name, email, phone_number, giveaway_title)
      const winner = payload?.winner;
      if (winner) {
        // Mask email and phone per requirements and trigger the confetti celebration locally
        setCelebration({
          winnerName: winner.full_name ?? 'Winner',
          winnerEmailMasked: maskEmail(winner.email),
          winnerPhoneMasked: maskPhone(winner.phone_number),
          giveawayTitle: payload?.giveaway_title ?? selectedGiveaway?.title ?? '',
        });

        // Reset modal & reload giveaways
        setModalOpen(false);
        setPendingWinnerId(null);
        await fetchGiveaways();
        smallAlert('Winner finalized successfully.');
      } else {
        smallAlert('Winner finalized but no winner data returned from server.');
      }
    } catch (err: any) {
      console.error('finalizeWinner error', err);
      smallAlert('Finalize error: ' + (err.message ?? String(err)));
    } finally {
      setFinalizing(false);
    }
  }

  /* -------------------- Realtime subscription to winners -------------------- */
  function subscribeToWinnerEvents() {
    try {
      // unsubscribe previous if any
      if (winnerSubscriptionRef.current) {
        try {
          winnerSubscriptionRef.current.unsubscribe();
        } catch (e) {
          // ignore
        }
      }

      const ch = supabaseClient.channel('public-winners-channel');

      ch.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'winners' },
        (payload: any) => {
          try {
            const newWinner = payload.new;
            // Expect newWinner to include winner_profile (or winner_user fields)
            const full_name = newWinner?.winner_name ?? newWinner?.full_name ?? newWinner?.winner_user_full_name;
            const email = newWinner?.email ?? newWinner?.winner_email ?? null;
            const phone = newWinner?.phone_number ?? newWinner?.winner_phone ?? null;
            const giveaway_title = newWinner?.giveaway_title ?? newWinner?.title ?? null;

            setCelebration({
              winnerName: full_name ?? 'Winner',
              winnerEmailMasked: maskEmail(email),
              winnerPhoneMasked: maskPhone(phone),
              giveawayTitle: giveaway_title ?? '',
            });
          } catch (e) {
            console.error('realtime on winners payload handling error', e);
          }
        }
      );

      // subscribe
      ch.subscribe((status: any) => {
        // status maybe 'SUBSCRIBED' or an object; we ignore errors here
        // store ref to unsubscribe later
        winnerSubscriptionRef.current = ch;
      });
    } catch (e) {
      console.warn('Could not subscribe to winner events', e);
    }
  }

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    fetchGiveaways();
    subscribeToWinnerEvents();

    // cleanup
    return () => {
      if (winnerSubscriptionRef.current) {
        try {
          winnerSubscriptionRef.current.unsubscribe();
        } catch (e) {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When celebration state updates, run confetti
  useEffect(() => {
    if (!celebration) return;
    // draw / animate confetti on canvas
    if (canvasRef.current) {
      fireConfetti(canvasRef.current, { duration: 3500, particleCount: 120 });
      // optional auto-clear celebration 12s later
      const t = setTimeout(() => setCelebration(null), 12000);
      return () => clearTimeout(t);
    }
  }, [celebration]);

  /* -------------------- UI Helpers -------------------- */

  function openFinalizeModal(giveaway: any) {
    setSelectedGiveaway(giveaway);
    setModalOpen(true);
    // fetch entries
    if (giveaway?.id) fetchEntriesForGiveaway(giveaway.id);
  }

  /* -------------------- Render -------------------- */

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <h1 className="text-2xl font-semibold mb-4">Admin / Giveaways</h1>

      <div className="space-y-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium">Giveaways</h2>
          {loading ? (
            <div className="py-6">Loading giveaways…</div>
          ) : giveaways.length === 0 ? (
            <div className="py-6 text-sm text-slate-600">No giveaways found.</div>
          ) : (
            <table className="w-full text-sm border-collapse mt-3">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Entries</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {giveaways.map((g) => (
                  <tr key={g.id} className="border-t">
                    <td className="p-2 align-top">
                      <div className="font-medium">{g.title}</div>
                      <div className="text-xs text-slate-500">{new Date(g.created_at).toLocaleString()}</div>
                    </td>
                    <td className="p-2 align-top">
                      {/* show approximate count; admin can view accurate */}
                      <div>{String(g.entry_count ?? '—')}</div>
                    </td>
                    <td className="p-2 align-top">
                      <div className={clsx('inline-block px-2 py-1 rounded text-xs', g.status === 'finalized' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                        {g.status ?? 'active'}
                      </div>
                    </td>
                    <td className="p-2 align-top">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                          onClick={() => openFinalizeModal(g)}
                        >
                          Finalize Winner
                        </button>
                        <button
                          onClick={() => {
                            // quick view entries
                            setSelectedGiveaway(g);
                            fetchEntriesForGiveaway(g.id);
                          }}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          View Entries
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Entries panel */}
        {selectedGiveaway && (
          <div className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Entries for: {selectedGiveaway.title}</h3>
                <div className="text-xs text-slate-500">Giveaway ID: {selectedGiveaway.id}</div>
              </div>
              <div className="text-xs text-slate-500">Entries: {entries.length}</div>
            </div>

            <div className="mt-3">
              {entriesLoading ? (
                <div>Loading entries…</div>
              ) : entries.length === 0 ? (
                <div className="text-sm text-slate-500">No entries yet.</div>
              ) : (
                <div className="grid gap-2">
                  {entries.map((en) => (
                    <div key={en.id} className="p-3 border rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{en.profile?.full_name ?? 'Unnamed'}</div>
                        <div className="text-xs text-slate-500">{maskEmail(en.profile?.email)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-slate-500">{maskPhone(en.profile?.phone_number)}</div>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="winner"
                            value={en.profile?.id}
                            checked={pendingWinnerId === en.profile?.id}
                            onChange={() => setPendingWinnerId(en.profile?.id)}
                          />
                          <span className="text-sm">Select</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Finalize confirmation modal */}
      {modalOpen && selectedGiveaway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-lg">
            <h4 className="text-lg font-semibold mb-2">Confirm Winner Finalization</h4>
            <p className="text-sm text-slate-600 mb-4">
              Finalizing a winner will mark the giveaway as finalized and notify participants. Confirm that the selected user is the official winner.
            </p>

            <div className="mb-3">
              <div className="text-xs text-slate-500">Selected Giveaway</div>
              <div className="font-medium">{selectedGiveaway.title}</div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-slate-500">Selected Winner</div>
              <div className="font-medium">{entries.find((e) => e.profile?.id === pendingWinnerId)?.profile?.full_name ?? '—'}</div>
              <div className="text-xs text-slate-500">{maskEmail(entries.find((e) => e.profile?.id === pendingWinnerId)?.profile?.email)}</div>
            </div>

            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 border rounded" onClick={() => { setModalOpen(false); setPendingWinnerId(null); }}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                disabled={!pendingWinnerId || finalizing}
                onClick={() => {
                  if (!pendingWinnerId) return smallAlert('Please select a winner first.');
                  // call finalize
                  finalizeWinner(selectedGiveaway.id, pendingWinnerId);
                }}
              >
                {finalizing ? 'Finalizing…' : 'Confirm & Finalize Winner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration overlay (shows winner masked details and runs confetti) */}
      {celebration && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pointer-events-none">
          <canvas ref={(el) => (canvasRef.current = el)} className="w-full h-full pointer-events-none" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-lg text-center max-w-md">
              <h3 className="text-xl font-bold">🎉 Winner Announced!</h3>
              <div className="mt-2 text-lg font-medium">{celebration.winnerName}</div>
              <div className="mt-1 text-sm text-slate-600">{celebration.winnerEmailMasked}</div>
              <div className="mt-1 text-sm text-slate-600">{celebration.winnerPhoneMasked}</div>
              <div className="mt-3 text-xs text-slate-500">{celebration.giveawayTitle}</div>
              <div className="mt-3">
                <button
                  onClick={() => setCelebration(null)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
