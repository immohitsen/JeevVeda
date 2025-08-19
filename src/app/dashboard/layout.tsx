"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Fixed Position */}
      <div className="fixed left-0 top-0 h-full z-30">
        <AppSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[260px] bg-white">
            <AppSidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col ml-[260px]">
        {/* Header - Fixed Position */}
        <div className="fixed top-0 right-0 left-[260px] z-20 bg-white">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        </div>
        
        {/* Main Content - Scrollable with Header Offset */}
        <div className="flex-1 pt-16 overflow-y-auto">
          <div className="p-6">
            <main className="h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
