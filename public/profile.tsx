import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    getSession();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading profile...
      </div>
    );

  return (
    <div className="max-w-xl mx-auto mt-32 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">
        My Profile
      </h1>

      <div className="space-y-3">
        <div>
          <p className="text-gray-600 text-sm">Full Name</p>
          <p className="font-medium">
            {user.user_metadata?.full_name || "—"}
          </p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Phone</p>
          <p className="font-medium">
            {user.user_metadata?.phone || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Location</p>
          <p className="font-medium">
            {user.user_metadata?.location || "Not provided"}
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
