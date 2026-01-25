"use client"

import { useEffect } from 'react'
import { X, Home, MessageCircle, Scan, ActivitySquare, History, UserCircle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

// Medical navigation items - Synced with ExpandableSidebar
const navigationItems = [
  {
    title: "Main Menu",
    items: [
      { icon: <Home className="h-5 w-5" />, label: "Dashboard", url: "/dashboard" },
      { icon: <MessageCircle className="h-5 w-5" />, label: "Chatbot", url: "/dashboard/chatbot" },
      { icon: <Scan className="h-5 w-5" />, label: "MRI Analyzer", url: "/dashboard/mri-analysis" },
      { icon: <ActivitySquare className="h-5 w-5" />, label: "Blood Analyzer", url: "/dashboard/blood-analyzer" },
      { icon: <History className="h-5 w-5" />, label: "Report History", url: "/dashboard/report-history" },
    ]
  }
]

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (url: string) => {
    router.push(url)
    onClose()
  }

  const isActive = (path: string) => pathname === path

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "tween",
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="relative flex h-full w-full max-w-xs flex-col bg-[#0E2A2A] shadow-2xl border-r border-white/10"
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/10">
              <div className="font-mono text-xl font-bold text-white">Jeev Veda</div>
              <button
                type="button"
                className="-m-2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-6">
                {navigationItems.map((section) => (
                  <div key={section.title}>
                    <h3 className="px-2 text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleNavigation(item.url)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                            isActive(item.url)
                              ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                              : "text-neutral-400 hover:bg-white/5 hover:text-white group"
                          )}
                        >
                          <div className={cn(
                            "flex-shrink-0 transition-colors",
                            isActive(item.url) ? "text-emerald-400" : "group-hover:text-emerald-400"
                          )}>
                            {item.icon}
                          </div>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            {/* Profile Section (Bottom) */}
            <div className="p-4 border-t border-white/10 bg-[#0E2A2A]">
              <div className="mt-4 text-sm text-white/50 text-center mb-4 font-mono">
                Jeev Veda © {new Date().getFullYear()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}