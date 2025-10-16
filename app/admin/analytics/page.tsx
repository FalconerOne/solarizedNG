"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/supabase/analytics";
import WinnerCelebration from "@/components/celebrations/WinnerCelebration";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Giveaway = {
  id: string;
  title: string;
};

type DailyStat = {
  date: string;
  participants: number;
  views: number;
  referrals: number;
  likes: number;
  winner_user_id?: string | null;
  winner_name?: string | null;
};

const AdminAnalyticsPage: React.FC = () => {
  const supabase = createClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string>("");
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "supervisor" | "activated" | "guest">("guest");

  // Load user role for visibility rule
  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setUserRole("guest");
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, activated")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") setUserRole("admin");
      else if (profile?.role === "supervisor") setUserRole("supervisor");
      else if (profile?.activated) setUserRole("activated");
      else setUserRole("guest");
    };
    fetchRole();
  }, []);

  // Load giveaways for dropdown
  useEffect(() => {
    const loadGiveaways = async () => {
      const { data } = await supabase
        .from("giveaways")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (data) setGiveaways(data);
    };
    loadGiveaways();
  }, []);

  // Load daily stats
  const loadStats = async (gid: string) => {
    if (!gid) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaway_daily_stats")
      .select("date, participants, views, referrals, likes, winner_user_id")
      .eq("giveaway_id", gid)
      .order("date", { ascending: true });

    if (!error && data) {
      const withNames = await Promise.all(
        data.map(async (s) => {
          if (s.winner_user_id) {
            const { data: winner } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", s.winner_user_id)
              .single();
            return { ...s, winner_name: winner?.full_name || "Anonymous" };
          }
          return s;
        })
      );
      setStats(withNames);
    }
    setLoading(false);
  };

  // Detect and show confetti when winner appears
  useEffect(() => {
    const latest = stats[stats.length - 1];
    if (latest?.winner_user_id) {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timeout);
    }
  }, [stats]);

  // Display for guest users per global rule
  const isGuestView = userRole === "guest";
  const visibleStats = isGuestView
    ? stats.slice(0, Math.min(5, stats.length)).map((s) => ({
        ...s,
        participants: Math.floor(Math.random() * 60) + 1, // masked
        winner_name: "Activate any GiveAway to view winners 🎁",
      }))
    : stats;

  return (
    <div className="p-6 space-y-6">
      {showConfetti && <WinnerCelebration />}

      <h1 className="text-2xl font-bold">Giveaway Analytics</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <Select
          value={selectedGiveaway}
          onValueChange={(val) => {
            setSelectedGiveaway(val);
            loadStats(val);
          }}
        >
          <option value="">Select Giveaway</option>
          {giveaways.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </Select>

        <Button onClick={() => loadStats(selectedGiveaway)} disabled={!selectedGiveaway || loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {visibleStats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleStats.map((stat) => (
            <Card key={stat.date} className="rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <p className="font-semibold text-sm">{new Date(stat.date).toDateString()}</p>
                <p>👥 Participants: {stat.participants}</p>
                <p>👁️ Views: {stat.views}</p>
                <p>🔁 Referrals: {stat.referrals}</p>
                <p>❤️ Likes: {stat.likes}</p>
                {stat.winner_name && (
                  <p className="mt-2 text-green-600 font-medium">🏆 Winner: {stat.winner_name}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic mt-4">
          {selectedGiveaway
            ? "No daily stats found yet for this giveaway."
            : "Select a giveaway to view analytics."}
        </p>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
