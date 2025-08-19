"use client"

import { useState } from "react"
import { ActivitySquare, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BloodTestResult {
  id: string
  testName: string
  value: number
  unit: string
  referenceRange: string
  status: 'normal' | 'high' | 'low' | 'critical'
  trend: 'up' | 'down' | 'stable'
  lastTest?: number
  lastTestDate?: string
}

export default function BloodAnalyzerPage() {
  const [selectedTest, setSelectedTest] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const bloodTestResults: BloodTestResult[] = [
    {
      id: '1',
      testName: 'Hemoglobin',
      value: 14.2,
      unit: 'g/dL',
      referenceRange: '12.0 - 16.0',
      status: 'normal',
      trend: 'stable',
      lastTest: 13.8,
      lastTestDate: '2024-06-15'
    },
    {
      id: '2',
      testName: 'White Blood Cells',
      value: 11.5,
      unit: 'K/μL',
      referenceRange: '4.0 - 11.0',
      status: 'high',
      trend: 'up',
      lastTest: 9.2,
      lastTestDate: '2024-06-15'
    },
    {
      id: '3',
      testName: 'Platelets',
      value: 180,
      unit: 'K/μL',
      referenceRange: '150 - 450',
      status: 'normal',
      trend: 'stable',
      lastTest: 175,
      lastTestDate: '2024-06-15'
    },
    {
      id: '4',
      testName: 'Glucose (Fasting)',
      value: 95,
      unit: 'mg/dL',
      referenceRange: '70 - 100',
      status: 'normal',
      trend: 'down',
      lastTest: 105,
      lastTestDate: '2024-06-15'
    },
    {
      id: '5',
      testName: 'Creatinine',
      value: 1.8,
      unit: 'mg/dL',
      referenceRange: '0.6 - 1.2',
      status: 'high',
      trend: 'up',
      lastTest: 1.5,
      lastTestDate: '2024-06-15'
    },
    {
      id: '6',
      testName: 'Cholesterol Total',
      value: 220,
      unit: 'mg/dL',
      referenceRange: '< 200',
      status: 'high',
      trend: 'up',
      lastTest: 195,
      lastTestDate: '2024-06-15'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-orange-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />
      case 'stable': return <div className="w-4 h-4 border-t-2 border-gray-400"></div>
      default: return null
    }
  }

  const filteredResults = bloodTestResults.filter(result => {
    const matchesSearch = result.testName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedTest === 'all' || result.status === selectedTest
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <ActivitySquare className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Analyzer</h1>
          <p className="text-gray-600">Analyze and track your blood test results</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for specific tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Results</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="low">Low</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">3</h3>
          <p className="text-sm text-gray-600">Normal Results</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">3</h3>
          <p className="text-sm text-gray-600">Abnormal Results</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">4</h3>
          <p className="text-sm text-gray-600">Trending Up</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Info className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">6</h3>
          <p className="text-sm text-gray-600">Total Tests</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Blood Test Results</h3>
          <p className="text-sm text-gray-600">Latest results from June 20, 2024</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{result.testName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {result.value} {result.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{result.referenceRange}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(result.trend)}
                      <span className="text-sm text-gray-600 capitalize">{result.trend}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.lastTest ? (
                      <div className="text-sm text-gray-600">
                        {result.lastTest} {result.unit}
                        <div className="text-xs text-gray-500">{result.lastTestDate}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No previous data</span>
                    )}
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
          Export Results
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          Schedule Next Test
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
          Share with Doctor
        </Button>
      </div>
    </div>
  )
}
