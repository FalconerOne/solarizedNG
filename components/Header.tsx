import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Check current session and listen for auth state changes
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch user info (full name) from database
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
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <Link href="/" className="font-bold text-xl">
        SolarizedNG Giveaway
      </Link>

      <nav className="space-x-4 flex items-center">
        <Link href="/leaderboard">Leaderboard</Link>
        <Link href="/register">Register</Link>

        {!session ? (
          <Link href="/login">Login</Link>
        ) : (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-200">
              👋 Hello, {userName || "Friend"}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
