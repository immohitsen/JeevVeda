"use client"

import { Home, MessageSquareDiff, HeartPulse, GalleryVerticalEnd, FileScan, UserCircle, ChevronLeft, PanelLeftClose } from "lucide-react"
import { usePathname } from "next/navigation"
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
      { icon: <MessageSquareDiff className="h-5 w-5 flex-shrink-0" />, label: "Chatbot", url: "/dashboard/chatbot" },
      { icon: <FileScan className="h-5 w-5 flex-shrink-0" />, label: "MRI Analyzer", url: "/dashboard/mri-analysis" },
      { icon: <HeartPulse className="h-5 w-5 flex-shrink-0" />, label: "Blood Analyzer", url: "/dashboard/blood-analyzer" },
      { icon: <GalleryVerticalEnd className="h-5 w-5 flex-shrink-0" />, label: "Report History", url: "/dashboard/report-history" },
    ]
  }
];

interface ExpandableSidebarProps {
  onClose?: () => void
  onNavigate?: () => void
}

export function ExpandableSidebar({ onClose, onNavigate }: ExpandableSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)


  const isActive = (path: string) => {
    return pathname === path
  }


  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10 z-50 bg-[#0E2A2A] border-none">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Toggle Button Section */}
          <div className={`relative py-4 flex ${!open && "pl-[1px]"}`}>
            <motion.div
              className="flex md:justify-start"
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
                className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-md transition-all duration-100"
              >
                <motion.div
                  animate={{
                    rotate: open ? 0 : 180,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut"
                  }}
                >
                  <PanelLeftClose className="w-5 h-5 text-slate-400 cursor-ew-resize" />
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
                    opacity: open ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.1,
                    ease: "easeInOut"
                  }}
                  className="px-2 mb-3 whitespace-nowrap overflow-hidden"
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
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 bg-white/10 text-white shadow-sm ring-1 ring-white/10 cursor-pointer",
                            !open && "pl-[9px]"
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
                            !open && "pl-[9px]"
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


        {/* (Bottom) */}
        <div className="relative z-20 w-full">
          <div className="border-t border-white/10 pt-4 mb-2 text-center text-white/50 text-sm transition-all duration-200 ease-in-out">
            Jeev Veda © {new Date().getFullYear()}
          </div>
        </div>
      </SidebarBody>
    </Sidebar >
  )
}