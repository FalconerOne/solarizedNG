// /pages/profile.js

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [giveaways, setGiveaways] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: activeGiveaway } = await supabase
        .from("giveaways")
        .select("id, title, activation_fee, is_active, start_date, end_date")
        .eq("is_active", true)
        .maybeSingle();
      setGiveaways(activeGiveaway ? [activeGiveaway] : []);

      const { data: entry } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("giveaway_id", activeGiveaway?.id)
        .maybeSingle();
      setActiveEntry(entry);

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function activateEntry() {
    if (!giveaways[0]) return alert("No active giveaway at the moment.");
    const g = giveaways[0];
    const confirmPay = confirm(
      `Activate your entry for "${g.title}" with ₦${g.activation_fee}?`
    );
    if (!confirmPay) return;

    // (Later: integrate Paystack or Supabase Functions for payment verification)
    const { error } = await supabase.from("entries").update({ is_activated: true }).eq("user_id", profile.id);
    if (!error) alert("✅ Activation successful! You're now in the draw.");
    else console.error("Activation error:", error);
  }

  if (loading) return <div className="p-6 text-center">Loading profile...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
          <p className="mb-2">
            <strong>Name:</strong> {profile?.full_name}
          </p>
          <p className="mb-2">
            <strong>Email:</strong> {profile?.email}
          </p>
          <p className="mb-2">
            <strong>Phone:</strong> {profile?.phone}
          </p>

          {giveaways.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Current Giveaway</h2>
              <p className="mt-2">
                <strong>{giveaways[0].title}</strong>
              </p>
              <p>Start: {new Date(giveaways[0].start_date).toLocaleString()}</p>
              <p>End: {new Date(giveaways[0].end_date).toLocaleString()}</p>

              {activeEntry?.is_activated ? (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                  ✅ You are activated for this giveaway.
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">
                  ⚠️ You are not activated yet.
                  <button
                    onClick={activateEntry}
                    className="ml-4 bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Activate Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 p-3 bg-gray-100 text-gray-700 rounded">
              No active giveaway at the moment.
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
