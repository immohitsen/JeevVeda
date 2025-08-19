"use client"

import { Activity, FileText, Home, Settings, Stethoscope, Calendar, User, X, Users, Building2, CreditCard, Package, Clock, ChevronDown, MessageCircle, ActivitySquare, History, Shield, Scan, ClipboardList, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

// Medical navigation items matching the image
const navigationItems = [
  {
    title: "Main Menu",
    items: [
      { icon: Home, label: "Dashboard", url: "/dashboard" },
      { icon: MessageCircle, label: "Chatbot", url: "/dashboard/chatbot" },
      { icon: Scan, label: "Screening Tools", url: "/dashboard/screening-tools" },
      { icon: ClipboardList, label: "Reports", url: "/dashboard/reports" },
      { icon: UserCircle, label: "Profile", url: "/dashboard/profile" },
      { icon: Users, label: "Appointments", url: "/dashboard/appointments" },
      { icon: Building2, label: "Patients", url: "/dashboard/patients" },
    ]
  },
  {
    title: "Medical Tools",
    items: [
      { icon: ActivitySquare, label: "Blood Analyzer", url: "/dashboard/blood-analyzer" },
      { icon: History, label: "Report History", url: "/dashboard/report-history" },
      { icon: Shield, label: "Screening Recs", url: "/dashboard/screening-recs" },
    ]
  },
  {
    title: "Help",
    items: [
      { icon: Clock, label: "Help Center", url: "/dashboard/help" },
    ]
  }
];

const helpItems = [
  {
    title: "Help Center",
    url: "/dashboard/help",
    icon: Clock,
  },
]

interface AppSidebarProps {
  onClose?: () => void
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (url: string) => {
    router.push(url)
    if (onClose) onClose()
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <aside className="w-[260px] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 border border-purple-300">
              <span className="text-xl font-bold text-purple-600">✚</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Jeev Veda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        {/* Navigation Items */}
        {navigationItems.map((section) => (
          <div key={section.title} className="space-y-2 mb-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main Menu</h3>
            {section.items.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.url)}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-base leading-relaxed text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors ${
                  isActive(item.url) ? 'bg-black text-white hover:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        ))}

      </nav>
    </aside>
  )
}
