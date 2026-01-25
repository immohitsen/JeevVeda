"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, Eye, Activity, Scan, Shield, Loader2, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface Report {
  _id: string;
  reportType: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  reportData?: Record<string, unknown>;
}

export default function ReportHistoryPage() {
  const router = useRouter()
  const [selectedFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    hasNext: false,
    hasPrev: false
  })

  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Open delete confirmation
  const initiateDelete = (reportId: string) => {
    setReportToDelete(reportId)
  }

  // Actual delete handler
  const confirmDelete = async () => {
    if (!reportToDelete) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/reports/${reportToDelete}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Remove from local state
        setReports(current => current.filter(r => r._id !== reportToDelete))
        setPagination(prev => ({ ...prev, totalReports: prev.totalReports - 1 }))
      } else {
        alert(data.error || "Failed to delete report") // Keep alert for error only
      }
      setIsDeleting(false)
    } catch (error) {
      console.error("Error deleting report:", error)
      alert("An unexpected error occurred")
      setIsDeleting(false)
    } finally {
      setIsDeleting(false)
      setReportToDelete(null)
    }
  }

  // Fetch reports from API
  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true)
        const response = await fetch(`/api/reports?page=${pagination.currentPage}&limit=20&type=${selectedFilter}`)
        const data = await response.json()

        if (data.success) {
          setReports(data.reports)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [pagination.currentPage, selectedFilter])



  // Get type display name
  const getTypeName = (type: string) => {
    switch (type) {
      case 'BLOOD_ANALYSIS': return 'Blood Analysis'
      case 'MRI_SCAN': return 'MRI Scan'
      case 'RISK_ASSESSMENT': return 'Risk Assessment'
      default: return type
    }
  }

  // Get type color - Professional/Static style
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BLOOD_ANALYSIS': return 'text-rose-600 bg-rose-50'
      case 'MRI_SCAN': return 'text-blue-600 bg-blue-50'
      case 'RISK_ASSESSMENT': return 'text-emerald-600 bg-emerald-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }



  // Filter reports by search query
  const filteredReports = reports.filter(report => {
    const matchesSearch = report._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.fileName && report.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  // Calculate stats
  const totalReports = pagination.totalReports
  const bloodTests = reports.filter(r => r.reportType === 'BLOOD_ANALYSIS').length
  const mriScans = reports.filter(r => r.reportType === 'MRI_SCAN').length
  const riskAssessments = reports.filter(r => r.reportType === 'RISK_ASSESSMENT').length

  return (
    <div className="h-screen max-w-full flex flex-col bg-[#F5F7FA] font-sans text-slate-900 overflow-hidden px-8 pt-4">

      {/* Fixed Top Section: Header & Stats */}
      <div className="flex-none p-6 pb-0 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports Overview</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and track your medical history</p>
          </div>
          <div>
            <Button
              onClick={() => router.push('/dashboard/blood-analyzer')}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-md shadow-blue-200"
            >
              + Add New Analysis
            </Button>
          </div>
        </div>

        {/* Stats Cards - Clean White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Reports", value: totalReports, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Blood Tests", value: bloodTests, icon: Activity, color: "text-rose-500", bg: "bg-rose-50" },
            { label: "MRI Scans", value: mriScans, icon: Scan, color: "text-indigo-500", bg: "bg-indigo-50" },
            { label: "Risk Assessments", value: riskAssessments, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col justify-between h-28 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Bottom Section: Filter & List */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">

        {/* Reports List Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800">Reports List</h2>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
              </div>

              {/* Filter Buttons */}
              {/* <div className="flex items-center bg-white rounded-full border border-slate-200 p-1 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                <button className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-full flex items-center justify-center gap-1">
                  <Filter className="w-3 h-3" /> Filter
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-full flex items-center justify-center gap-1">
                  <ArrowUpDown className="w-3 h-3" /> Sort
                </button>
              </div> */}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden w-full max-w-full">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-slate-500 text-sm">Loading records...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No reports found</h3>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Report ID</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((report) => (
                      <tr
                        key={report._id}
                        className="group hover:bg-slate-50/80 transition-colors active:bg-slate-100"
                      >
                        {/* ID */}
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm font-medium text-slate-700">
                            #{report._id.slice(-6).toUpperCase()}
                          </span>
                        </td>

                        {/* Type Badge */}
                        <td className="py-4 px-6">
                          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap", getTypeColor(report.reportType).replace('text-', 'border-').replace('bg-', 'bg-opacity-10 '))} >
                            {getTypeName(report.reportType)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 hidden sm:table-cell">
                          <p className="text-sm text-slate-600 whitespace-nowrap">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu key={`menu-${report._id}-${reportToDelete}`} modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="cursor-pointer h-8 w-8 p-0 hover:bg-slate-200 rounded-full">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4 text-slate-800" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/report/${report._id}`)}
                                className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Report</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault()
                                  initiateDelete(report._id)
                                }}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-end items-center gap-4 mt-8">
              <span className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-800">{pagination.currentPage}</span> of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 border-transparent"
                  disabled={!pagination.hasNext}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => {
        if (!open) {
          setReportToDelete(null)
          setIsDeleting(false)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // Validate first
                confirmDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
