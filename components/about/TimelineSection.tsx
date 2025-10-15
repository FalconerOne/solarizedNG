"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Calendar } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TimelineSection() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .order("year", { ascending: true });
      if (!error && data) setMilestones(data);
      setLoading(false);
    };
    fetchMilestones();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-zinc-950 text-center">
        <h2 className="text-3xl font-bold mb-10 text-white">Our Journey</h2>
        <p className="text-gray-400">Loading milestones...</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-zinc-950">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">
        🌟 Our Journey
      </h2>
      <div className="relative max-w-4xl mx-auto px-6">
        <div className="absolute left-1/2 top-0 w-1 h-full bg-gradient-to-b from-orange-500 via-orange-400 to-transparent transform -translate-x-1/2"></div>

        {milestones.map((m, i) => (
          <div
            key={m.id}
            className={`mb-12 flex items-center justify-between w-full ${
              i % 2 === 0 ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div className="w-5/12">
              <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg hover:shadow-orange-500/10 transition">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                  <Calendar className="text-orange-400 w-5 h-5" /> {m.year}
                </h3>
                <h4 className="text-orange-400 font-medium">{m.title}</h4>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
            <div className="w-1/12 flex justify-center">
              <div className="w-5 h-5 bg-orange-500 rounded-full shadow-md"></div>
            </div>
            <div className="w-5/12"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
