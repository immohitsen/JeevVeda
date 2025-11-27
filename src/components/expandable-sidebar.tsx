"use client"

import { Home, MessageCircle, ActivitySquare, History, Shield, Scan, UserCircle, Clock, ChevronLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
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
      { icon: <Scan className="h-5 w-5 flex-shrink-0" />, label: "Screening Tools", url: "/dashboard/screening-tools" },
      { icon: <UserCircle className="h-5 w-5 flex-shrink-0" />, label: "Profile", url: "/dashboard/profile" },
    ]
  },
  {
    title: "Medical Tools",
    items: [
      { icon: <ActivitySquare className="h-5 w-5 flex-shrink-0" />, label: "Blood Analyzer", url: "/dashboard/blood-analyzer" },
      { icon: <History className="h-5 w-5 flex-shrink-0" />, label: "Report History", url: "/dashboard/report-history" },
      { icon: <Shield className="h-5 w-5 flex-shrink-0" />, label: "Screening Recs", url: "/dashboard/screening-recs" },
    ]
  },
  {
    title: "Help",
    items: [
      { icon: <Clock className="h-5 w-5 flex-shrink-0" />, label: "Help Center", url: "/dashboard/help" },
    ]
  }
];

interface ExpandableSidebarProps {
  onClose?: () => void
}

export function ExpandableSidebar({ onClose }: ExpandableSidebarProps) {
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
      <SidebarBody className="justify-between gap-10 z-50">
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
                className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center hover:bg-neutral-800 transition-all duration-200"
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
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                    {section.title}
                  </h3>
                </motion.div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <div key={item.label} className="relative">
                      {isActive(item.url) ? (
                        <motion.button
                          onClick={() => handleNavigation(item.url)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 bg-neutral-100 text-neutral-900",
                            !open && "justify-center px-2"
                          )}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex-shrink-0">
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
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => handleNavigation(item.url)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 group",
                            !open && "justify-center px-2"
                          )}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="group-hover:text-neutral-900 flex-shrink-0">
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
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  )
}