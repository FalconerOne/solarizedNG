// lib/realtime/winnerListener.ts
'use client'

/**
 * 🔔 Global Winner Realtime Listener Hook
 * -----------------------------------------------------------
 * Listens to the Supabase broadcast channel “global_winner_event”
 * and triggers celebration effects + masked winner announcement.
 */

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { subscribeToGlobalWinnerEvents } from '@/supabase/client'

// Winner payload expected from Supabase broadcast
export interface WinnerPayload {
  giveaway_id: string
  winner_name: string
  winner_email: string
  winner_phone: string
  prize_name?: string
  prize_image?: string
  announcement_message?: string
  visibility_level: 'admin' | 'activated' | 'guest'
}

/**
 * 🔁 Hook: useGlobalWinnerListener
 * - Subscribes to the global winner channel
 * - Displays confetti and winner popup when event arrives
 */
export function useGlobalWinnerListener() {
  const [currentWinner, setCurrentWinner] = useState<WinnerPayload | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Subscribe to Supabase channel
    const channel = subscribeToGlobalWinnerEvents((payload: WinnerPayload) => {
      console.info('🎉 Global Winner Event Received:', payload)
      setCurrentWinner(payload)
      setVisible(true)
      triggerConfetti()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  // Confetti visual
  const triggerConfetti = () => {
    const duration = 5000
    const end = Date.now() + duration
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }

  // Mask email and phone for non-activated/guest users
  const maskInfo = (text: string, type: 'email' | 'phone') => {
    if (!text) return ''
    if (type === 'email') {
      const [name, domain] = text.split('@')
      return `${name?.slice(0, 2)}***@${domain}`
    }
    if (type === 'phone') {
      return `${text.slice(0, 2)}****${text.slice(-2)}`
    }
    return text
  }

  // Generate winner display text
  const winnerText = currentWinner
    ? currentWinner.visibility_level === 'admin' ||
      currentWinner.visibility_level === 'activated'
      ? `${currentWinner.winner_name} (${currentWinner.winner_email})`
      : `${maskInfo(currentWinner.winner_email, 'email')} 🎊`
    : ''

  return {
    currentWinner,
    visible,
    setVisible,
    winnerText,
  }
}
