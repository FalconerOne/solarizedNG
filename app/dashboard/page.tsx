"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Gift, Activity, LogOut } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  status: string;
}

interface ActivityLog {
  id: string;
  description: string;
  created_at: string;
}

export default function DashboardPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [userName, setUserName] = useState("Solarized User");

  // 🟠 Fetch active ads
  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from("adzone")
        .select("*")
        .eq("status", "active");

      if (!error && data && data.length > 0) {
        setAds(data);
        const randomAd = data[Math.floor(Math.random() * data.length)];
        setActiveAd(randomAd);
      }
    };
    fetchAds();
  }, []);

  // 🟡 Fetch recent activity logs
  useEffect(() => {
    const fetchActivity = async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) setActivity(data);
    };
    fetchActivity();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4 md:px-10">
      {/* 🏆 Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-bold text-orange-600 flex items-center gap-2"
          >
            <Trophy className="text-yellow-500 w-8 h-8" /> Dashboard
          </motion.h1>
          <p className="text-gray-600 mt-1">Welcome back, {userName} 🌞</p>
        </div>

        {/* Logout / Profile */}
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="text-orange-600 hover:underline font-medium"
          >
            Profile
          </Link>
          <button className="flex items-center gap-1 text-red-500 hover:text-red-600 transition">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* 🎯 Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link
          href="/giveaways"
          className="bg-orange-500 text-white rounded-xl shadow-md p-6 hover:bg-orange-600 transition text-center"
        >
          <Gift className="mx-auto w-8 h-8 mb-2" />
          <h3 className="font-semibold text-lg">Join Giveaways</h3>
          <p className="text-sm text-orange-100 mt-1">
            Participate and win amazing rewards.
          </p>
        </Link>

        <Link
          href="/prizes"
          className="bg-white border border-orange-200 rounded-xl shadow-md p-6 hover:bg-orange-50 transition text-center"
        >
          <Trophy className="mx-auto w-8 h-8 text-orange-500 mb-2" />
          <h3 className="font-semibold text-lg text-orange-600">
            Claim Prizes
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            View and claim your earned rewards.
          </p>
        </Link>

        <Link
          href="/activity"
          className="bg-white border border-gray-200 rounded-xl shadow-md p-6 hover:bg-gray-50 transition text-center"
        >
          <Activity className="mx-auto w-8 h-8 text-gray-500 mb-2" />
          <h3 className="font-semibold text-lg text-gray-700">
            Activity Log
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Track your participation history.
          </p>
        </Link>
      </div>

      {/* 🟠 Ad Zone (Mid-Section) */}
      {activeAd && (
        <div className="my-10 p-4 border rounded-xl bg-gradient-to-r from-orange-50 to-white shadow-md text-center">
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
        </div>
      )}

      {/* 📊 Activity Log Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" /> Recent Activity
        </h2>
        {activity.length > 0 ? (
          <ul className="space-y-3">
            {activity.map((log) => (
              <li
                key={log.id}
                className="border-b border-gray-100 pb-2 last:border-none"
              >
                <p className="text-gray-800">{log.description}</p>
                <span className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity yet.</p>
        )}
      </div>

      {/* 📢 Bottom Ad Zone */}
      {ads.length > 1 && (
        <div className="mt-12 text-center">
          <p className="text-sm uppercase tracking-wide text-orange-600 font-semibold mb-3">
            Sponsored
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {ads.slice(0, 2).map((ad) => (
              <a
                key={ad.id}
                href={ad.link_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-orange-100 rounded-xl shadow p-3 w-72 hover:shadow-lg transition"
              >
                {ad.image_url ? (
                  <Image
                    src={ad.image_url}
                    alt={ad.title}
                    width={280}
                    height={140}
                    className="rounded-md mb-2"
                  />
                ) : (
                  <div className="text-gray-400 italic py-6">
                    Ad coming soon…
                  </div>
                )}
                <h4 className="font-medium text-orange-600">{ad.title}</h4>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
