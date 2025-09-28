"use client"

import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { BrutalButton } from "@/components/ui/brutal-button"
import {
  Activity,
  Scan,
  MessageSquare,
  FileText,
  Heart,
  Wind,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  Target
} from "lucide-react"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const recentReports = [
    {
      id: "RPT-001",
      type: "Blood Analysis",
      date: "2025-01-15",
      status: "Normal",
      riskLevel: "Low",
      icon: Activity,
      color: "green"
    },
    {
      id: "RPT-002", 
      type: "Lung Screening",
      date: "2025-01-10",
      status: "Review Required",
      riskLevel: "Medium",
      icon: Wind,
      color: "yellow"
    },
    {
      id: "RPT-003",
      type: "Cancer Risk Assessment", 
      date: "2025-01-05",
      status: "Completed",
      riskLevel: "Low",
      icon: Shield,
      color: "green"
    }
  ]

  const healthMetrics = {
    overallRisk: "Low",
    lastScreening: "15 days ago",
    upcomingAppointments: 2,
    reportsGenerated: 12
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg font-mono">Loading your health dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 opacity-60"></div>
        <div className="relative px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">

              {/* Left: Welcome & User Info */}
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-gray-600 uppercase tracking-wide">
                      {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                    <span className="text-gray-900">Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'},</span>
                    <br />
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {user?.fullName || 'Health Warrior'}
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed">
                    Your personalized cancer screening and health analysis dashboard is ready.
                  </p>
                </div>

                {/* Quick Stats - Mobile optimized */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{healthMetrics.overallRisk}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Overall Risk</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{healthMetrics.reportsGenerated}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Reports</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Medical Visualization - Mobile optimized */}
              <div className="relative w-full order-first lg:order-last">
                <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl lg:rounded-3xl overflow-hidden">
                  {/* Animated lung visualization - Scaled for mobile */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Main lung structure - Responsive sizing */}
                      <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 to-green-300/30 rounded-full"></div>

                        {/* Left lung */}
                        <div className="absolute top-8 left-6 sm:top-10 sm:left-7 lg:top-12 lg:left-8 w-16 h-24 sm:w-20 sm:h-28 lg:w-24 lg:h-32 bg-gradient-to-br from-blue-400/40 to-blue-300/30 rounded-full animate-pulse"></div>

                        {/* Right lung */}
                        <div className="absolute top-8 right-6 sm:top-10 sm:right-7 lg:top-12 lg:right-8 w-16 h-24 sm:w-20 sm:h-28 lg:w-24 lg:h-32 bg-gradient-to-br from-green-400/40 to-green-300/30 rounded-full animate-pulse"></div>

                        {/* Heart */}
                        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-300/40 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>

                  {/* Floating health indicators - Mobile optimized */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 bg-white/90 backdrop-blur-sm rounded-lg lg:rounded-xl p-2 lg:p-3">
                    <div className="flex items-center gap-1 lg:gap-2">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      <span className="text-xs sm:text-sm font-semibold">72 BPM</span>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 lg:bottom-6 lg:left-6 bg-white/90 backdrop-blur-sm rounded-lg lg:rounded-xl p-2 lg:p-3">
                    <div className="flex items-center gap-1 lg:gap-2">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      <span className="text-xs sm:text-sm font-semibold">Healthy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Health Command Center</h2>
            <p className="text-sm md:text-base text-gray-600">One-click access to powerful health analysis tools</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Blood Analyzer */}
            <div className="group relative bg-white p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-red-100 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Blood Analyzer</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">Upload blood reports for AI-powered cancer risk assessment</p>
                </div>
                <BrutalButton
                  variant="danger"
                  size="sm"
                  onClick={() => router.push('/dashboard/blood-analyzer')}
                  className="w-full justify-center group-hover:translate-x-1 group-hover:translate-y-1"
                >
                  <span>Analyze Now</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </BrutalButton>
              </div>
            </div>

            {/* Screening Tools */}
            <div className="group relative bg-white p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scan className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Screening Tools</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">Access comprehensive cancer screening tools and early detection</p>
                </div>
                <BrutalButton
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/dashboard/screening-tools')}
                  className="w-full justify-center group-hover:translate-x-1 group-hover:translate-y-1"
                >
                  <span>Start Screening</span>
                  <Target className="w-4 h-4 ml-2" />
                </BrutalButton>
              </div>
            </div>

            {/* AI Chatbot */}
            <div className="group relative bg-white p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Health Assistant</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">Chat with AI health assistant for personalized guidance</p>
                </div>
                <BrutalButton
                  variant="success"
                  size="sm"
                  onClick={() => router.push('/dashboard/chatbot')}
                  className="w-full justify-center group-hover:translate-x-1 group-hover:translate-y-1"
                >
                  <span>Chat Now</span>
                  <Zap className="w-4 h-4 ml-2" />
                </BrutalButton>
              </div>
            </div>

            {/* Reports Hub */}
            <div className="group relative bg-white p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-purple-100 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Reports Hub</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">View, download, and manage all your health reports</p>
                </div>
                <BrutalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/reports')}
                  className="w-full justify-center group-hover:translate-x-1 group-hover:translate-y-1 border-purple-300 hover:bg-purple-50"
                >
                  <span>View Reports</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </BrutalButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Recent Health Reports</h3>
                  <p className="text-sm text-gray-600 mt-1">Track your health journey with detailed analysis reports</p>
                </div>
                <BrutalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/report-history')}
                  className="w-full sm:w-auto"
                >
                  View All Reports
                  <ArrowRight className="w-4 h-4 ml-2" />
                </BrutalButton>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="divide-y divide-gray-100">
                {recentReports.map((report) => (
                  <div key={report.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          report.color === 'green' ? 'bg-green-100' :
                          report.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <report.icon className={`w-4 h-4 ${
                            report.color === 'green' ? 'text-green-600' :
                            report.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-mono font-medium text-sm text-gray-900">{report.id}</div>
                          <div className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <BrutalButton variant="ghost" size="sm">
                        View
                      </BrutalButton>
                    </div>

                    <div>
                      <div className="font-medium text-sm text-gray-900 mb-1">{report.type}</div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'Normal' || report.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          report.status === 'Review Required' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {report.status === 'Normal' || report.status === 'Completed' ?
                            <CheckCircle className="w-3 h-3" /> :
                            <AlertTriangle className="w-3 h-3" />
                          }
                          {report.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          report.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                          report.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {report.riskLevel} Risk
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-4 lg:p-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Report ID</th>
                    <th className="text-left p-4 lg:p-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                    <th className="text-left p-4 lg:p-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                    <th className="text-left p-4 lg:p-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                    <th className="text-left p-4 lg:p-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Risk Level</th>
                    <th className="text-left p-4 lg:p-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 lg:p-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${
                            report.color === 'green' ? 'bg-green-100' :
                            report.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <report.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${
                              report.color === 'green' ? 'text-green-600' :
                              report.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <span className="font-mono font-medium text-gray-900">{report.id}</span>
                        </div>
                      </td>
                      <td className="p-4 lg:p-6">
                        <span className="font-medium text-gray-900">{report.type}</span>
                      </td>
                      <td className="p-4 lg:p-6">
                        <span className="text-gray-600">{new Date(report.date).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4 lg:p-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'Normal' || report.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          report.status === 'Review Required' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {report.status === 'Normal' || report.status === 'Completed' ?
                            <CheckCircle className="w-3 h-3" /> :
                            <AlertTriangle className="w-3 h-3" />
                          }
                          {report.status}
                        </span>
                      </td>
                      <td className="p-4 lg:p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          report.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                          report.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {report.riskLevel}
                        </span>
                      </td>
                      <td className="p-4 lg:p-6">
                        <BrutalButton variant="ghost" size="sm">
                          View Details
                        </BrutalButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
