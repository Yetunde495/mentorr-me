'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function InstallToast() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowToast(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    // console.log('User install choice:', outcome)
    setDeferredPrompt(null)
    setShowToast(false)
  }

  const handleDismiss = () => setShowToast(false)

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-2.5 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-xl bg-white dark:bg-neutral-900 shadow-md border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-800 m-0! dark:text-neutral-100">
              Install LiveFolio
            </h3>
            <p className="text-sm text-neutral-600 mt-1 dark:text-neutral-400">
              Get quick access from your home screen.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={handleInstall}
              className="bg-purple-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-purple-700 transition"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

