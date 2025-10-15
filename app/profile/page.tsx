"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import AdZoneDisplay from "@/components/ads/AdZoneDisplay"; // ✅ imported for dynamic zone logic

interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  status: string;
}

export default function UserProfilePage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from("adzone")
        .select("*")
        .eq("status", "active");

      if (!error && data && data.length > 0) {
        setAds(data);
        // Randomly select one ad for variety
        const randomAd = data[Math.floor(Math.random() * data.length)];
        setActiveAd(randomAd);
      }
    };

    fetchAds();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 🧍 Profile Header */}
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Your Profile</h1>

      {/* 👤 Profile Info */}
      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <p className="text-gray-700">
          Welcome back! Manage your activity, giveaways, and account here.
        </p>
      </div>

      {/* 🪧 Dynamic AdZone (Profile Midsection) */}
      <AdZoneDisplay zone="Profile Midsection" />

      {/* 🟠 Random Ad Example (direct from Supabase) */}
      {activeAd && (
        <div className="my-6 p-4 border rounded-xl bg-gradient-to-r from-orange-50 to-white shadow-md text-center">
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

      {/* 📊 Profile Details */}
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-700">
          Here you can see your points, referrals, and giveaway stats.
        </p>
      </div>
    </div>
  );
}
