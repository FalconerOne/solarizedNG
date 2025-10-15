"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const nigeriaStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Federal Capital Territory (Abuja)"
];

export default function RegisterForm() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    location: "",
    gender: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: data.user?.id,
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      location: formData.location,
      gender: formData.gender
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-2xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">Create an Account</h2>

      <input
        type="text"
        name="full_name"
        placeholder="Full Name"
        value={formData.full_name}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md"
      />

      <input
        type="tel"
        name="phone_number"
        placeholder="Phone Number"
        value={formData.phone_number}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md"
      />

      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Prefer not to say</option>
      </select>

      <select
        name="location"
        value={formData.location}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md"
      >
        <option value="">Select State</option>
        {nigeriaStates.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </form>
  );
}
