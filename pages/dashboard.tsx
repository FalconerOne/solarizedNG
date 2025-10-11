import { GetServerSideProps } from "next";
import { requireAuth } from "../lib/requireAuth";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = requireAuth;

export default function Dashboard({ user }: any) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome, {user?.email || "User"} 👋
      </h1>
      <p className="text-gray-600 mb-6">You are successfully logged in.</p>

      <div className="space-x-4">
        <Link
          href="/leaderboard"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Leaderboard
        </Link>

        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
