"use client"

import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle, Clock, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScreeningRecommendation {
  id: string
  type: string
  category: 'cancer' | 'cardiovascular' | 'respiratory' | 'general'
  priority: 'high' | 'medium' | 'low'
  dueDate: string
  lastScreening?: string
  frequency: string
  description: string
  riskFactors: string[]
  status: 'due' | 'overdue' | 'upcoming' | 'completed'
}

export default function ScreeningRecsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  const recommendations: ScreeningRecommendation[] = [
    {
      id: '1',
      type: 'Lung Cancer Screening',
      category: 'cancer',
      priority: 'high',
      dueDate: '2024-07-15',
      lastScreening: '2023-07-15',
      frequency: 'Annual',
      description: 'Low-dose CT scan for early detection of lung cancer in high-risk individuals',
      riskFactors: ['Smoking history', 'Age 55+', 'Family history'],
      status: 'due'
    },
    {
      id: '2',
      type: 'Colonoscopy',
      category: 'cancer',
      priority: 'medium',
      dueDate: '2024-09-20',
      lastScreening: '2019-09-20',
      frequency: 'Every 5 years',
      description: 'Colon cancer screening for adults 45+',
      riskFactors: ['Age 45+', 'Family history', 'Previous polyps'],
      status: 'upcoming'
    },
    {
      id: '3',
      type: 'Mammogram',
      category: 'cancer',
      priority: 'medium',
      dueDate: '2024-08-10',
      lastScreening: '2023-08-10',
      frequency: 'Annual',
      description: 'Breast cancer screening for women 40+',
      riskFactors: ['Age 40+', 'Family history', 'Dense breast tissue'],
      status: 'upcoming'
    },
    {
      id: '4',
      type: 'Blood Pressure Check',
      category: 'cardiovascular',
      priority: 'low',
      dueDate: '2024-07-01',
      lastScreening: '2024-04-01',
      frequency: 'Every 3 months',
      description: 'Regular blood pressure monitoring',
      riskFactors: ['Hypertension', 'Age 40+', 'Obesity'],
      status: 'overdue'
    },
    {
      id: '5',
      type: 'Cholesterol Panel',
      category: 'cardiovascular',
      priority: 'medium',
      dueDate: '2024-08-15',
      lastScreening: '2023-08-15',
      frequency: 'Annual',
      description: 'Lipid profile assessment for heart disease risk',
      riskFactors: ['High cholesterol', 'Heart disease history', 'Diabetes'],
      status: 'upcoming'
    },
    {
      id: '6',
      type: 'Spirometry Test',
      category: 'respiratory',
      priority: 'high',
      dueDate: '2024-06-30',
      lastScreening: '2023-06-30',
      frequency: 'Annual',
      description: 'Lung function test for COPD and asthma monitoring',
      riskFactors: ['COPD', 'Asthma', 'Smoking history'],
      status: 'overdue'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due': return 'text-blue-600 bg-blue-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      case 'upcoming': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cancer': return <Shield className="w-5 h-5" />
      case 'cardiovascular': return <TrendingUp className="w-5 h-5" />
      case 'respiratory': return <AlertTriangle className="w-5 h-5" />
      case 'general': return <CheckCircle className="w-5 h-5" />
      default: return <Shield className="w-5 h-5" />
    }
  }

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory
    const matchesPriority = selectedPriority === 'all' || rec.priority === selectedPriority
    return matchesCategory && matchesPriority
  })

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Screening Recommendations</h1>
          <p className="text-gray-600">Personalized health screening schedule and recommendations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="cancer">Cancer Screenings</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="respiratory">Respiratory</option>
            <option value="general">General Health</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">2</h3>
          <p className="text-sm text-gray-600">Overdue</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">1</h3>
          <p className="text-sm text-gray-600">Due Soon</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">3</h3>
          <p className="text-sm text-gray-600">Upcoming</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">6</h3>
          <p className="text-sm text-gray-600">Total Screenings</p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getCategoryIcon(rec.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.type}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rec.status)}`}>
                      {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{rec.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                    <span>Frequency: {rec.frequency}</span>
                    {rec.lastScreening && <span>Last: {rec.lastScreening}</span>}
                    <span>Due: {rec.dueDate}</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Risk Factors:</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.riskFactors.map((factor, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">
                  {rec.status === 'overdue' ? (
                    <span className="text-red-600 font-medium">Overdue by {Math.abs(getDaysUntilDue(rec.dueDate))} days</span>
                  ) : rec.status === 'due' ? (
                    <span className="text-blue-600 font-medium">Due in {getDaysUntilDue(rec.dueDate)} days</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">Due in {getDaysUntilDue(rec.dueDate)} days</span>
                  )}
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg">
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg">
          Schedule All Due
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          Update Preferences
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          Export Schedule
        </Button>
      </div>
    </div>
  )
}
