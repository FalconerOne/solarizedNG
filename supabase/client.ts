// supabase/client.ts
'use client'

/**
 * ✅ Universal Supabase client configuration
 * Works for both browser (client) and server environments.
 * This single instance is used app-wide — including realtime listener hooks.
 */

import { createClient } from '@supabase/supabase-js'

// Pull keys from environment variables (never hard-code!)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Core client instance — will be imported anywhere Supabase is needed
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // throttling safeguard
    },
  },
})

/**
 * Optional helper to join the global winner broadcast channel.
 * This function will be called inside our global listener provider later.
 */
export function subscribeToGlobalWinnerEvents(onEvent: (payload: any) => void) {
  const channel = supabase.channel('global_winner_event', {
    config: { broadcast: { ack: true } },
  })

  channel
    .on('broadcast', { event: 'winner_celebration' }, (payload) => {
      onEvent(payload.payload)
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.info('✅ Listening for winner celebrations globally...')
      }
    })

  return channel
}
