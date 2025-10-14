import { supabase } from "./client";

export interface GiveawayStats {
  id: string;
  title: string;
  entryCount: number;
  shareCount: number;
}

export interface AnalyticsTotals {
  totalEntries: number;
  totalShares: number;
  totalGiveaways: number;
}

export interface AnalyticsData {
  giveawayStats: GiveawayStats[];
  totals: AnalyticsTotals;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [entriesRes, sharesRes, giveawaysRes] = await Promise.all([
    supabase.from("entries").select("id, giveaway_id"),
    supabase.from("shares").select("id, giveaway_id"),
    supabase.from("giveaways").select("id, title"),
  ]);

  if (entriesRes.error || sharesRes.error || giveawaysRes.error) {
    console.error(
      "Analytics fetch error",
      entriesRes.error || sharesRes.error || giveawaysRes.error
    );
    return {
      giveawayStats: [],
      totals: { totalEntries: 0, totalShares: 0, totalGiveaways: 0 },
    };
  }

  const giveaways = giveawaysRes.data || [];
  const entries = entriesRes.data || [];
  const shares = sharesRes.data || [];

  const giveawayStats: GiveawayStats[] = giveaways.map((g) => {
    const entryCount = entries.filter((e) => e.giveaway_id === g.id).length;
    const shareCount = shares.filter((s) => s.giveaway_id === g.id).length;
    return { id: g.id, title: g.title, entryCount, shareCount };
  });

  const totals: AnalyticsTotals = {
    totalEntries: entries.length,
    totalShares: shares.length,
    totalGiveaways: giveaways.length,
  };

  return { giveawayStats, totals };
}
