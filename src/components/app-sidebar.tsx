"use client"

import { Home, MessageCircle, ActivitySquare, History, Shield, Scan, ClipboardList, UserCircle, Clock } from "lucide-react"
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
    <aside className="w-[240px] bg-white flex flex-col border-r border-gray-100">
      {/* Header */}
      <div className="bg-white">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-black rounded-lg">
              <span className="text-sm font-bold text-white">✚</span>
            </div>
            <div>
              <span className="text-lg font-semibold text-gray-900">Jeev Veda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Navigation Items */}
        {navigationItems.map((section, sectionIndex) => (
          <div key={section.title} className={`${sectionIndex > 0 ? 'mt-8' : ''}`}>
            <div className="px-2 mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{section.title}</h3>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.url)}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.url) 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-4 w-4 transition-colors ${
                    isActive(item.url) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom section with user info or additional links */}
        <div className="mt-auto pt-8">
          <div className="px-3 py-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-green-700">JV</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Health Assistant</p>
                <p className="text-xs text-gray-500 truncate">AI-powered analysis</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  )
}
