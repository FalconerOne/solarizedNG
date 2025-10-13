import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
      else {
        setSession(data.session);
        fetchRole(data.session.user.id);
        fetchGiveaways();
      }
    });
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    setRole(data?.role ?? "none");
  }

  async function fetchGiveaways() {
    const { data } = await supabase.from("giveaways").select("*").order("created_at", { ascending: false });
    setGiveaways(data ?? []);
    setLoading(false);
  }

  async function createGiveaway() {
    const title = prompt("Giveaway title?");
    if (!title) return;
    await supabase.from("giveaways").insert({
      title,
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 days
      created_by: session?.user.id,
    });
    fetchGiveaways();
  }

  if (!session || loading) return <div className="p-6">Loading…</div>;
  if (role === "none") return <div className="p-6 text-red-500">Access denied</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Role: {role}</p>

      {role === "admin-full" && (
        <button
          onClick={createGiveaway}
          className="bg-green-600 text-white px-4 py-2 rounded mb-6"
        >
          + New Giveaway
        </button>
      )}

      <div className="grid gap-4">
        {giveaways.map((g) => (
          <div
            key={g.id}
            className="border rounded p-4 bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{g.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(g.start_date).toLocaleDateString()} – {new Date(g.end_date).toLocaleDateString()}
              </p>
              <p className="text-sm">
                Fee: ₦{g.activation_fee ?? 0}{" "}
                {g.is_paid ? "(Paid)" : "(Free)"}
              </p>
            </div>
            {role === "admin-full" && (
              <button
                className="text-blue-600 underline"
                onClick={() => router.push(`/admin/giveaway/${g.id}`)}
              >
                Manage
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
