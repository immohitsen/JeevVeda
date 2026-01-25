"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/professional-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Activity,
  Scan,
  MessageSquare,
  FileText,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  Sparkles,
  ChevronRight,
  Menu,
  Clock
} from "lucide-react"
import { motion, AnimatePresence, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}

interface ReportData {
  _id: string;
  reportType: string;
  createdAt: string;
  reportData?: {
    cancerRiskAssessment?: {
      overallRisk?: string;
    };
    prediction?: string;
    assessment?: {
      riskCategory?: string;
    };
  };
}

export default function Dashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  // Use separate state for mounted to handle hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [recentReports, setRecentReports] = useState<Array<{
    id: string;
    fullId: string;
    type: string;
    date: string;
    status: string;
    riskLevel: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [totalReports, setTotalReports] = useState(0)

  // Handle mounting and time
  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000) // Update every minute is enough
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
          const transformedReports = data.reports.map((report: ReportData) => {
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

  // Calculate real health metrics
  const [healthMetrics, setHealthMetrics] = useState({
    wellnessScore: 0,
    wellnessColor: 'gray',
    actionItems: 0,
    totalReports: 0,
    lastScreening: "No data",
    riskLevel: "Unknown"
  })

  // Update metrics when reports change
  useEffect(() => {
    if (recentReports.length > 0) {
      // 1. Calculate Wellness Score (Avg of last 3)
      const last3 = recentReports.slice(0, 3)
      let totalScore = 0

      last3.forEach(report => {
        if (report.riskLevel === 'Low' || report.status === 'Normal') totalScore += 100
        else if (report.riskLevel === 'Medium' || report.riskLevel === 'Moderate') totalScore += 75
        else if (report.riskLevel === 'High' || report.status === 'Review Required') totalScore += 50
        else totalScore += 70 // Unknown
      })

      const wellnessScore = Math.round(totalScore / last3.length)
      const wellnessColor = wellnessScore >= 90 ? 'emerald' : wellnessScore >= 70 ? 'amber' : 'red'

      // 2. Count "Action Required" items (High risk or review needed)
      let actionCount = 0
      recentReports.forEach(report => {
        if (report.riskLevel === 'High' || report.status === 'Review Required') {
          actionCount++
        }
      })

      setHealthMetrics({
        wellnessScore,
        wellnessColor,
        actionItems: actionCount,
        totalReports: totalReports, // Use the state variable directly
        lastScreening: new Date(recentReports[0].date).toLocaleDateString(),
        riskLevel: recentReports[0].riskLevel
      })
    }
  }, [recentReports, totalReports]) // Added totalReports dependency



  const getGreeting = () => {
    const hrs = currentTime.getHours()
    if (hrs < 12) return 'Good Morning'
    if (hrs < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    )
  }


  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50/50"
    >
      {/* Background Decor Removed - Moved to Layout for performance */}

      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex-1 space-y-1.5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50 text-xs font-semibold text-emerald-600 tracking-wide uppercase"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>AI Health Assistant Active</span>
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                {getGreeting()}, <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{user?.fullName?.split(' ')[0] || 'User'}</span>
              </h1>
              <p className="text-slate-500 text-base font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative group rounded-2xl overflow-hidden shadow-lg border-2 border-white"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-32 md:w-48 md:h-28 object-cover bg-slate-900"
              >
                <source src="/videos/stock/cancer-cells.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute bottom-2 right-2 z-20">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Info Cards */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Hero Health Card */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 shadow-xl"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                      <Heart className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Health Status</h2>
                      <p className="text-white/60 text-sm">Real-time analysis</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1">
                      <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Overall Score</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold tracking-tight">{healthMetrics.wellnessScore}</span>
                        <span className="text-sm text-emerald-400 font-medium">%</span>
                      </div>
                    </div>
                    <div className="space-y-1 border-l border-white/10 pl-8">
                      <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Action Required</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className={cn("text-4xl font-bold tracking-tight",
                          healthMetrics.actionItems > 0 ? "text-red-400" : "text-white"
                        )}>{healthMetrics.actionItems}</span>
                        <span className="text-sm text-white/60 font-medium">pending</span>
                      </div>
                    </div>
                    <div className="space-y-1 border-l border-white/10 pl-8">
                      <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Total Reports</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold tracking-tight">{healthMetrics.totalReports}</span>
                        <span className="text-sm text-white/60 font-medium">docs</span>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-auto">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${healthMetrics.wellnessScore}%` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className={cn("h-full rounded-full bg-gradient-to-r",
                        healthMetrics.wellnessColor === 'emerald' ? "from-emerald-500 to-teal-400" :
                          healthMetrics.wellnessColor === 'amber' ? "from-amber-500 to-yellow-400" :
                            "from-red-500 to-pink-500"
                      )}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-2 text-right">
                    {healthMetrics.wellnessScore > 0 ? "Analyzing your latest health data" : "No sufficient data yet"}
                  </p>

                </div>
              </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-rows-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div>
                  <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Risk Assessment</p>
                  <p className={cn("text-2xl font-bold",
                    healthMetrics.riskLevel === 'Low' ? 'text-emerald-600' :
                      healthMetrics.riskLevel === 'Medium' ? 'text-amber-500' :
                        healthMetrics.riskLevel === 'Unknown' ? 'text-slate-900' : 'text-red-600'
                  )}>{healthMetrics.riskLevel}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                  <Shield className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div>
                  <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Last Screening</p>
                  <p className="text-2xl font-bold text-slate-800">{healthMetrics.lastScreening}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                  <Clock className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div>
                  <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Reports</p>
                  <p className="text-2xl font-bold text-slate-800">{healthMetrics.totalReports}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Blood Analysis", icon: Activity, color: "red", url: "/dashboard/blood-analyzer", desc: "Upload reports" },
              { title: "Screening Tools", icon: Scan, color: "blue", url: "/dashboard/screening-tools", desc: "Early detection" },
              { title: "AI Assistant", icon: MessageSquare, color: "emerald", url: "/dashboard/chatbot", desc: "Get answers" },
              { title: "Sample Report", icon: FileText, color: "violet", url: "/dashboard/report/mock", desc: "View MRI Demo" }
            ].map((action, i) => (
              <motion.button
                key={action.title}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(action.url)}
                className="group relative flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  `bg-${action.color}-50 text-${action.color}-500`
                )}>
                  <action.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{action.title}</h3>
                <p className="text-xs text-slate-500">{action.desc}</p>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Recent Reports</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{recentReports.length}</span>
            </div>
            <Button variant="ghost" className="text-slate-500 hover:text-slate-900" onClick={() => router.push('/dashboard/report-history')}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingReports ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No reports yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Your health reports will appear here once you complete your first screening or analysis.</p>
                <Button onClick={() => router.push('/dashboard/blood-analyzer')}>
                  Start First Analysis
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Report</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Risk Level</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {recentReports.map((report, i) => (
                        <motion.tr
                          key={report.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(248,250,252, 0.8)" }}
                          className="group cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                                report.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
                                  report.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                              )}>
                                <report.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{report.type}</p>
                                <p className="text-xs text-slate-500 font-mono">#{report.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden sm:table-cell">
                            <p className="text-sm text-slate-600">{report.date}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              report.status.includes('Normal') || report.status.includes('Completed')
                                ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                                : "bg-amber-50/50 border-amber-100 text-amber-700"
                            )}>
                              {report.status.includes('Normal') || report.status.includes('Completed') ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                              )}
                              {report.status}
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <span className={cn("text-sm font-medium",
                              report.riskLevel === 'Low' ? "text-emerald-600" :
                                report.riskLevel === 'Medium' ? "text-amber-600" : "text-red-600"
                            )}>
                              {report.riskLevel}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              Details <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}


