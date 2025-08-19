"use client"

import { useState } from "react"
import { History, FileText, Download, Eye, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Report {
  id: string
  title: string
  type: 'blood-test' | 'symptom-check' | 'health-assessment' | 'cancer-screening'
  date: string
  status: 'completed' | 'pending' | 'cancelled'
  doctor?: string
  patient: string
  fileSize: string
}

export default function ReportHistoryPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const reports: Report[] = [
    {
      id: '1',
      title: 'Complete Blood Count Analysis',
      type: 'blood-test',
      date: '2024-06-20',
      status: 'completed',
      doctor: 'Dr. Sarah Johnson',
      patient: 'John Smith',
      fileSize: '2.4 MB'
    },
    {
      id: '2',
      title: 'Lung Cancer Risk Assessment',
      type: 'cancer-screening',
      date: '2024-06-18',
      status: 'completed',
      doctor: 'Dr. Michael Chen',
      patient: 'John Smith',
      fileSize: '1.8 MB'
    },
    {
      id: '3',
      title: 'Symptom Analysis Report',
      type: 'symptom-check',
      date: '2024-06-15',
      status: 'completed',
      patient: 'John Smith',
      fileSize: '3.2 MB'
    },
    {
      id: '4',
      title: 'Annual Health Assessment',
      type: 'health-assessment',
      date: '2024-06-10',
      status: 'pending',
      doctor: 'Dr. Emily Davis',
      patient: 'John Smith',
      fileSize: '4.1 MB'
    },
    {
      id: '5',
      title: 'Cholesterol Panel Results',
      type: 'blood-test',
      date: '2024-06-05',
      status: 'completed',
      doctor: 'Dr. Sarah Johnson',
      patient: 'John Smith',
      fileSize: '1.6 MB'
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blood-test': return 'text-blue-600 bg-blue-100'
      case 'symptom-check': return 'text-green-600 bg-green-100'
      case 'health-assessment': return 'text-purple-600 bg-purple-100'
      case 'cancer-screening': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.patient.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || report.type === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <History className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report History</h1>
          <p className="text-gray-600">View and manage all your medical reports</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search reports by title or patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Report Types</option>
            <option value="blood-test">Blood Tests</option>
            <option value="symptom-check">Symptom Checks</option>
            <option value="health-assessment">Health Assessments</option>
            <option value="cancer-screening">Cancer Screenings</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">5</h3>
          <p className="text-sm text-gray-600">Total Reports</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">4</h3>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">1</h3>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Download className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">13.1 MB</h3>
          <p className="text-sm text-gray-600">Total Size</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Medical Reports</h3>
          <p className="text-sm text-gray-600">All your medical reports and assessments</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.title}</div>
                    <div className="text-sm text-gray-500">{report.patient}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.type)}`}>
                      {report.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.doctor || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{report.fileSize}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          Generate New Report
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          Export All Reports
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
          Share with Doctor
        </Button>
      </div>
    </div>
  )
}
