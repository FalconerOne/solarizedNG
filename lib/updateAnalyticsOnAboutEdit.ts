// lib/updateAnalyticsOnAboutEdit.ts
import { createClient } from '@/utils/supabase/server'

/**
 * Increments the analytics counter for the specified About section.
 * Also increments the total About edits counter.
 */
export async function updateAnalyticsOnAboutEdit(section: 'mission' | 'team' | 'timeline') {
  const supabase = createClient()

  // 1️⃣ Increment section-specific counter
  const { error: sectionError } = await supabase.rpc('increment_metric', {
    metric_name: `${section}_edits`,
  })

  // 2️⃣ Increment overall counter
  const { error: totalError } = await supabase.rpc('increment_metric', {
    metric_name: 'about_edits_total',
  })

  if (sectionError || totalError) {
    console.error('Analytics update failed:', sectionError || totalError)
  }
}
