import { fetchAboutData } from "@/lib/fetchAboutData";
import HeroSection from "@/components/about/HeroSection";
import MissionSection from "@/components/about/MissionSection";
import TeamGrid from "@/components/about/TeamGrid";
import TimelineSection from "@/components/about/TimelineSection";
import ContactCTA from "@/components/about/ContactCTA";

export const revalidate = 3600;

export default async function AboutPage() {
  const { mission, team, milestones } = await fetchAboutData();

  return (
    <main className="bg-zinc-950 text-white min-h-screen">
      <HeroSection />
      <MissionSection missionText={mission?.mission_text || "No mission text available yet."} />
      <TeamGrid members={team || []} />
      <TimelineSection milestones={milestones || []} />
      <ContactCTA />
    </main>
  );
}
