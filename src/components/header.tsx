"use client"

import { Menu, Search, Plus, Mail, Bell, Settings, ChevronDown, User as UserIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const { user, loading, isAuthenticated, logout } = useUser()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate initials from full name
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Handle profile navigation
  const goToProfile = () => {
    router.push('/dashboard/profile')
    setIsDropdownOpen(false)
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
    router.push('/login')
    setIsDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-white px-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search here"
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Add Button */}
        <Button className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg text-base leading-relaxed">
          <Plus className="w-4 h-4 mr-2" />
          Add
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>

        {/* Notification Icons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Mail className="h-5 w-5" />
            <span className="sr-only">Mail</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            {loading ? (
              // Loading state
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="text-left">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-20"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            ) : isAuthenticated && user ? (
              // Authenticated user
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600">
                    {getInitials(user.fullName)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-base leading-relaxed font-medium text-gray-900">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">User</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>
            ) : (
              // Not authenticated - fallback
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="text-base leading-relaxed font-medium text-gray-900">Guest</p>
                  <p className="text-xs text-gray-500">Not logged in</p>
                </div>
              </div>
            )}
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && isAuthenticated && user && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={goToProfile}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
