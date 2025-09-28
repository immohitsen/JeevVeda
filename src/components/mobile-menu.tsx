"use client"

import { useEffect } from 'react'
import { X, Home, MessageCircle, Scan, ClipboardList, UserCircle, ActivitySquare, History, Shield, Clock } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

const navigationItems = [
  {
    title: "Main Menu",
    items: [
      { icon: <Home className="h-5 w-5" />, label: "Dashboard", url: "/dashboard" },
      { icon: <MessageCircle className="h-5 w-5" />, label: "Chatbot", url: "/dashboard/chatbot" },
      { icon: <Scan className="h-5 w-5" />, label: "Screening Tools", url: "/dashboard/screening-tools" },
      { icon: <ClipboardList className="h-5 w-5" />, label: "Reports", url: "/dashboard/reports" },
      { icon: <UserCircle className="h-5 w-5" />, label: "Profile", url: "/dashboard/profile" },
    ]
  },
  {
    title: "Medical Tools",
    items: [
      { icon: <ActivitySquare className="h-5 w-5" />, label: "Blood Analyzer", url: "/dashboard/blood-analyzer" },
      { icon: <History className="h-5 w-5" />, label: "Report History", url: "/dashboard/report-history" },
      { icon: <Shield className="h-5 w-5" />, label: "Screening Recs", url: "/dashboard/screening-recs" },
    ]
  },
  {
    title: "Help",
    items: [
      { icon: <Clock className="h-5 w-5" />, label: "Help Center", url: "/dashboard/help" },
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
            className="fixed inset-0 bg-black/25"
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
            className="relative flex h-full w-full max-w-xs flex-col bg-white shadow-xl"
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-100">
              <div className="font-mono text-xl font-bold text-gray-900">Jeev Veda</div>
              <button
                type="button"
                className="-m-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                {navigationItems.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                      {section.title}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleNavigation(item.url)}
                          className={cn(
                            "w-full flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200",
                            isActive(item.url)
                              ? "bg-green-50 text-green-700 border-2 border-green-200 shadow-sm"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent"
                          )}
                        >
                          <span className={cn(
                            "flex-shrink-0",
                            isActive(item.url) ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                          )}>
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-100 p-6">
              <div className="text-xs text-gray-500 text-center">
                Jeev Veda Health Platform
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}