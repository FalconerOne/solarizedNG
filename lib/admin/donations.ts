'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function listDonations() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.rpc('donations_manage', { action: 'list' })
  if (error) throw error
  return data || []
}

export async function addDonation({ organization_name, amount, currency, notes }: any) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.rpc('donations_manage', {
    action: 'create',
    organization_name,
    amount,
    currency,
    notes
  })
  if (error) throw error
  return data
}

export async function authorizeDonation(donation_id: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.rpc('donations_manage', {
    action: 'authorize',
    donation_id
  })
  if (error) throw error
  return data
}
