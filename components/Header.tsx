import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Fetch current user session
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setShowWelcome(true); // trigger welcome popup
        setTimeout(() => setShowWelcome(false), 4000);
      }
      setLoading(false);
    };
    getUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 4000);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isAdmin = router.pathname.startsWith("/admin");

  return (
    <>
      {/* Main Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 shadow-sm ${
          isAdmin
            ? "bg-gray-900 text-white border-b border-gray-800"
            : "bg-white text-gray-800 border-b border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          {/* Left Side — App Title */}
          <div className="flex items-center gap-4">
            <Link
              href={isAdmin ? "/admin" : "/"}
              className={`font-bold text-lg ${
                isAdmin ? "text-yellow-300" : "text-blue-600"
              }`}
            >
              {isAdmin ? "Admin Dashboard" : "SolarizedNG Giveaway"}
            </Link>

            {/* Admin quick link */}
            {isAdmin && (
              <Link
                href="/leaderboard"
                className="text-sm text-yellow-300 hover:text-yellow-400 transition"
              >
                🏆 View Leaderboard
              </Link>
            )}
          </div>

          {/* Right Side — Auth Buttons */}
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
                    className={`px-3 py-1 rounded font-medium transition ${
                      isAdmin
                        ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
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

      {/* 🎉 Welcome Toast */}
      <AnimatePresence>
        {showWelcome && user && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[60]"
          >
            Welcome back,{" "}
            {user.user_metadata?.full_name || user.email?.split("@")[0]} 👋
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
