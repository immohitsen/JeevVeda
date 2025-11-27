"use client"

import { useUser } from "@/hooks/useUser"
import { User as UserIcon, Mail, Calendar, Ruler, Weight, Heart, Edit, Shield, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useUser()
  const router = useRouter()

  // Generate initials from full name
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate age
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Calculate BMI
  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    return bmi.toFixed(1)
  }

  // Get BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' }
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' }
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' }
    return { category: 'Obese', color: 'text-red-600' }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-200 rounded-xl h-96"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-gray-200 rounded-xl h-96"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h1>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const bmi = calculateBMI(user.weight, user.height)
  const bmiCategory = getBMICategory(parseFloat(bmi))

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-base leading-relaxed text-gray-600">
          View and manage your personal information and health details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">
                  {getInitials(user.fullName)}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">{user.fullName}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Age</p>
                  <p className="text-sm text-gray-600">{calculateAge(user.dateOfBirth)} years old</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Gender</p>
                  <p className="text-sm text-gray-600">{user.gender}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Heart className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Family History</p>
                  <p className="text-sm text-gray-600">
                    {user.familyHistory ? 'Yes' : 'No'} cancer history
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Details and Health Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{user.fullName}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{formatDate(user.dateOfBirth)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{user.gender}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Height</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Ruler className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{user.height} cm</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Weight</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Weight className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{user.weight} kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Health Metrics</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900 mb-1">{calculateAge(user.dateOfBirth)}</p>
                <p className="text-sm text-blue-700">Years Old</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Weight className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900 mb-1">{bmi}</p>
                <p className="text-sm text-green-700">BMI</p>
                <p className={`text-xs font-medium ${bmiCategory.color}`}>{bmiCategory.category}</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900 mb-1">
                  {user.familyHistory ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-purple-700">Family History</p>
                <p className="text-xs text-purple-600">Cancer related</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Health Screening</p>
                  <p className="text-sm text-gray-600">Schedule your next screening</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Medical History</p>
                  <p className="text-sm text-gray-600">View your health records</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
