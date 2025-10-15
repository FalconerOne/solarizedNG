"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeamGrid() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data, error } = await supabase
        .from("about_team")
        .select("*")
        .order("id", { ascending: true });
      if (!error && data) setTeam(data);
      setLoading(false);
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-zinc-900 text-center">
        <h2 className="text-3xl font-bold mb-8 text-white">Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-zinc-800 rounded-xl h-60"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-zinc-900 text-center">
      <h2 className="text-3xl font-bold mb-8 text-white">Our Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
        {team.map((member) => (
          <div
            key={member.id}
            className="group bg-zinc-800 rounded-xl p-6 transition transform hover:-translate-y-2 hover:shadow-lg hover:shadow-orange-500/20"
          >
            <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
              <img
                src={
                  member.image_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    member.name
                  )}&background=random`
                }
                alt={member.name}
                className="object-cover w-full h-full"
              />
            </div>
            <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition">
              {member.name}
            </h3>
            <p className="text-gray-400 text-sm">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
