"use client";

import { useEffect, useState } from "react";
import ExportButtons from "@/components/analytics/ExportButtons";
import AnimatedCard from "@/components/ui/AnimatedCard";
import Shimmer from "@/components/ui/Shimmer";
import { supabase } from "@/lib/supabaseClient";

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: analyticsData, error } = await supabase
        .from("analytics_view")
        .select("*");

      if (!error && analyticsData) setData(analyticsData);
      setIsLoading(false);
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Engagement Overview */}
      <AnimatedCard>
        <h2 className="text-lg font-semibold mb-2">Engagement Overview</h2>
        {isLoading ? (
          <Shimmer />
        ) : (
          <>
            {/* Example chart or metric */}
            <ul className="mt-3 space-y-1 text-gray-700 text-sm">
              <li>🔹 Total Clicks: {data?.[0]?.total_clicks ?? 0}</li>
              <li>🔹 Unique Visitors: {data?.[0]?.unique_visitors ?? 0}</li>
              <li>🔹 Avg Time on Page: {data?.[0]?.avg_time ?? "—"}</li>
            </ul>
          </>
        )}
        {!isLoading && (
          <div className="mt-4">
            <ExportButtons data={data} filename="engagement_analytics" />
          </div>
        )}
      </AnimatedCard>

      {/* Leaderboard Snapshot */}
      <AnimatedCard>
        <h2 className="text-lg font-semibold mb-2">Leaderboard Snapshot</h2>
        {isLoading ? (
          <Shimmer />
        ) : (
          <ul className="mt-3 space-y-1">
            <li>1️⃣ @LolaActivist — 420 pts</li>
            <li>2️⃣ @AdeSun — 398 pts</li>
            <li>3️⃣ @TomiFame — 356 pts</li>
          </ul>
        )}
      </AnimatedCard>

      {/* Campaign Summary */}
      <AnimatedCard>
        <h2 className="text-lg font-semibold mb-2">Campaign Summary</h2>
        {isLoading ? (
          <Shimmer />
        ) : (
          <ul className="mt-3 space-y-1 text-gray-700 text-sm">
            <li>🎁 Active Giveaways: {data?.[0]?.active_campaigns ?? 0}</li>
            <li>🎯 Entries per Day: {data?.[0]?.entries_daily ?? 0}</li>
            <li>🧠 Conversion Rate: {data?.[0]?.conversion_rate ?? "0%"} </li>
          </ul>
        )}
        {!isLoading && (
          <div className="mt-4">
            <ExportButtons data={data} filename="campaign_summary" />
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
