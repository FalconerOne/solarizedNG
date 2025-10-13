// /pages/_app.js

import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ActivationReminder from "@/components/ActivationReminder";

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Load user on refresh
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Main Application Layout */}
      <main className="relative flex flex-col min-h-screen">
        <Component {...pageProps} user={user} />
        {/* Global Reminder for Unactivated Users */}
        <ActivationReminder />
    import NotificationBell from "@/components/NotificationBell";

...

<NotificationBell />
      </main>
    </div>
  );
}

export default MyApp;
