"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// 🟠 Ad Interface
interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  status: string;
}

// 🧍‍♂️ User Interface
interface UserProfile {
  id: string;
  username: string;
  points: number;
  referred_by: string | null;
  activated: boolean;
  avatar_url: string | null;
}

// 🪄 Activity Log Interface
interface Activity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Profile + Ads + Activity
  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [{ data: profileData }, { data: adData }, { data: activityData }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("adzone").select("*").eq("status", "active"),
          supabase
            .from("activity_log")
            .select("id, action_type, description, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      if (profileData) setProfile(profileData);
      if (adData && adData.length > 0) {
        setAds(adData);
        const randomAd = adData[Math.floor(Math.random() * adData.length)];
        setActiveAd(randomAd);
      }
      if (activityData) setActivities(activityData);

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-orange-600 font-semibold">
        Loading your dashboard...
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* 🌞 Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-white shadow-md rounded-xl p-6 flex items-center gap-4"
      >
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt="User Avatar"
            width={64}
            height={64}
            className="rounded-full border-2 border-orange-400"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-white font-bold text-xl">
            {profile?.username?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            Hi, {profile?.username || "User"} 👋
          </h1>
          <p className="text-gray-600 text-sm">
            Welcome back to SolarizedNG GiveAwayz
          </p>
        </div>
      </motion.div>

      {/* ⚡ User Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <h3 className="text-gray-500 text-sm">Total Points</h3>
          <p className="text-2xl font-bold text-orange-600">
            {profile?.points || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <h3 className="text-gray-500 text-sm">Referrals</h3>
          <p className="text-2xl font-bold text-orange-600">
            {profile?.referred_by ? 1 : 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <h3 className="text-gray-500 text-sm">Status</h3>
          <p
            className={`text-lg font-semibold ${
              profile?.activated ? "text-green-600" : "text-red-500"
            }`}
          >
            {profile?.activated ? "Activated" : "Pending"}
          </p>
        </div>
      </motion.div>

      {/* 🎁 Claimable Giveaways */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-xl shadow-md"
      >
        <h2 className="text-lg font-semibold text-orange-600 mb-3">
          🎉 Claim Prizes & Giveaways
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          Browse and claim available giveaways. New ones every week!
        </p>
        <Link
          href="/giveaways"
          className="inline-block bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition"
        >
          View Giveaways
        </Link>
      </motion.section>

      {/* 🟠 Mid-section Ad Zone */}
      {activeAd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="my-6 p-4 border rounded-xl bg-gradient-to-r from-orange-50 to-white shadow-md text-center"
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
          <h3 className="text-lg font-medium mb-2">{activeAd.title}</h3>
          {activeAd.link_url && (
            <a
              href={activeAd.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition"
            >
              Learn More
            </a>
          )}
        </motion.div>
      )}

      {/* 📜 Activity Log */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-orange-600 mb-4">
          Your Recent Activity
        </h2>
        {activities.length > 0 ? (
          <ul className="space-y-3">
            {activities.map((act) => (
              <li
                key={act.id}
                className="flex justify-between border-b border-orange-100 pb-2"
              >
                <span className="text-gray-700 text-sm">{act.description}</span>
                <span className="text-gray-400 text-xs">
                  {new Date(act.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">
            No recent activity found. Start earning points today!
          </p>
        )}
      </motion.section>

      {/* 🚀 Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-3 mt-6"
      >
        <Link
          href="/leaderboard"
          className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition"
        >
          View Leaderboard
        </Link>
        <Link
          href="/referrals"
          className="border border-orange-400 text-orange-600 px-5 py-2 rounded-full hover:bg-orange-100 transition"
        >
          Refer a Friend
        </Link>
      </motion.div>
    </div>
  );
}
