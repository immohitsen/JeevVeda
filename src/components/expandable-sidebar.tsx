"use client"

import { Home, MessageCircle, ActivitySquare, History, Shield, Scan, UserCircle, Clock, ChevronLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarBody,
} from "@/components/ui/aceternity-sidebar"
import { useState } from "react"
import { motion } from "motion/react"

// Medical navigation items
const navigationItems = [
  {
    title: "Main Menu",
    items: [
      { icon: <Home className="h-5 w-5 flex-shrink-0" />, label: "Dashboard", url: "/dashboard" },
      { icon: <MessageCircle className="h-5 w-5 flex-shrink-0" />, label: "Chatbot", url: "/dashboard/chatbot" },
      { icon: <Scan className="h-5 w-5 flex-shrink-0" />, label: "MRI Analyzer", url: "/dashboard/mri-analysis" },
      { icon: <ActivitySquare className="h-5 w-5 flex-shrink-0" />, label: "Blood Analyzer", url: "/dashboard/blood-analyzer" },
      { icon: <History className="h-5 w-5 flex-shrink-0" />, label: "Report History", url: "/dashboard/report-history" },
    ]
  }
];

interface ExpandableSidebarProps {
  onClose?: () => void
  onNavigate?: () => void
}

export function ExpandableSidebar({ onClose, onNavigate }: ExpandableSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  const handleNavigation = (url: string) => {
    router.push(url)
    if (onClose) onClose()
  }

  const isActive = (path: string) => {
    return pathname === path
  }


  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10 z-50 bg-[#0E2A2A] border-none">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Toggle Button Section */}
          <div className="relative z-20 py-4">
            <motion.div
              className="flex justify-center md:justify-start"
              animate={{
                justifyContent: open ? "flex-start" : "center",
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              <button
                onClick={() => setOpen(!open)}
                className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-200"
              >
                <motion.div
                  animate={{
                    rotate: open ? 0 : 180,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </motion.div>
              </button>
            </motion.div>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col gap-2">
            {navigationItems.map((section, sectionIndex) => (
              <div key={section.title} className={`${sectionIndex > 0 ? 'mt-6' : ''}`}>
                {/* Section header - only show when expanded */}
                <motion.div
                  animate={{
                    display: open ? "block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="px-2 mb-3"
                >
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide">
                    {section.title}
                  </h3>
                </motion.div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <div key={item.label} className="relative">
                      {isActive(item.url) ? (
                        <Link
                          href={item.url}
                          onClick={() => {
                            if (onClose) onClose();
                            if (onNavigate) onNavigate();
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 bg-white/10 text-white shadow-sm ring-1 ring-white/10 cursor-pointer",
                            !open && "justify-center px-2"
                          )}
                        >
                          <div className="flex-shrink-0 text-emerald-400">
                            {item.icon}
                          </div>
                          <motion.span
                            animate={{
                              display: open ? "inline-block" : "none",
                              opacity: open ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut"
                            }}
                            className="whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        </Link>
                      ) : (
                        <Link
                          href={item.url}
                          onClick={() => {
                            if (onClose) onClose();
                            if (onNavigate) onNavigate();
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-neutral-400 hover:bg-white/5 hover:text-white group cursor-pointer",
                            !open && "justify-center px-2"
                          )}
                        >
                          <div className="group-hover:text-emerald-400 transition-colors flex-shrink-0">
                            {item.icon}
                          </div>
                          <motion.span
                            animate={{
                              display: open ? "inline-block" : "none",
                              opacity: open ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut"
                            }}
                            className="whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Profile Section (Bottom) */}
        <div className="relative z-20 w-full">
          <div className="border-t border-white/10 pt-4 mb-2">
            {isActive('/dashboard/profile') ? (
              <Link
                href='/dashboard/profile'
                onClick={() => {
                  if (onClose) onClose();
                  if (onNavigate) onNavigate();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 bg-white/10 text-white shadow-sm ring-1 ring-white/10 cursor-pointer",
                  !open && "justify-center px-2"
                )}
              >
                <div className="flex-shrink-0 text-emerald-400">
                  <UserCircle className="h-5 w-5 flex-shrink-0" />
                </div>
                <motion.span
                  animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="whitespace-nowrap"
                >
                  Profile
                </motion.span>
              </Link>
            ) : (
              <Link
                href='/dashboard/profile'
                onClick={() => {
                  if (onClose) onClose();
                  if (onNavigate) onNavigate();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-neutral-400 hover:bg-white/5 hover:text-white group cursor-pointer",
                  !open && "justify-center px-2"
                )}
              >
                <div className="group-hover:text-emerald-400 transition-colors flex-shrink-0">
                  <UserCircle className="h-5 w-5 flex-shrink-0" />
                </div>
                <motion.span
                  animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="whitespace-nowrap"
                >
                  Profile
                </motion.span>
              </Link>
            )}
          </div>
        </div>
      </SidebarBody>
    </Sidebar >
  )
}