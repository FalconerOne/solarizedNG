"use client";

import { useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

const nigeriaStates = [/* same list */];

export default function RegisterForm() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

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

    try {
      // Execute invisible reCAPTCHA
      const token = await recaptchaRef.current?.executeAsync();
      recaptchaRef.current?.reset();

      if (!token) {
        setError("Verification failed, please try again.");
        setLoading(false);
        return;
      }

      // Continue sign-up process
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (signUpError) throw signUpError;

      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: data.user?.id,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        location: formData.location,
        gender: formData.gender
      });

      if (profileError) throw profileError;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-2xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">Create an Account</h2>

      {/* Form fields: name, email, phone, gender, location, password */}
      {/* ... */}

      {/* Invisible reCAPTCHA */}
      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
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
