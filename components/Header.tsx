import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check current session and listen for changes
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

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
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
