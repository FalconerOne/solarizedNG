"use client";
import React from "react";
import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-orange-600 to-orange-800 text-center text-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-4">
          Join the SolarizedNG Movement ☀️
        </h2>
        <p className="text-lg text-orange-100 mb-8">
          Be part of the innovation. Let’s work together to power a brighter
          future through transparency, engagement, and shared success.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="bg-white text-orange-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-orange-100 transition"
          >
            📩 Contact Us
          </Link>
          <Link
            href="/register"
            className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-orange-700 transition"
          >
            🌟 Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
