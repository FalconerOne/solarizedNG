"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// 🧩 Components
import PointsDisplay from "@/components/dashboard/PointsDisplay";
import ReferralsPanel from "@/components/dashboard/ReferralsPanel";
import PrizeClaimPanel from "@/components/dashboard/PrizeClaimPanel";
import LeaderboardEnhanced from "@/components/dashboard/LeaderboardEnhanced";
import AdminTrueCounts from "@/components/dashboard/AdminTrueCounts";
import WinnerCelebration from "@/components/WinnerCelebration";

interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  status: string;
}

interface Activity {
  id: string;
  description: string;
  created_at: string;
}

export default function DashboardPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [username, setUsername] = useState<string>("User");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isActivated, setIsActivated] = useState<boolean>(false);

  // 🎉 Winner Celebration Popup
  const [showWinner, setShowWinner] = useState(false);
  const [winnerData, setWinnerData] = useState({
    giveawayTitle: "",
    winnerName: "",
    prizeImage: null as string | null,
    isVisibleToUser: false,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      const userEmail = session?.user?.email;

      // ✅ Check admin by email domain
      if (
        userEmail &&
        (userEmail.endsWith("@solarizesolutions.com.ng") ||
          userEmail.endsWith("@falconerone.com"))
      ) {
        setIsAdmin(true);
      }

      // ✅ Fetch username & activation
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, activated")
          .eq("id", userId)
          .single();

        if (profile?.username) setUsername(profile.username);
        if (profile?.activated) setIsActivated(true);
      }

      // ✅ Fetch active ads
      const { data: adsData } = await supabase
        .from("adzone")
        .select("*")
        .eq("status", "active");

      if (adsData?.length) {
        setAds(adsData);
        const randomAd = adsData[Math.floor(Math.random() * adsData.length)];
        setActiveAd(randomAd);
      }

      // ✅ Fetch recent activities
      if (userId) {
        const { data: actData } = await supabase
          .from("activity_log")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (actData) setActivities(actData);
      }
    };

    fetchDashboardData();
  }, []);

  // 🧠 Listen for giveaway winner events (Realtime)
  useEffect(() => {
    const subscription = supabase
      .channel("giveaway-winner-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "giveaway_winner_logs" },
        async (payload) => {
          const { giveaway_id, winner_user_id } = payload.new;

          // Fetch giveaway details
          const { data: giveaway } = await supabase
            .from("giveaways")
            .select("title, prize_image, activation_fee")
            .eq("id", giveaway_id)
            .single();

          if (!giveaway) return;

          // Fetch winner info
          const { data: winner } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", winner_user_id)
            .single();

          // 🔍 Visibility Logic
          const canSeeWinner =
            isAdmin ||
            isActivated ||
            (giveaway.activation_fee === 0 && winner_user_id);

          setWinnerData({
            giveawayTitle: giveaway.title,
            winnerName: winner?.username || "Anonymous User",
            prizeImage: giveaway.prize_image || null,
            isVisibleToUser: !!canSeeWinner,
          });

          setShowWinner(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isAdmin, isActivated]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 🧡 Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white shadow-md rounded-2xl p-6"
        >
          <h1 className="text-3xl font-bold text-orange-600">
            Welcome back, {username} 🌞
          </h1>
          <p className="text-sm text-gray-500 mt-2 sm:mt-0">
            Manage your participation, rewards, and progress below.
          </p>
        </motion.div>

        <PointsDisplay />
        {activeAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="my-6 p-4 border rounded-2xl bg-gradient-to-r from-orange-50 to-white shadow text-center"
          >
            <p className="text-sm uppercase tracking-wide text-orange-600 font-semibold mb-2">
              Sponsored
            </p>
            {activeAd.image_url && (
              <div className="flex justify-center mb-3">
                <Image
                  src={activeAd.image_url}
                  alt={activeAd.title}
                  width={320}
                  height={180}
                  className="rounded-lg shadow"
                />
              </div>
            )}
            <h3 className="text-lg font-medium mb-2 text-gray-800">
              {activeAd.title}
            </h3>
            {activeAd.link_url && (
              <a
                href={activeAd.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition"
              >
                Learn More
              </a>
            )}
          </motion.div>
        )}

        <LeaderboardEnhanced />
        <ReferralsPanel />
        <PrizeClaimPanel />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-orange-600 mb-4">
            Recent Activity
          </h2>
          {activities.length > 0 ? (
            <ul className="space-y-3">
              {activities.map((act) => (
                <li
                  key={act.id}
                  className="text-gray-700 border-b border-orange-100 pb-2"
                >
                  {act.description}
                  <span className="block text-xs text-gray-400 mt-1">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              No recent activities yet. Start engaging to see updates here!
            </p>
          )}
        </motion.div>

        {isAdmin && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-orange-100 border border-orange-300 rounded-2xl shadow-lg p-6 mt-10"
          >
            <h2 className="text-2xl font-bold text-orange-700 mb-4 flex items-center gap-2">
              🛠️ Admin Controls
            </h2>

            <AdminTrueCounts />

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <Link
                href="/admin/ads"
                className="bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-xl shadow transition"
              >
                Manage Ads
              </Link>
              <Link
                href="/admin/activity"
                className="bg-white border border-orange-400 text-orange-600 text-center py-3 rounded-xl shadow hover:bg-orange-50 transition"
              >
                Activity Summary
              </Link>
              <Link
                href="/admin/maintenance"
                className="bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-xl shadow transition"
              >
                Maintenance Mode
              </Link>
            </div>

            <p className="text-xs text-gray-600 mt-4 text-center italic">
              (Admin controls are visible only to authorized Solarize staff)
            </p>
          </motion.section>
        )}
      </div>

      {/* 🎉 Winner Celebration Popup */}
      <WinnerCelebration
        visible={showWinner}
        onClose={() => setShowWinner(false)}
        giveawayTitle={winnerData.giveawayTitle}
        winnerName={winnerData.winnerName}
        prizeImage={winnerData.prizeImage}
        isVisibleToUser={winnerData.isVisibleToUser}
      />
    </main>
  );
}
