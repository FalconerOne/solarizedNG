"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, getReferralStats } from "@/lib/supabase/referrals";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface LeaderEntry {
  referrer_id: string;
  total_referrals: number;
}

export default function ReferralsPanel({ userId }: { userId: string }) {
  const [stats, setStats] = useState({ totalReferrals: 0, converted: 0, pending: 0 });
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    const [refData, boardData] = await Promise.all([
      getReferralStats(userId),
      getLeaderboard(),
    ]);
    setStats(refData);
    setLeaders(boardData);
  }

  function copyReferralLink() {
    const link = `${window.location.origin}/join?ref=${userId}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-slate-900 rounded-2xl p-6 border border-slate-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-slate-200 text-lg mb-3 font-medium">Your Referrals</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="Total" value={stats.totalReferrals} />
          <Stat label="Converted" value={stats.converted} />
          <Stat label="Pending" value={stats.pending} />
        </div>
        <button
          onClick={copyReferralLink}
          className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg"
        >
          Copy Referral Link
        </button>
      </motion.div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-slate-200 text-lg mb-3 font-medium">Top Referrers</h3>
        <ul className="space-y-2">
          {leaders.map((l, i) => (
            <li
              key={l.referrer_id}
              className="flex justify-between text-slate-400 bg-slate-800/40 p-2 rounded-md"
            >
              <span>
                #{i + 1} User {l.referrer_id.slice(0, 6)}...
              </span>
              <span className="text-slate-200 font-medium">
                {l.total_referrals} referrals
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl text-slate-100 font-semibold">{value}</p>
    </div>
  );
}

