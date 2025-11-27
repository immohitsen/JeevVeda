"use client"

import type React from "react"
import { ExpandableSidebar } from "@/components/expandable-sidebar"
import { MobileMenu } from "@/components/mobile-menu"
import { Header } from "@/components/header"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className={cn(
      "flex h-screen bg-white overflow-hidden"
    )}>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <ExpandableSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Menu - Only visible on mobile */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Full Width */}
        <div className="z-20 bg-white border-b border-gray-100">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-0 sm:p-4">
            <main className="w-full bg-white min-h-full sm:rounded-lg">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
