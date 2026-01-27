"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/professional-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileScan,
  HeartPulse,
  Scan,
  MessageSquareDiff,
  FileText,
  Heart,
  Shield,
  Sparkles,
  ChevronRight,
  Clock,
  ArrowRight,
  MoreVertical,
  Eye,
  Activity
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

  // Helper functions for table style
  const getTypeName = (type: string) => {
    switch (type) {
      case 'BLOOD_ANALYSIS': return 'Blood Analysis'
      case 'MRI_SCAN': return 'MRI Scan'
      case 'RISK_ASSESSMENT': return 'Risk Assessment'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BLOOD_ANALYSIS': return 'text-rose-600 bg-rose-50'
      case 'MRI_SCAN': return 'text-blue-600 bg-blue-50'
      case 'RISK_ASSESSMENT': return 'text-emerald-600 bg-emerald-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const [recentReports, setRecentReports] = useState<Array<{
    id: string;
    fullId: string;
    type: string;
    rawType: string;
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
            let icon = HeartPulse
            let status = 'Completed'
            let riskLevel = 'Unknown'
            let color = 'green'

            if (report.reportType === 'BLOOD_ANALYSIS') {
              type = 'Blood Analysis'
              icon = HeartPulse
              const risk = report.reportData?.cancerRiskAssessment?.overallRisk
              riskLevel = risk ? risk.charAt(0).toUpperCase() + risk.slice(1) : 'Unknown'
              color = risk === 'low' ? 'green' : risk === 'moderate' ? 'yellow' : 'red'
            } else if (report.reportType === 'MRI_SCAN') {
              type = 'MRI Scan'
              icon = FileScan
              const prediction = report.reportData?.prediction
              status = prediction === 'cancer' ? 'Review Required' : 'Normal'
              riskLevel = prediction === 'cancer' ? 'High' : 'Low'
              color = prediction === 'cancer' ? 'red' : 'green'
            } else if (report.reportType === 'RISK_ASSESSMENT') {
              type = 'Risk Assessment'
              icon = MessageSquareDiff
              const risk = report.reportData?.assessment?.riskCategory
              riskLevel = risk || 'Unknown'
              color = risk?.includes('Low') ? 'green' : risk?.includes('Moderate') ? 'yellow' : 'red'
            }

            return {
              id: report._id.slice(-8).toUpperCase(),
              fullId: report._id,
              type,
              rawType: report.reportType, // Added rawType for styling helpers
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
      className="h-full bg-slate-50/50 w-full max-w-[100vw] overflow-x-hidden min-h-0"
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
              {/* <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50 text-xs font-semibold text-emerald-600 tracking-wide uppercase"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>AI Health Assistant Active</span>
              </motion.div> */}
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
              {/* <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-32 md:w-48 md:h-28 object-cover bg-slate-900"
              >
                <source src="/videos/stock/cancer-cells.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video> */}
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
              className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl"
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="flex items-center sm:block space-y-0 sm:space-y-1 justify-between sm:justify-start">
                      <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Overall Score</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold tracking-tight">{healthMetrics.wellnessScore}</span>
                        <span className="text-sm text-emerald-400 font-medium">%</span>
                      </div>
                    </div>
                    <div className="flex items-center sm:block space-y-0 sm:space-y-1 justify-between sm:justify-start sm:border-l border-white/10 pt-4 sm:pt-0 border-t sm:border-t-0 sm:pl-8">
                      <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Action Required</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className={cn("text-4xl font-bold tracking-tight",
                          healthMetrics.actionItems > 0 ? "text-red-400" : "text-white"
                        )}>{healthMetrics.actionItems}</span>
                        <span className="text-sm text-white/60 font-medium">pending</span>
                      </div>
                    </div>
                    <div className="flex items-center sm:block space-y-0 sm:space-y-1 justify-between sm:justify-start sm:border-l border-white/10 pt-4 sm:pt-0 border-t sm:border-t-0 sm:pl-8">
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
                  <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Body Mass Index</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-900">
                      {user?.weight && user?.height
                        ? (user.weight / ((user.height / 100) * (user.height / 100))).toFixed(1)
                        : "N/A"}
                    </p>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                      (() => {
                        if (!user?.weight || !user?.height) return "bg-slate-100 text-slate-500";
                        const bmi = user.weight / ((user.height / 100) * (user.height / 100));
                        if (bmi < 18.5) return "bg-blue-50 text-blue-600";
                        if (bmi < 25) return "bg-emerald-50 text-emerald-600";
                        if (bmi < 30) return "bg-amber-50 text-amber-600";
                        return "bg-red-50 text-red-600";
                      })()
                    )}>
                      {(() => {
                        if (!user?.weight || !user?.height) return "Update Profile";
                        const bmi = user.weight / ((user.height / 100) * (user.height / 100));
                        if (bmi < 18.5) return "Underweight";
                        if (bmi < 25) return "Normal";
                        if (bmi < 30) return "Overweight";
                        return "Obese";
                      })()}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                  <HeartPulse className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Blood Analyzer",
                icon: HeartPulse,
                gradient: "from-rose-100 via-rose-50 to-white",
                shadow: "shadow-rose-100",
                iconBg: "bg-rose-500",
                url: "/dashboard/blood-analyzer",
                desc: "Analyze blood test reports for comprehensive health insights.",
                bgIcon: <HeartPulse className="w-64 h-64 text-rose-500 opacity-[0.1]" />
              },
              {
                title: "MRI Analyzer",
                icon: FileScan,
                gradient: "from-blue-100 via-blue-50 to-white",
                shadow: "shadow-blue-100",
                iconBg: "bg-blue-500",
                url: "/dashboard/mri-analysis",
                desc: "Upload MRI scans for AI-powered fast and accurate detection.",
                bgIcon: <FileScan className="w-64 h-64 text-blue-500 opacity-[0.1]" />
              },
              {
                title: "Symptom Checker",
                icon: MessageSquareDiff,
                gradient: "from-emerald-100 via-emerald-50 to-white",
                shadow: "shadow-emerald-100",
                iconBg: "bg-emerald-500",
                url: "/dashboard/chatbot",
                desc: "Chat with our AI assistant to understand your symptoms better.",
                bgIcon: <MessageSquareDiff className="w-64 h-64 text-emerald-500 opacity-[0.1]" />
              },
            ].map((action) => (
              <motion.button
                key={action.title}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(action.url)}
                className={cn(
                  "cursor-pointer group relative overflow-hidden rounded-[32px] p-8 h-70 text-left transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200 border-2",
                  `bg-gradient-to-b ${action.gradient} ${action.shadow}`
                )}
              >
                {/* Background Decoration */}
                <div className="absolute -right-10 -top-10 transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 ease-out">
                  {action.bgIcon}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform ", action.iconBg)}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{action.title}</h3>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-[90%]">
                      {action.desc}
                    </p>
                  </div>
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
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-semibold text-slate-600">{recentReports.length}</span>
            </div>
            <Button variant="ghost" className="text-slate-500 hover:text-slate-900 cursor-pointer border border-slate-300" onClick={() => router.push('/dashboard/report-history')}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full max-w-full">
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
              <div className="flex flex-col min-h-0 relative overflow-hidden">
                {/* Header - Fixed */}
                <div className="grid grid-cols-[60px_1.5fr_1.5fr_80px] sm:grid-cols-[60px_1fr_1fr_1fr_80px] bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <div className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sr.</div>
                  <div className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Report ID</div>
                  <div className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</div>
                  <div className="hidden sm:block text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</div>
                  <div className="text-right py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</div>
                </div>

                {/* Body */}
                <div className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {recentReports.map((report, i) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        // whileHover={{ backgroundColor: "rgba(248,250,252, 0.8)" }}
                        className="hover:bg-slate-50/80 grid grid-cols-[60px_1.5fr_1.5fr_80px] sm:grid-cols-[60px_1fr_1fr_1fr_80px] group active:bg-slate-50 items-center"
                      >
                        {/* Sr No */}
                        <div className="py-4 px-6">
                          <span className="text-sm text-slate-500 font-medium">
                            {i + 1}.
                          </span>
                        </div>

                        {/* ID */}
                        <div className="py-4 px-6 truncate">
                          <span className="font-mono text-sm font-medium text-slate-700">
                            #{report.id}
                          </span>
                        </div>

                        {/* Type Badge */}
                        <div className="py-4 px-6">
                          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap", getTypeColor(report.rawType).replace('text-', 'border-').replace('bg-', 'bg-opacity-10 '))} >
                            {getTypeName(report.rawType)}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="py-4 px-6 hidden sm:block">
                          <p className="text-sm text-slate-600 whitespace-nowrap">
                            {new Date(report.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, {new Date(report.date).getFullYear()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="py-4 px-6 text-right relative flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200 rounded-full">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4 text-slate-800" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/report/${report.fullId}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Report</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}


