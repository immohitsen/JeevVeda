"use client"

import { Menu, Search, ChevronDown, User as UserIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/professional-button"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
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
        <button
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open mobile menu</span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar - Hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reports, patients..."
            className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
          />
        </div>

        {/* Add Button - Hidden on mobile */}
        <Button variant="primary" size="sm" className="hidden sm:flex"
        onClick={() => router.push('/dashboard/dicom-viewer')}>
          <span className="hidden lg:inline">DICOM Viewer</span>
        </Button>


        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
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
                className="flex items-center gap-3 hover:bg-neutral-50 rounded-xl p-2 transition-colors"
              >
                <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials(user.fullName)}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">User</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${
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
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-2 space-y-1">
                <button
                  onClick={goToProfile}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  View Profile
                </button>
                <div className="border-t border-neutral-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
