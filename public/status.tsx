import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

interface UserData {
  activated: boolean;
  activation_amount?: number;
  activated_at?: string;
}

export default function StatusPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      // Get user record from Supabase table
      const { data, error } = await supabase
        .from("users")
        .select("activated, activation_amount, activated_at")
        .eq("email", session.user.email)
        .single();

      if (error) console.error(error);
      else setUserData(data);

      setLoading(false);
    };

    loadUserStatus();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Checking status...
      </div>
    );

  return (
    <div className="max-w-xl mx-auto mt-32 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">
        My Activation Status
      </h1>

      {userData ? (
        <div className="text-center">
          {userData.activated ? (
            <div className="space-y-3">
              <p className="text-green-600 font-semibold text-lg">
                ✅ Activated!
              </p>
              <p>
                <strong>Amount:</strong> ₦{userData.activation_amount}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(userData.activated_at || "").toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="text-red-600 font-semibold text-lg">
              ❌ Not Activated Yet
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 text-center">
          No activation data found for your account.
        </p>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
