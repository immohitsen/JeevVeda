"use client"

import { useUser } from "@/hooks/useUser"
import {
  User as UserIcon,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Heart,
  Edit,
  Shield,
  Clock,
  MapPin,
  Phone,
  Activity,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

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

  // Get BMI category - Updated colors for Emerald theme
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    if (bmi < 25) return { category: 'Normal', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    if (bmi < 30) return { category: 'Overweight', color: 'bg-amber-100 text-amber-700 border-amber-200' }
    return { category: 'Obese', color: 'bg-red-100 text-red-700 border-red-200' }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <Card className="max-w-md w-full border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>Please log in to view your medical profile.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-8">
            <Button onClick={() => router.push('/login')} className="bg-emerald-600 hover:bg-emerald-700">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const bmi = calculateBMI(user.weight, user.height)
  const bmiCategory = getBMICategory(parseFloat(bmi))
  const age = calculateAge(user.dateOfBirth)

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Profile</h1>
          <p className="text-slate-500 mt-1">Manage your personal health records and settings</p>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200">
          <Edit className="w-4 h-4" /> Edit Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column - Identity Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          <Card className="overflow-hidden border-slate-200 shadow-md">
            {/* <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            </div> */}
            <CardContent className="relative pt-0 px-6 pb-8 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-10">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  {/* <AvatarImage src={user.image} /> */}
                  <AvatarFallback className="bg-slate-100 text-emerald-700 text-2xl font-bold">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-2 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">{user.fullName}</h2>
                  <p className="text-slate-500 font-medium">ID: #{user.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {/* <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">+91 98765 43210</span>
                </div> */}
                {/* <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Mumbai, India</span>
                </div> */}
              </div>

              <Separator className="my-6 bg-slate-100" />

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Blood Type</p>
                  <p className="text-lg font-bold text-slate-800">O+</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Gender</p>
                  <p className="text-lg font-bold text-slate-800 capitalize">{user.gender}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">Protected Health Data</h3>
                  <p className="text-sm text-emerald-700/80 mt-1">Your personal health information is encrypted and secure.</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </motion.div>

        {/* Right Column - Details & Metrics */}
        <div className="lg:col-span-8 space-y-6">

          {/* Vitals Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Current Vitals
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">Years</Badge>
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-slate-900">{age}</span>
                    <p className="text-sm text-slate-500">Age</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Weight className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className={cn("font-medium", bmiCategory.color)}>
                      {bmiCategory.category}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">{bmi}</span>
                      <span className="text-sm text-slate-400">BMI</span>
                    </div>
                    <p className="text-sm text-slate-500">{user.weight} kg / {user.height} cm</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <Heart className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className={user.familyHistory ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-50 text-slate-600"}>
                      History
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-slate-900">{user.familyHistory ? 'Yes' : 'No'}</span>
                    <p className="text-sm text-slate-500">Cancer History</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Detailed Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-500" /> Personal Details
                </CardTitle>
                <CardDescription>
                  Review your registration information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-slate-800 font-medium">{user.fullName}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                    <p className="text-slate-800 font-medium">{formatDate(user.dateOfBirth)}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <p className="text-slate-800 font-medium">{user.email}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined On</label>
                    <p className="text-slate-800 font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 justify-start space-x-4 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <Link href="/dashboard/report-history">
                    <div className="font-semibold text-slate-900">Report History</div>
                    <div className="text-xs text-slate-500 font-normal">View your past screenings an reports</div>
                  </Link>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
              </Button>

              {/* <Button variant="outline" className="h-auto p-4 justify-start space-x-4 border-slate-200 hover:border-blue-200 hover:bg-blue-50/50">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900">Privacy Settings</div>
                  <div className="text-xs text-slate-500 font-normal">Manage data sharing & security</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
              </Button> */}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
