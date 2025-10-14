import ExportButtons from "@/components/analytics/ExportButtons";
import AnimatedCard from "@/components/ui/AnimatedCard";
import Shimmer from "@/components/ui/Shimmer";

// inside component render:
<AnimatedCard>
  <h2 className="text-lg font-semibold mb-2">Engagement Overview</h2>
  {isLoading ? <Shimmer /> : <AnalyticsChart data={data} />}
  {!isLoading && <ExportButtons data={data} filename="engagement_analytics" />}
</AnimatedCard>
