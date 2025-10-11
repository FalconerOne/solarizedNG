import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch session
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        triggerToast(
          `Welcome back, ${
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0]
          } 👋`
        );
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
        triggerToast(
          `Welcome back, ${
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0]
          } 👋`
        );
      } else {
        setUser(null);
        triggerToast("Goodbye 👋 See you soon!");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isAdmin = router.pathname.startsWith("/admin");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 shadow-sm ${
          isAdmin
            ? "bg-gray-900 text-white border-b border-gray-800"
            : "bg-white text-gray-800 border-b border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Link
              href={isAdmin ? "/admin" : "/"}
              className={`font-bold text-lg ${
                isAdmin ? "text-yellow-300" : "text-blue-600"
              }`}
            >
              {isAdmin ? "Admin Dashboard" : "SolarizedNG Giveaway"}
            </Link>
            {isAdmin && (
              <Link
                href="/leaderboard"
                className="text-sm text-yellow-300 hover:text-yellow-400 transition"
              >
                🏆 Leaderboard
              </Link>
            )}
          </div>

          {/* Right */}
          {!loading && (
            <div className="flex items-center gap-4" ref={menuRef}>
              {user ? (
                <>
                  <div
                    className="relative flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => setMenuOpen((p) => !p)}
                  >
                    {/* Status Dot */}
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>

                    <span className="hidden sm:inline">
                      Hello,&nbsp;
                      <strong>
                        {user.user_metadata?.full_name ||
                          user.email?.split("@")[0]}
                      </strong>
                    </span>

                    {/* Dropdown Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 opacity-70"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-4 top-14 w-48 rounded-lg shadow-lg border ${
                          isAdmin
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-200 text-gray-800"
                        }`}
                      >
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          👤 Profile
                        </Link>
                        <Link
                          href="/status"
                          className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          📊 My Status
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                        >
                          🚪 Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  {/* Guest View */}
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-sm opacity-80 hidden sm:inline">
                      Guest
                    </span>
                  </div>
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

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[60]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
