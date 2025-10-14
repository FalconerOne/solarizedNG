"use client";

import { useEffect, useState } from "react";
import { getPointsBalance, getDailyPoints, getPointsConfig } from "@/lib/supabase/rewards";

export default function PointsDisplay({ userId }: { userId: string }) {
  const [balance, setBalance] = useState(0);
  const [daily, setDaily] = useState(0);
  const [config, setConfig] = useState({ daily_cap: 500 });

  useEffect(() => {
    refresh();
  }, [userId]);

  async function refresh() {
    if (!userId) return;
    const [b, d, cfg] = await Promise.all([getPointsBalance(userId), getDailyPoints(userId), getPointsConfig()]);
    setBalance(b);
    setDaily(d);
    setConfig(cfg);
  }

  const pct = Math.min(100, Math.round((daily / config.daily_cap) * 100));

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-sm">Points Balance</p>
          <p className="text-slate-100 text-2xl font-semibold">{balance}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm">Today's points</p>
          <p className="text-slate-100 font-medium">{daily} / {config.daily_cap}</p>
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-full mt-3 h-2 overflow-hidden">
        <div style={{ width: `${pct}%` }} className="h-2 bg-cyan-500 rounded-full transition-all" />
      </div>
    </div>
  );
}
