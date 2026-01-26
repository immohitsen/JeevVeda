"use client"

import React from "react"
import { ExpandableSidebar } from "@/components/expandable-sidebar"
import { MobileMenu } from "@/components/mobile-menu"
import { Header } from "@/components/header"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const handleNavigation = () => {
    setIsNavigating(true)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className={cn(
      "flex min-h-screen lg:h-screen bg-[#0E2A2A] lg:overflow-hidden overflow-x-hidden"
    )}>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block bg-[#0E2A2A]">
        <ExpandableSidebar
          onClose={() => setIsMobileMenuOpen(false)}
          onNavigate={handleNavigation}
        />
      </div>

      {/* Mobile Menu - Only visible on mobile */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col sm:p-4 h-full lg:h-full w-full max-w-[100vw] overflow-x-hidden scroll-thin">
        {/* Inner White Container */}
        <div className="flex-1 flex flex-col bg-slate-50 sm:rounded-3xl lg:overflow-hidden shadow-2xl relative min-h-[calc(100vh-2rem)] sm:min-h-0 w-full max-w-full">


          {/* Header - Sticky on mobile, relative on desktop */}
          <div className="z-20 bg-white border-b border-gray-100 sticky top-0 lg:relative">
            <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          </div>

          {/* Background Decor - Moved from page.tsx for performance */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Main Content - Scrollable */}
          <div className={cn(
            "flex-1 flex flex-col z-10 relative will-change-transform", // Added z-10 to sit above background, and will-change
            pathname?.includes('chatbot') ? "h-[calc(100vh-4rem)] lg:h-auto overflow-hidden" : "lg:overflow-y-auto lg:overscroll-y-contain scrollbar-thin" // Native scroll on mobile, inner on desktop
          )}>
            <main className="w-full flex-1 flex flex-col relative min-h-0">
              {isNavigating && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/50 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800 animate-pulse">Loading...</p>
                  </div>
                </div>
              )}
              {children}
            </main>
          </div>

        </div>
      </div>
    </div>
  )
}
