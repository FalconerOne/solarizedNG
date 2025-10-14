"use client";

import React from "react";
import { awardPoints, getPointsConfig } from "@/lib/supabase/rewards";
import { toast } from "sonner";

interface ShareButtonsProps {
  userId: string;
  giveawayId: string;
  text?: string;
  title?: string;
}

export default function ShareButtons({ userId, giveawayId, text, title }: ShareButtonsProps) {
  const shareText = text ?? `Join this giveaway!`;
  const shareTitle = title ?? "SolarizedNG Giveaway";

  async function onShare(platform?: "whatsapp" | "x" | "facebook" | "telegram") {
    const link = `${window.location.origin}/join?ref=${userId}&gw=${giveawayId}`;

    // first attempt Web Share API
    if ((navigator as any).share && !platform) {
      try {
        await (navigator as any).share({ title: shareTitle, text: shareText, url: link });
        await handlePostShare();
        return;
      } catch (err) {
        // fallback below
      }
    }

    // construct platform-specific url
    let url = "";
    if (platform === "whatsapp") url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + link)}`;
    if (platform === "x") url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`;
    if (platform === "facebook") url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    if (platform === "telegram") url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;

    if (url) window.open(url, "_blank");

    await handlePostShare();
  }

  async function copyLink() {
    const link = `${window.location.origin}/join?ref=${userId}&gw=${giveawayId}`;
    await navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
    // award smaller points for copy maybe
    await handlePostShare(true);
  }

  async function handlePostShare(isCopy = false) {
    const cfg = await getPointsConfig();
    const points = isCopy ? Math.max(1, Math.floor(cfg.share_points / 4)) : cfg.share_points;
    const res = await awardPoints(userId, points, isCopy ? "share_copy" : "share", giveawayId, { viaCopy: isCopy });
    if (res.success) {
      toast.success(`You earned ${points} points!`);
    } else {
      toast.error("Points not awarded (daily cap reached or error)");
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button className="px-3 py-2 bg-slate-800 rounded-md text-sm" onClick={() => onShare("whatsapp")}>WhatsApp</button>
      <button className="px-3 py-2 bg-slate-800 rounded-md text-sm" onClick={() => onShare("x")}>X</button>
      <button className="px-3 py-2 bg-slate-800 rounded-md text-sm" onClick={() => onShare("facebook")}>Facebook</button>
      <button className="px-3 py-2 bg-slate-800 rounded-md text-sm" onClick={() => onShare("telegram")}>Telegram</button>
      <button className="px-3 py-2 bg-slate-800 rounded-md text-sm" onClick={() => onShare()}>Native Share</button>
      <button className="px-3 py-2 bg-slate-700 rounded-md text-sm" onClick={copyLink}>Copy Link</button>
    </div>
  );
}
