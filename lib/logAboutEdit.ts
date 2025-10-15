// lib/logAboutEdit.ts
import { createClient } from '@/utils/supabase/server'
import { updateAnalyticsOnAboutEdit } from './updateAnalyticsOnAboutEdit'

export async function logAboutEdit({
  userId,
  section,
  summary,
}: {
  userId: string
  section: 'mission' | 'team' | 'timeline'
  summary?: string
}) {
  const supabase = createClient()

  // Log activity entry
  const { error } = await supabase.from('admin_activity').insert([
    {
      user_id: userId,
      action_type: 'About Edit',
      section: section,
      details: summary || `${section} section updated.`,
      created_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error('Activity log error:', error)
  } else {
    // Trigger analytics increment
    await updateAnalyticsOnAboutEdit(section)
  }
}
