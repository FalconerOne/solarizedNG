"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Gift, Trophy, Users } from "lucide-react";

type Giveaway = {
  id: string;
  title: string;
  description: string;
  status: string;
  winner_user_id?: string | null;
  prize_image?: string | null;
  created_at: string;
};

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState<string | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- 🎉 Lightweight Canvas Confetti ---
  const launchConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const particles: { x: number; y: number; r: number; d: number; color: string; tilt: number }[] = [];
    const colors = ["#FFC107", "#E91E63", "#03A9F4", "#4CAF50", "#FF5722"];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        r: Math.random() * 5 + 2,
        d: Math.random() * 10 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 10,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.r, p.r);
      }
      update();
      requestAnimationFrame(draw);
    }

    function update() {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += Math.cos(p.d) + 1 + p.r / 2;
        p.x += Math.sin(p.d);
        if (p.y > H) {
          particles[i] = {
            x: Math.random() * W,
            y: -10,
            r: p.r,
            d: p.d,
            color: p.color,
            tilt: p.tilt,
          };
        }
      }
    }

    draw();
    setTimeout(() => {
      if (ctx) ctx.clearRect(0, 0, W, H);
    }, 6000);
  };

  // --- Fetch Giveaways ---
  const fetchGiveaways = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("id, title, description, status, winner_user_id, prize_image, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setGiveaways(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGiveaways();

    // --- Realtime Sync ---
    const channel = supabase
      .channel("giveaways_admin_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "giveaways" },
        () => fetchGiveaways()
      )
      .subscribe();
