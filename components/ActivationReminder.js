// /components/ActivationReminder.js

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ActivationReminder({ user }) {
  const [activeEntries, setActiveEntries] = useState(0);
  const [giveawayTitle, setGiveawayTitle] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function checkActivation() {
      const { data: active } = await supabase
        .from("entries")
        .select("id, giveaway_id, is_activated")
        .eq("user_id", user.id)
        .eq("is_activated", true);

      const { data: giveaway } = await supabase
        .from("giveaways")
        .select("title")
        .eq("is_active", true)
        .single();

      setGiveawayTitle(giveaway?.title || "current giveaway");
      setActiveEntries(active?.length || 0);
      setIsActivated(active?.length > 0);
      setShowPopup(true);
    }

    checkActivation();
  }, [user]);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm text-center relative">
        <h2 className="text-lg font-bold mb-2">
          {isActivated
            ? "🎉 You're Activated!"
            : "⚡ Activate to Enter the Draw!"}
        </h2>
        <p className="text-gray-700 text-sm mb-4">
          {isActivated
            ? `You're currently entered in the "${giveawayTitle}" giveaway with ${activeEntries} active entr${
                activeEntries === 1 ? "y" : "ies"
              }.
