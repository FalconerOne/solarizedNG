// /components/ActivationReminder.js
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ActivationReminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    async function checkActivation() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: entry } = await supabase
        .from("entries")
        .select("is_activated")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!entry?.is_activated) setShow(true);
    }
    checkActivation();
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg shadow-lg z-50">
      <p className="font-semibold">
        ⚠️ You haven't activated your entry yet!
      </p>
      <p className="text-sm mb-2">
        Activate now to join the next SolarizedNG Giveaway draw!
      </p>
      <a
        href="/profile"
        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
      >
        Activate Now
      </a>
      <button
        onClick={() => setShow(false)}
        className="ml-2 text-sm text-gray-600 hover:text-gray-800"
      >
        Dismiss
      </button>
    </div>
  );
}
