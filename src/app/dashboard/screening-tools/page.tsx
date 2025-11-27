"use client"

import { Scan, Brain, Heart, Wind, Eye, Shield, Clock, ArrowRight, Activity, FileText, Users } from "lucide-react"
import { useRouter } from "next/navigation"

const screeningTools = [
  {
    id: "ct-scan",
    title: "CT Scan",
    description: "Comprehensive computed tomography screening for early cancer detection",
    icon: Scan,
    color: "purple",
    features: ["Full body screening", "3D imaging", "Contrast enhanced"],
    duration: "15-30 minutes",
    preparation: "Fasting required"
  },
  {
    id: "mri-scan", 
    title: "MRI Scan",
    description: "Magnetic resonance imaging for detailed soft tissue analysis",
    icon: Brain,
    color: "blue",
    features: ["High resolution", "No radiation", "Multi-plane imaging"],
    duration: "30-60 minutes", 
    preparation: "Remove metal objects"
  },
  {
    id: "mammography",
    title: "Mammography",
    description: "Specialized breast cancer screening and diagnostic imaging",
    icon: Heart,
    color: "pink",
    features: ["Digital imaging", "3D tomosynthesis", "Low dose radiation"],
    duration: "10-20 minutes",
    preparation: "No deodorant/powder"
  },
  {
    id: "lung-screening",
    title: "Lung Screening",
    description: "Low-dose CT screening for lung cancer in high-risk patients",
    icon: Wind,
    color: "green",
    features: ["Low radiation dose", "Early detection", "Risk assessment"],
    duration: "5-10 minutes",
    preparation: "No special preparation"
  },
  {
    id: "colonoscopy",
    title: "Colonoscopy",
    description: "Comprehensive colorectal cancer screening and polyp removal",
    icon: Activity,
    color: "orange",
    features: ["Direct visualization", "Biopsy capability", "Polyp removal"],
    duration: "30-60 minutes",
    preparation: "Bowel preparation required"
  },
  {
    id: "pap-smear",
    title: "Pap Smear",
    description: "Cervical cancer screening test for early detection",
    icon: Shield,
    color: "teal",
    features: ["HPV testing", "Liquid-based cytology", "Quick results"],
    duration: "5-10 minutes",
    preparation: "Avoid douching 48hrs prior"
  }
]

const stats = [
  {
    title: "Screenings Completed",
    value: "1,247",
    change: "+12.3%",
    icon: FileText,
    color: "purple"
  },
  {
    title: "Early Detections",
    value: "89",
    change: "+8.7%", 
    icon: Eye,
    color: "green"
  },
  {
    title: "Patients Screened",
    value: "892",
    change: "+15.2%",
    icon: Users,
    color: "blue"
  },
  {
    title: "Follow-ups Scheduled",
    value: "156",
    change: "+5.4%",
    icon: Clock,
    color: "orange"
  }
]

export default function ScreeningToolsPage() {
  const router = useRouter()

  const handleToolClick = (toolId: string) => {
    if (toolId === 'mri-scan') {
      router.push('/dashboard/screening-tools/mri-analysis')
    } else {
      // For other tools, you can add specific navigation or show a modal
      console.log(`Clicked on ${toolId}`)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancer Screening Tools</h1>
        <p className="text-base leading-relaxed text-gray-600">
          Comprehensive screening solutions for early cancer detection and prevention
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'purple' ? 'bg-purple-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'blue' ? 'bg-blue-100' :
                'bg-orange-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'purple' ? 'text-purple-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'blue' ? 'text-blue-600' :
                  'text-orange-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Screening Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screeningTools.map((tool) => (
          <div key={tool.id} onClick={() => handleToolClick(tool.id)} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group cursor-pointer">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                tool.color === 'purple' ? 'bg-purple-100' :
                tool.color === 'blue' ? 'bg-blue-100' :
                tool.color === 'pink' ? 'bg-pink-100' :
                tool.color === 'green' ? 'bg-green-100' :
                tool.color === 'orange' ? 'bg-orange-100' :
                'bg-teal-100'
              }`}>
                <tool.icon className={`w-6 h-6 ${
                  tool.color === 'purple' ? 'text-purple-600' :
                  tool.color === 'blue' ? 'text-blue-600' :
                  tool.color === 'pink' ? 'text-pink-600' :
                  tool.color === 'green' ? 'text-green-600' :
                  tool.color === 'orange' ? 'text-orange-600' :
                  'text-teal-600'
                }`} />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h4>
              <ul className="space-y-1">
                {tool.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Details */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">{tool.duration}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Preparation:</span>
                <span className="font-medium text-gray-900">{tool.preparation}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToolClick(tool.id)
              }}
              className="btn-primary w-full mt-4">
              {tool.id === 'mri-scan' ? 'Start Analysis' : 'Schedule Screening'}
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-base text-gray-600">Common screening workflows and resources</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Risk Assessment</h3>
            </div>
            <p className="text-sm text-gray-600">Evaluate patient risk factors for personalized screening</p>
          </button>

          <button className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Schedule Follow-up</h3>
            </div>
            <p className="text-sm text-gray-600">Book follow-up appointments based on results</p>
          </button>

          <button className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">View Results</h3>
            </div>
            <p className="text-sm text-gray-600">Access and review screening test results</p>
          </button>
        </div>
      </div>
    </div>
  )
}
