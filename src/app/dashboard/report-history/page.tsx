"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { History, FileText, Download, Eye, Activity, Scan, Shield } from "lucide-react"
import { Button } from "@/components/ui/professional-button"

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
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL')
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

  // Get icon for report type
  const getIcon = (type: string) => {
    switch (type) {
      case 'BLOOD_ANALYSIS': return Activity
      case 'MRI_SCAN': return Scan
      case 'RISK_ASSESSMENT': return Shield
      default: return FileText
    }
  }

  // Get type display name
  const getTypeName = (type: string) => {
    switch (type) {
      case 'BLOOD_ANALYSIS': return 'Blood Analysis'
      case 'MRI_SCAN': return 'MRI Scan'
      case 'RISK_ASSESSMENT': return 'Risk Assessment'
      default: return type
    }
  }

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BLOOD_ANALYSIS': return 'text-red-600 bg-red-100'
      case 'MRI_SCAN': return 'text-blue-600 bg-blue-100'
      case 'RISK_ASSESSMENT': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
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
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <History className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Report History</h1>
          <p className="text-neutral-600">View and manage all your medical reports</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search reports by ID, type, or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          >
            <option value="ALL">All Report Types</option>
            <option value="BLOOD_ANALYSIS">Blood Analysis</option>
            <option value="MRI_SCAN">MRI Scans</option>
            <option value="RISK_ASSESSMENT">Risk Assessments</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-neutral-900" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{totalReports}</h3>
          <p className="text-sm text-neutral-600">Total Reports</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{bloodTests}</h3>
          <p className="text-sm text-neutral-600">Blood Tests</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Scan className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{mriScans}</h3>
          <p className="text-sm text-neutral-600">MRI Scans</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{riskAssessments}</h3>
          <p className="text-sm text-neutral-600">Risk Assessments</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Medical Reports</h3>
          <p className="text-sm text-neutral-600">All your medical reports and assessments</p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-neutral-500">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Reports Found</h3>
            <p className="text-neutral-500 mb-6">Start your health journey by taking your first assessment</p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/blood-analyzer')}
            >
              Upload Blood Report
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Report ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredReports.map((report) => {
                  const Icon = getIcon(report.reportType)
                  return (
                    <tr key={report._id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(report.reportType).replace('text-', 'bg-').replace('-600', '-100')}`}>
                            <Icon className={`w-5 h-5 ${getTypeColor(report.reportType).split(' ')[0]}`} />
                          </div>
                          <div className="text-sm font-mono font-medium text-neutral-900">
                            {report._id.slice(-8).toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.reportType)}`}>
                          {getTypeName(report.reportType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {new Date(report.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 truncate max-w-xs">
                          {report.fileName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-600">
                          {formatFileSize(report.fileSize)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/reports/${report._id}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Download report as JSON
                              const dataStr = JSON.stringify(report.reportData, null, 2)
                              const dataBlob = new Blob([dataStr], { type: 'application/json' })
                              const url = URL.createObjectURL(dataBlob)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = `report-${report._id}.json`
                              link.click()
                              URL.revokeObjectURL(url)
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={!pagination.hasPrev}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-neutral-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="primary"
          onClick={() => router.push('/dashboard/blood-analyzer')}
        >
          New Blood Analysis
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push('/dashboard/screening-tools/mri-analysis')}
        >
          New MRI Scan
        </Button>
        <Button
          variant="success"
          onClick={() => router.push('/dashboard/chatbot')}
        >
          Risk Assessment
        </Button>
      </div>
    </div>
  )
}
