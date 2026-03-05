"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { FileText, Eye, Activity, Scan, Shield, Loader2, Search, ChevronLeft, ChevronRight, MoreVertical, Trash2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Report {
  _id: string
  reportType: string
  fileName?: string
  fileSize?: number
  createdAt: string
  reportData?: Record<string, unknown>
}

const TYPE_META: Record<string, { label: string; color: string; dot: string }> = {
  BLOOD_ANALYSIS: { label: "Blood Analysis", color: "text-rose-600 bg-rose-50 border-rose-100", dot: "bg-rose-400" },
  MRI_SCAN: { label: "MRI Scan", color: "text-blue-600 bg-blue-50 border-blue-100", dot: "bg-blue-400" },
  RISK_ASSESSMENT: { label: "Risk Assessment", color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-400" },
  LUNG_CANCER_SCAN: { label: "Lung Cancer Scan", color: "text-violet-600 bg-violet-50 border-violet-100", dot: "bg-violet-400" },
  OSCC_SCAN: { label: "OSCC Scan", color: "text-amber-600 bg-amber-50 border-amber-100", dot: "bg-amber-400" },
}
const getMeta = (type: string) => TYPE_META[type] ?? { label: type, color: "text-slate-600 bg-slate-50 border-slate-100", dot: "bg-slate-400" }

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

export default function ReportHistoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const isFirstLoad = useRef(true)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalReports: 0, hasNext: false, hasPrev: false })
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchReports() {
      try {
        if (isFirstLoad.current) { setLoading(true) } else { setPageLoading(true) }
        const res = await fetch(`/api/reports?page=${pagination.currentPage}&limit=10&type=ALL`)
        const data = await res.json()
        if (data.success) { setReports(data.reports); setPagination(data.pagination) }
      } catch (e) { console.error(e) } finally {
        setLoading(false); setPageLoading(false); isFirstLoad.current = false
      }
    }
    fetchReports()
  }, [pagination.currentPage])

  const confirmDelete = async () => {
    if (!reportToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/reports/${reportToDelete}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.success) {
        setReports(c => c.filter(r => r._id !== reportToDelete))
        setPagination(p => ({ ...p, totalReports: p.totalReports - 1 }))
      }
    } catch (e) { console.error(e) } finally { setIsDeleting(false); setReportToDelete(null) }
  }

  const filtered = reports.filter(r => {
    const matchesSearch =
      r._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.fileName && r.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDate = !dateFilter ||
      new Date(r.createdAt).toLocaleDateString("en-CA") === dateFilter // en-CA gives YYYY-MM-DD
    return matchesSearch && matchesDate
  })

  const stats = [
    { label: "Total", value: pagination.totalReports, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Blood Tests", value: reports.filter(r => r.reportType === "BLOOD_ANALYSIS").length, icon: Activity, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "MRI Scans", value: reports.filter(r => r.reportType === "MRI_SCAN").length, icon: Scan, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Assessments", value: reports.filter(r => r.reportType === "RISK_ASSESSMENT").length, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#F5F7FA] font-sans text-slate-900">

      {/* ── Top section ─────────────────────────────────────────────── */}
      <div className="px-4 sm:px-8 pt-6 pb-4 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Reports Overview</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Your complete medical analysis history</p>
          </div>

          {/* Add New button — opens dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 text-xs sm:text-sm shadow-md shadow-blue-200 shrink-0">
                + New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Analysis</DialogTitle>
                <DialogDescription>Choose the type of analysis you want to perform.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-3">
                {[
                  { label: "Health Chatbot", sub: "Instant answers to health questions", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-100 group-hover:bg-emerald-200", border: "hover:border-emerald-400", url: "/dashboard/chatbot" },
                  { label: "MRI Analysis", sub: "Upload and analyze MRI scans", icon: Scan, color: "text-blue-600", bg: "bg-blue-100 group-hover:bg-blue-200", border: "hover:border-blue-400", url: "/dashboard/mri-analysis" },
                  { label: "Blood Analysis", sub: "Analyze blood test reports", icon: Activity, color: "text-rose-600", bg: "bg-rose-100 group-hover:bg-rose-200", border: "hover:border-rose-400", url: "/dashboard/blood-analyzer" },
                ].map(item => (
                  <div key={item.url} onClick={() => router.push(item.url)}
                    className={cn("flex items-center gap-4 p-3 rounded-xl border border-slate-200 cursor-pointer transition-all group", item.border)}>
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center transition-colors shrink-0", item.bg)}>
                      <item.icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats — 2×2 on mobile, 4 cols on lg */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
                <p className="text-xl font-bold text-slate-800 leading-tight">{loading ? "—" : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Date */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, type or filename..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter("")}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full transition-colors">
              Clear date
            </button>
          )}
        </div>
      </div>

      {/* ── List section ─────────────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-8 pb-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
          {pageLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
              <p className="text-sm text-slate-400">Loading records...</p>
            </div>

          ) : filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                <Search className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No reports found</p>
              <p className="text-xs text-slate-400">Try adjusting your search.</p>
            </div>

          ) : (
            <>
              {/* ── Desktop table (hidden on mobile) ────────────────── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="text-left py-3 px-5 w-10 font-semibold">SR.</th>
                      <th className="text-left py-3 px-5 font-semibold">Report ID</th>
                      <th className="text-left py-3 px-5 font-semibold">Type</th>
                      <th className="text-left py-3 px-5 font-semibold">Date</th>
                      <th className="py-3 px-5 w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((r, i) => {
                      const meta = getMeta(r.reportType)
                      return (
                        <tr key={r._id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-3.5 px-5 text-slate-400 text-xs">{(pagination.currentPage - 1) * 10 + i + 1}</td>
                          <td className="py-3.5 px-5 font-mono text-slate-700 font-medium">#{r._id.slice(-8).toUpperCase()}</td>
                          <td className="py-3.5 px-5">
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border", meta.color)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500">{fmtDate(r.createdAt)}</td>
                          <td className="py-3.5 px-5 text-right">
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-slate-100">
                                  <MoreVertical className="h-4 w-4 text-slate-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/report/${r._id}`)} className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" /> View Report
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={e => { e.preventDefault(); setReportToDelete(r._id) }}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile cards (hidden on sm+) ─────────────────────── */}
              <div className="sm:hidden divide-y divide-slate-100">
                {filtered.map((r, i) => {
                  const meta = getMeta(r.reportType)
                  return (
                    <div key={r._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      {/* colour dot */}
                      <div className={cn("h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white", meta.dot)}>
                        {(pagination.currentPage - 1) * 10 + i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border", meta.color)}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">#{r._id.slice(-8).toUpperCase()} · {fmtDate(r.createdAt)}</p>
                      </div>

                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0 shrink-0 rounded-full hover:bg-slate-100">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/report/${r._id}`)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={e => { e.preventDefault(); setReportToDelete(r._id) }}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && !searchQuery && !dateFilter && (
          <div className="flex justify-between items-center gap-3 mt-4">
            <span className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{pagination.currentPage}</span> of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"
                disabled={!pagination.hasPrev}
                onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 border-transparent"
                disabled={!pagination.hasNext}
                onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog open={!!reportToDelete} onOpenChange={open => { if (!open) { setReportToDelete(null); setIsDeleting(false) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The report will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={e => { e.preventDefault(); confirmDelete() }} disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
