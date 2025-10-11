import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("Invalid credentials.");

      alert("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Login
        </h1>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white w-full p-2 rounded font-semibold hover:bg-green-700 transition"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-center mt-3 text-sm">
          Not registered yet?{" "}
          <a href="/register" className="text-green-700 font-semibold">
            Join the Giveaway
          </a>
        </p>
      </form>
    </div>
  );
}
