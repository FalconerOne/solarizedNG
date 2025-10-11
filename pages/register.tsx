import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            location,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed, please try again.");

      alert("Signup successful! Redirecting to your dashboard...");
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
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Join the Giveaway
        </h1>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

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
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center mt-3 text-sm">
          Already registered?{" "}
          <a href="/login" className="text-green-700 font-semibold">
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}
