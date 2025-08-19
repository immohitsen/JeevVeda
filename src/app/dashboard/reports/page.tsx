"use client"

import { FileText, Download, Eye, Search, Filter, Calendar, User, Clock, AlertTriangle, CheckCircle, XCircle, MoreHorizontal } from "lucide-react"

const reportTypes = [
  { label: "All Reports", value: "all", count: 156 },
  { label: "Blood Tests", value: "blood", count: 45 },
  { label: "Imaging", value: "imaging", count: 32 },
  { label: "Pathology", value: "pathology", count: 28 },
  { label: "Screening", value: "screening", count: 51 }
]

const reports = [
  {
    id: "RPT-2024-001",
    patientName: "John Smith",
    patientId: "PAT-001",
    type: "CT Scan",
    category: "imaging",
    date: "2024-01-15",
    status: "completed",
    priority: "normal",
    doctor: "Dr. Sarah Johnson",
    findings: "No abnormalities detected",
    description: "Chest CT scan for routine screening"
  },
  {
    id: "RPT-2024-002", 
    patientName: "Emily Davis",
    patientId: "PAT-002",
    type: "Blood Panel",
    category: "blood",
    date: "2024-01-14",
    status: "pending",
    priority: "high",
    doctor: "Dr. Michael Chen",
    findings: "Results pending",
    description: "Complete blood count and metabolic panel"
  },
  {
    id: "RPT-2024-003",
    patientName: "Robert Wilson",
    patientId: "PAT-003", 
    type: "Mammography",
    category: "screening",
    date: "2024-01-13",
    status: "completed",
    priority: "normal",
    doctor: "Dr. Lisa Rodriguez",
    findings: "BI-RADS Category 2 - Benign findings",
    description: "Annual screening mammography"
  },
  {
    id: "RPT-2024-004",
    patientName: "Maria Garcia",
    patientId: "PAT-004",
    type: "Biopsy",
    category: "pathology",
    date: "2024-01-12",
    status: "urgent",
    priority: "urgent",
    doctor: "Dr. James Thompson",
    findings: "Malignant cells detected",
    description: "Core needle biopsy of breast lesion"
  },
  {
    id: "RPT-2024-005",
    patientName: "David Brown",
    patientId: "PAT-005",
    type: "MRI Brain",
    category: "imaging",
    date: "2024-01-11",
    status: "completed",
    priority: "normal",
    doctor: "Dr. Anna Patel",
    findings: "Normal brain anatomy",
    description: "MRI brain with and without contrast"
  },
  {
    id: "RPT-2024-006",
    patientName: "Jennifer Taylor",
    patientId: "PAT-006",
    type: "Pap Smear",
    category: "screening",
    date: "2024-01-10",
    status: "completed",
    priority: "normal",
    doctor: "Dr. Susan Lee",
    findings: "Normal cytology",
    description: "Routine cervical cancer screening"
  }
]

const stats = [
  {
    title: "Total Reports",
    value: "156",
    change: "+8.2%",
    icon: FileText,
    color: "blue"
  },
  {
    title: "Pending Review",
    value: "23",
    change: "-12.5%",
    icon: Clock,
    color: "orange"
  },
  {
    title: "Urgent Cases",
    value: "5",
    change: "+2",
    icon: AlertTriangle,
    color: "red"
  },
  {
    title: "Completed Today",
    value: "12",
    change: "+3",
    icon: CheckCircle,
    color: "green"
  }
]

export default function ReportsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Reports</h1>
          <p className="text-base leading-relaxed text-gray-600">
            View and manage patient medical reports and test results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2 inline" />
            Filter
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className={`text-sm font-medium ${
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'orange' ? 'text-orange-600' :
                  'text-blue-600'
                }`}>{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'orange' ? 'bg-orange-100' :
                stat.color === 'red' ? 'bg-red-100' :
                'bg-green-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'orange' ? 'text-orange-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  'text-green-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by patient name, ID, or report type..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  type.value === 'all' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Report Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Findings
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.patientName}</div>
                        <div className="text-sm text-gray-500">{report.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.type}</div>
                    <div className="text-sm text-gray-500">{report.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' :
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {report.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {report.status === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.doctor}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {report.findings}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-purple-600 hover:text-purple-900 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
            <span className="font-medium">156</span> results
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg">
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              3
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
