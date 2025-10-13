"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function AdminNavbar() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", data.user.id)
        .single();
      if (mounted) setProfile(p || null);
    }
    load();
    return () => { mounted = false };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <nav className="bg-slate-800 text-white p-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="font-bold text-lg hover:underline">Admin Panel</Link>

        <Link href="/admin/dashboard" className="text-sm hover:underline">Dashboard</Link>
        <Link href="/admin/giveaways" className="text-sm hover:underline">Manage Giveaways</Link>
        <Link href="/admin/entries" className="text-sm hover:underline">Entries</Link>
        <Link href="/admin/winners" className="text-sm hover:underline">Winners</Link>
        <Link href="/admin/exports" className="text-sm hover:underline">Exports</Link>
      </div>

      <div className="flex items-center gap-4">
        {profile ? (
          <>
            <div className="text-sm text-gray-200">Hi, <span className="font-semibold">{profile.full_name ?? "Admin"}</span></div>
            <div className="text-xs px-2 py-1 bg-white/10 rounded">{profile.role}</div>
          </>
        ) : (
          <div className="text-sm text-gray-200">…</div>
        )}
        <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
      </div>
    </nav>
  );
}
