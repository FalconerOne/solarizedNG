import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch active user session
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    getUser();

    // Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isAdmin = router.pathname.startsWith("/admin");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 shadow-md ${
        isAdmin
          ? "bg-gray-900 text-white border-b border-gray-800"
          : "bg-white text-gray-800 border-b border-gray-200"
      }`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`font-bold text-lg ${
              isAdmin ? "text-yellow-300" : "text-blue-600"
            }`}
          >
            {isAdmin ? "Admin Dashboard" : "SolarizedNG Giveaway"}
          </Link>
        </div>

        {!loading && (
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden sm:inline">
                  Hello,{" "}
                  <strong>
                    {user.user_metadata?.full_name ||
                      user.email?.split("@")[0]}
                  </strong>
                </span>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1 rounded ${
                    isAdmin
                      ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } transition`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${
                    isAdmin
                      ? "text-yellow-300 hover:text-yellow-400"
                      : "text-blue-600 hover:text-blue-800"
                  } font-medium`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`${
                    isAdmin
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-blue-600 text-white"
                  } px-3 py-1 rounded hover:opacity-90`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
