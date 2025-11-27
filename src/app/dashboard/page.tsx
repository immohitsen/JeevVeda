"use client"

import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/professional-button"
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
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [totalReports, setTotalReports] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch recent reports from database
  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch('/api/reports?limit=5&page=1')
        const data = await response.json()

        if (data.success) {
          // Transform reports for display
          const transformedReports = data.reports.map((report: any) => {
            let type = ''
            let icon = Activity
            let status = 'Completed'
            let riskLevel = 'Unknown'
            let color = 'green'

            if (report.reportType === 'BLOOD_ANALYSIS') {
              type = 'Blood Analysis'
              icon = Activity
              const risk = report.reportData?.cancerRiskAssessment?.overallRisk
              riskLevel = risk ? risk.charAt(0).toUpperCase() + risk.slice(1) : 'Unknown'
              color = risk === 'low' ? 'green' : risk === 'moderate' ? 'yellow' : 'red'
            } else if (report.reportType === 'MRI_SCAN') {
              type = 'MRI Scan'
              icon = Scan
              const prediction = report.reportData?.prediction
              status = prediction === 'cancer' ? 'Review Required' : 'Normal'
              riskLevel = prediction === 'cancer' ? 'High' : 'Low'
              color = prediction === 'cancer' ? 'red' : 'green'
            } else if (report.reportType === 'RISK_ASSESSMENT') {
              type = 'Risk Assessment'
              icon = Shield
              const risk = report.reportData?.assessment?.riskCategory
              riskLevel = risk || 'Unknown'
              color = risk?.includes('Low') ? 'green' : risk?.includes('Moderate') ? 'yellow' : 'red'
            }

            return {
              id: report._id.slice(-8).toUpperCase(),
              fullId: report._id,
              type,
              date: new Date(report.createdAt).toLocaleDateString(),
              status,
              riskLevel,
              icon,
              color
            }
          })

          setRecentReports(transformedReports)
          setTotalReports(data.pagination.totalReports)
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoadingReports(false)
      }
    }

    if (user) {
      fetchReports()
    }
  }, [user])

  // Calculate health metrics from real data
  const healthMetrics = {
    overallRisk: recentReports.length > 0 ? recentReports[0].riskLevel : "Unknown",
    lastScreening: recentReports.length > 0 ? new Date(recentReports[0].date).toLocaleDateString() : "No data",
    upcomingAppointments: 0,
    reportsGenerated: totalReports
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg font-mono">Loading your health dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section with Video */}
      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, {user?.fullName || 'User'}
              </h1>
              <p className="text-sm text-neutral-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex-shrink-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-neutral-900"
              >
                <source src="/videos/stock/cancer-cells.mov" type="video/quicktime" />
                <source src="/videos/stock/cancer-cells.mov" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Section - Health Insights */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Banner Card - Health Insights */}
            <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-2xl p-8 border border-neutral-200 text-white">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">Your Health Journey</h2>
                  <p className="text-neutral-200 text-base sm:text-lg mb-6">
                    Stay ahead with AI-powered cancer detection and personalized health insights.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-green-400" />
                      <p className="text-xs text-neutral-300">Health Score</p>
                    </div>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <p className="text-xs text-neutral-300">Protected</p>
                    </div>
                    <p className="text-2xl font-bold">100%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-red-400" />
                      <p className="text-xs text-neutral-300">Active Days</p>
                    </div>
                    <p className="text-2xl font-bold">30</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Overall Risk</p>
                  <p className="text-3xl font-bold text-neutral-900">{healthMetrics.overallRisk}</p>
                </div>
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Last Screening</span>
                    <span className="text-sm font-medium text-neutral-900">{healthMetrics.lastScreening}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Reports</span>
                    <span className="text-sm font-medium text-neutral-900">{healthMetrics.reportsGenerated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Appointments</span>
                    <span className="text-sm font-medium text-neutral-900">{healthMetrics.upcomingAppointments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-neutral-900">Quick Actions</h2>
            <p className="text-sm text-neutral-500 mt-1">Access your health tools</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

            {/* Blood Analyzer */}
            <div className="group relative bg-white p-6 rounded-2xl border border-neutral-200 hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 mb-4">
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Blood Analyzer</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">Upload blood reports for AI-powered cancer risk assessment</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => router.push('/dashboard/blood-analyzer')}
                className="w-full mt-auto"
              >
                <span>Analyze Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Screening Tools */}
            <div className="group relative bg-white p-6 rounded-2xl border border-neutral-200 hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <Scan className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 mb-4">
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Screening Tools</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">Access comprehensive cancer screening tools and early detection</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/dashboard/screening-tools')}
                className="w-full mt-auto"
              >
                <span>Start Screening</span>
                <Target className="w-4 h-4" />
              </Button>
            </div>

            {/* AI Chatbot */}
            <div className="group relative bg-white p-6 rounded-2xl border border-neutral-200 hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 mb-4">
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Health Assistant</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">Chat with AI health assistant for personalized guidance</p>
              </div>
              <Button
                variant="success"
                size="sm"
                onClick={() => router.push('/dashboard/chatbot')}
                className="w-full mt-auto"
              >
                <span>Chat Now</span>
                <Zap className="w-4 h-4" />
              </Button>
            </div>

            {/* Reports Hub */}
            <div className="group relative bg-white p-6 rounded-2xl border border-neutral-200 hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 mb-4">
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Reports Hub</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">View, download, and manage all your health reports</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/reports')}
                className="w-full mt-auto"
              >
                <span>View Reports</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Recent Reports</h2>
              <p className="text-sm text-neutral-500 mt-1">Your latest health assessments</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/report-history')}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">

            {loadingReports ? (
              <div className="p-8 text-center">
                <p className="text-neutral-500">Loading reports...</p>
              </div>
            ) : recentReports.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Reports Yet</h3>
                <p className="text-neutral-500 mb-6">Start your health journey by taking your first assessment</p>
                <Button
                  variant="primary"
                  onClick={() => router.push('/dashboard/blood-analyzer')}
                >
                  <span>Upload Blood Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
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
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
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
                        <Button variant="primary" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
