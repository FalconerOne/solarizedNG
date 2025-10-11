// components/Header.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="flex justify-between items-center bg-blue-700 text-white px-6 py-4 shadow-md">
      <Link href="/" className="text-xl font-semibold">
        SolarizedNG GiveAway
      </Link>

      <nav className="flex items-center space-x-4">
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
        <Link href="/register" className="hover:underline">
          Register
        </Link>

        {!user ? (
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
