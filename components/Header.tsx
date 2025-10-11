import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // Listen for changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch user's full name
  useEffect(() => {
    async function fetchUser() {
      if (session?.user) {
        const { data } = await supabase
          .from("users")
          .select("full_name")
          .eq("email", session.user.email)
          .single();
        if (data?.full_name) setUserName(data.full_name);
      }
    }
    fetchUser();
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header
      className="fixed top-0 left-0 w-full bg-gray-900 text-white shadow-lg z-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl hover:text-yellow-400 transition">
          SolarizedNG Giveaway
        </Link>

        <nav className="space-x-4 flex items-center">
          <Link href="/leaderboard" className="hover:text-yellow-400 transition">
            Leaderboard
          </Link>
          <Link href="/register" className="hover:text-yellow-400 transition">
            Register
          </Link>

          {!session ? (
            <Link href="/login" className="hover:text-yellow-400 transition">
              Login
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-300">
                👋 Hello, {userName || "Friend"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
