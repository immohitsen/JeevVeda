import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, FileText, Stethoscope, Calendar, User, Hash, Clock } from "lucide-react"
import Link from "next/link"



// Mock patient data - in a real app, this would come from your database
const patientData = {
  name: "Sarah Johnson",
  age: 42,
  gender: "Female",
  patientId: "PT-2024-001",
  lastScanDate: "March 15, 2024",
}

const tools = [
  {
    id: 1,
    name: "Blood Report Analyzer",
    description: "Upload your blood test report and let the AI detect early cancer signs.",
    route: "/blood-analyzer",
    icon: Activity,
    color: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 2,
    name: "AI Symptom Checker",
    description: "Enter symptoms and get AI-based risk assessments.",
    route: "/symptom-checker",
    icon: Stethoscope,
    color: "bg-green-50 border-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 3,
    name: "Screening Recommendations",
    description: "Personalized cancer screening suggestions based on your medical data.",
    route: "/screening-recs",
    icon: Calendar,
    color: "bg-purple-50 border-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: 4,
    name: "History & Reports",
    description: "Access previous results, risk trends, and downloaded reports.",
    route: "/report-history",
    icon: FileText,
    color: "bg-orange-50 border-orange-100",
    iconColor: "text-orange-600",
  },
]

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Welcome back, {patientData.name.split(" ")[0]}</h1>
          <p className="text-slate-600">Your health dashboard is ready. Choose a tool below to get started.</p>
        </div>

        {/* Patient Details Card */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <User className="h-5 w-5 text-slate-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="text-lg font-semibold text-slate-900">{patientData.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Age</p>
                <p className="text-lg font-semibold text-slate-900">{patientData.age} years</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Gender</p>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                  {patientData.gender}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Patient ID
                </p>
                <p className="text-lg font-mono text-slate-900">{patientData.patientId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Scan
                </p>
                <p className="text-lg font-semibold text-slate-900">{patientData.lastScanDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Section */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Cancer Detection Tools</h2>
          <p className="text-slate-600 mb-6">Select a tool to begin your health assessment</p>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <Card
                  key={tool.id}
                  className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02] ${tool.color}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white shadow-sm ${tool.iconColor}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-slate-800">
                            {tool.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-slate-600 mb-6 leading-relaxed">
                      {tool.description}
                    </CardDescription>
                    <Link href={tool.route}>
                      <Button
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all duration-200 hover:shadow-md"
                        size="lg"
                      >
                        Open Tool
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              This dashboard provides AI-powered health insights. Always consult with healthcare professionals for
              medical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
