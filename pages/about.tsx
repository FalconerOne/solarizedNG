// pages/about.tsx
import HeroSection from "@/components/about/HeroSection";
import MissionSection from "@/components/about/MissionSection";
import TeamGrid from "@/components/about/TeamGrid";
import TimelineSection from "@/components/about/TimelineSection";
import ContactCTA from "@/components/about/ContactCTA";

import { getMission, getTeam, getMilestones } from "@/utils/aboutApi";

export const revalidate = 3600; // revalidate every hour

export default async function AboutPage() {
  // 🧠 Fetch data directly from Supabase via utility
  const [mission, team, milestones] = await Promise.all([
    getMission(),
    getTeam(),
    getMilestones(),
  ]);

  return (
    <main className="bg-zinc-950 text-white">
      <HeroSection />
      <MissionSection missionText={mission?.mission_text || "Our mission statement will appear here soon."} />
      <TeamGrid members={team || []} />
      <TimelineSection milestones={milestones || []} />
      <ContactCTA />
    </main>
  );
}
