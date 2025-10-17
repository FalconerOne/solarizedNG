// components/providers/GlobalListenerProvider.tsx
'use client'

/**
 * 🌍 GlobalListenerProvider
 * -----------------------------------------------------------
 * Mounted once in the root layout or _app.tsx.
 * Listens for winner events globally using useGlobalWinnerListener().
 * Displays confetti celebration and popup announcement.
 */

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useGlobalWinnerListener } from '@/lib/realtime/winnerListener'
import { X } from 'lucide-react'

export default function GlobalListenerProvider() {
  const { currentWinner, visible, setVisible, winnerText } = useGlobalWinnerListener()

  useEffect(() => {
    if (visible && currentWinner) {
      console.log('🎊 Global Winner Celebration Active:', currentWinner)
    }
  }, [visible, currentWinner])

  if (!visible || !currentWinner) return null

  return (
    <AnimatePresence>
      <motion.div
        key="global-winner-popup"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close Button */}
          <button
            onClick={() => setVisible(false)}
            className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
          >
            <X size={18} />
          </button>

          {/* Winner Prize Image */}
          {currentWinner.prize_image && (
            <div className="flex justify-center mb-4">
              <Image
                src={currentWinner.prize_image}
                alt="Prize"
                width={100}
                height={100}
                className="rounded-xl object-cover shadow-lg"
              />
            </div>
          )}

          {/* Celebration Text */}
          <h2 className="text-2xl font-bold mb-2 text-primary">
            🎉 Congratulations to our New Winner!
          </h2>

          <p className="text-gray-700 dark:text-gray-300 mb-2">{winnerText}</p>

          {currentWinner.prize_name && (
            <p className="font-medium text-gray-900 dark:text-gray-100">
              🏆 Prize: {currentWinner.prize_name}
            </p>
          )}

          <p className="mt-4 text-sm text-gray-500">
            {currentWinner.announcement_message ||
              'Stay tuned for more exciting giveaways!'}
          </p>

          <motion.div
            className="mt-5 w-full h-1 bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 rounded-full animate-pulse"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 4 }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
